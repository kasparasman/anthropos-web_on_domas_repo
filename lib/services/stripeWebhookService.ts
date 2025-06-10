import { Stripe } from 'stripe';
import { prisma } from '@/lib/prisma';
import { admin } from '@/lib/firebase-admin';
import { withPrismaRetry } from '@/lib/prisma/util';
import { createStripeClient } from '@/lib/stripe/factory';
import { Profile } from '@prisma/client';

const stripe = createStripeClient();

/**
 * Handles subscription-related events ('customer.subscription.created', 'updated', 'deleted').
 * @param subscription - The Stripe Subscription object from the webhook event.
 */
export async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    // We only want to handle cancellations or other non-activating status changes here.
    // The initial activation is handled by `handlePaymentIntentUpdate`.
    if (subscription.status === 'active') {
        console.log(`Skipping 'active' status update for subscription ${subscription.id} via webhook. This is handled by the initial payment success event.`);
        return;
    }

    // Map Stripe's status to our internal status enum.
    // Example: 'past_due' -> 'PAST_DUE', 'canceled' -> 'CANCELED'
    const newStatus = subscription.status.toUpperCase().replace('-', '_');

    const dataToUpdate: { status: string; stripeCurrentPeriodEnd?: Date, stripePriceId?: string } = {
        status: newStatus,
        stripePriceId: subscription.items.data[0]?.price.id,
    };

    if (subscription.current_period_end) {
        dataToUpdate.stripeCurrentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }

    const result = await withPrismaRetry(() => prisma.profile.updateMany({
        where: { 
            stripeSubscriptionId: subscription.id,
            NOT: { status: 'PENDING_PAYMENT' }
        },
        data: dataToUpdate,
    })) as { count: number };

    if (result.count > 0) {
        console.log(`Updated subscription ${subscription.id} to status ${newStatus} for ${result.count} profile(s).`);
    } else {
        console.log(`Skipped status update for subscription ${subscription.id}, as profile is likely pending activation or no profile was found.`);
    }
}

/**
 * Rolls back a failed registration by deleting the user from Prisma, Firebase, and Stripe.
 * @param profileId - The user's profile ID.
 * @param customerId - The Stripe customer ID.
 */
async function rollbackRegistration(profileId: string, customerId: string): Promise<void> {
    try {
        await withPrismaRetry(() => prisma.profile.delete({ where: { id: profileId } }));
        console.log(`🗑️ Deleted Prisma profile for user ${profileId}.`);

        await admin.auth().deleteUser(profileId);
        console.log(`🗑️ Deleted Firebase auth user ${profileId}.`);
        
        try {
            await stripe.customers.del(customerId);
            console.log(`🗑️ Deleted Stripe customer ${customerId}.`);
        } catch (stripeErr: unknown) {
             if ((stripeErr as Stripe.errors.StripeError).code !== 'resource_missing') {
                throw stripeErr; // Re-throw if it's not a "not found" error
             }
             console.log(`Stripe customer ${customerId} was already deleted or never existed.`)
        }

    } catch (rollbackError) {
        console.error(`💀 CRITICAL: Rollback failed for user ${profileId}. Manual cleanup required.`, rollbackError);
    }
}

/**
 * Handles PaymentIntent events, specifically for activating new users or rolling back failed payments.
 * @param paymentIntent - The Stripe PaymentIntent object from the webhook event.
 */
export async function handlePaymentIntentUpdate(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const customerId = paymentIntent.customer as string;

    if (!customerId) {
        console.error('Webhook Error: No customer ID on the PaymentIntent.', { id: paymentIntent.id });
        return;
    }

    const profile: Profile | null = await withPrismaRetry(() => prisma.profile.findFirst({
        where: { stripeCustomerId: customerId, status: 'PENDING_PAYMENT' },
    }));

    if (!profile) {
        console.log(`Webhook for PI ${paymentIntent.id} received, but no matching PENDING_PAYMENT profile found for customer ${customerId}. Ignoring.`);
        return;
    }

    if (paymentIntent.status === 'succeeded') {
        // This is the single source of truth for activating a user after payment.
        await withPrismaRetry(() => prisma.profile.update({
            where: { id: profile.id },
            data: { 
                status: 'SUBSCRIBED', // First, confirm subscription
                stripeSubscriptionId: paymentIntent.invoice ? (typeof paymentIntent.invoice === 'string' ? paymentIntent.invoice : paymentIntent.invoice.subscription) as string : null,
            },
        }));

        console.log(`🚀 User ${profile.id} successfully subscribed. Setting status to GENERATING_ASSETS and triggering background job.`);
        
        // Now, set status to generating and hand off the job to QStash
        await withPrismaRetry(() => prisma.profile.update({
            where: { id: profile.id },
            data: { status: 'GENERATING_ASSETS' },
        }));

        // --- NEW QSTASH LOGIC ---
        // We hand off the job to QStash for reliable background processing.
        const qstashBaseUrl = process.env.QSTASH_URL;
        const qstashToken = process.env.QSTASH_TOKEN;
        
        if (!qstashBaseUrl || !qstashToken) {
            console.error('❌ CRITICAL: QSTASH_URL or QSTASH_TOKEN is not set. Cannot queue asset generation.');
            // In a real app, you might want to mark the profile as failed here.
            return;
        }

        // The publish endpoint is at the /v2/publish path
        const qstashUrl = new URL('/v2/publish', qstashBaseUrl).toString();

        // The target URL for the job is our own API endpoint.
        const targetUrl = new URL('/api/user/generate-assets', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').toString();

        try {
            const response = await fetch(qstashUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${qstashToken}`,
                    'Upstash-Target': targetUrl,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: profile.id }),
            });

            if (response.ok) {
                console.log(`[Webhook] ✅ Successfully queued asset generation for user ${profile.id} with QStash. Message ID: ${(await response.json()).messageId}`);
            } else {
                console.error(`[Webhook] ❌ CRITICAL: Failed to queue job with QStash for user ${profile.id}. Status: ${response.status}`, await response.text());
            }
        } catch (error) {
            console.error(`[Webhook] ❌ CRITICAL: fetch() call to QStash failed for user ${profile.id}.`, error);
        }
        // --- END QSTASH LOGIC ---

    } else if (paymentIntent.status === 'requires_payment_method') { // This is the status for a failure
        const failureReason = paymentIntent.last_payment_error?.message || 'No specific reason provided.';
        console.log(`❌ Payment failed for new user ${profile.id}. Reason: ${failureReason}. Rolling back registration.`);
        await rollbackRegistration(profile.id, customerId);
    }
} 