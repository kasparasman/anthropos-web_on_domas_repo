import { Stripe } from 'stripe';
import { prisma } from '@/lib/prisma';
import { admin } from '@/lib/firebase-admin';
import { withPrismaRetry } from '@/lib/prisma/util';
import { createStripeClient } from '@/lib/stripe/factory';
import { Profile } from '@prisma/client';
import { Client as QStash } from "@upstash/qstash";
import { generateAndActivateUser } from '@/lib/services/assetService';
import { advanceRegState } from '@/lib/prisma/stateMachine';
import type { RegistrationStatus } from '@prisma/client';

const stripe = createStripeClient();
const qstash = new QStash({
    token: process.env.QSTASH_TOKEN!,      // ← throws early if missing
  });
  
/**
 * Handles subscription-related events ('customer.subscription.created', 'updated', 'deleted').
 * @param subscription - The Stripe Subscription object from the webhook event.
 */
export async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    /* --------------------------------------------------------------------------
     * STATUS = active  ➜  First successful payment on a brand-new subscription.
     * We *usually* process this via PaymentIntent / Invoice handlers, but those
     * occasionally miss the subscription ID.  As a safety-net, if we still have
     * a PENDING_PAYMENT profile, perform full activation here.
     * ------------------------------------------------------------------------*/
    if (subscription.status === 'active') {
        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
            console.warn(`[Webhook] subscription.active received but no customer id on subscription ${subscription.id}`);
            return;
        }

        const pendingProfile = await withPrismaRetry(() => prisma.profile.findFirst({
            where: { stripeCustomerId: customerId, status: 'PENDING_PAYMENT' },
        })) as Profile | null;

        if (!pendingProfile) {
            // No pending profile; just ensure current_period_end is synced on existing profile(s)
            const cpEnd = getPeriodEnd(subscription);
            const sync = await withPrismaRetry(() => prisma.profile.updateMany({
                where: { stripeSubscriptionId: subscription.id },
                data: { stripeCurrentPeriodEnd: cpEnd },
            })) as { count: number };

            if (sync.count > 0) {
                console.log(`[Webhook] Synced subscription data for ${sync.count} profile(s) on subscription ${subscription.id}.`);
            } else {
                console.log(`Skipping 'active' for subscription ${subscription.id} – no relevant profiles to sync (legacy null fill removed).`);
            }
            return;
        }

        console.log(`[Webhook] 🔄 Fallback activation via subscription.updated(active) for user ${pendingProfile.id}`);

        // Guard: ensure prerequisite profile fields exist before asset generation
        if (!pendingProfile.tmpFaceUrl || !pendingProfile.styleId || !pendingProfile.gender) {
            console.warn(`[Webhook] Skipping asset generation for ${pendingProfile.id} – missing tmpFaceUrl/styleId/gender.`);
            // Still update status to SUBSCRIBED so polling continues; asset generation will be attempted later.
            const currentPeriodEnd = getPeriodEnd(subscription);
            await withPrismaRetry(() => prisma.profile.update({
                where: { id: pendingProfile.id },
                data: {
                    status: 'SUBSCRIBED',
                    stripeSubscriptionId: subscription.id,
                    stripeCurrentPeriodEnd: currentPeriodEnd,
                },
            }));
            return; // do not call startAssetGeneration now
        }

        const currentPeriodEnd = getPeriodEnd(subscription);

        await withPrismaRetry(() => prisma.profile.update({
            where: { id: pendingProfile.id },
            data: {
                status: 'SUBSCRIBED',
                stripeSubscriptionId: subscription.id,
                stripeCurrentPeriodEnd: currentPeriodEnd,
            },
        }));

        // Continue to asset generation (idempotent)
        await startAssetGeneration(pendingProfile.id);

        return; // done handling 'active'
    }

    // Map Stripe's status to our internal status enum.
    // Example: 'past_due' -> 'PAST_DUE', 'canceled' -> 'CANCELED'
    const newStatus = subscription.status.toUpperCase().replace('-', '_');

    const dataToUpdate: { status: string; stripeCurrentPeriodEnd?: Date, stripePriceId?: string } = {
        status: newStatus,
        stripePriceId: subscription.items.data[0]?.price.id,
    };

    const cpEndUpdate = getPeriodEnd(subscription);
    if (cpEndUpdate) {
        dataToUpdate.stripeCurrentPeriodEnd = cpEndUpdate;
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
        /* ----------------------------------------------
         * 1️⃣  Resolve subscriptionId (multi-strategy)
         * ---------------------------------------------- */

        // Emit full PI for deep debugging (be mindful of log noise in prod)
        if (process.env.STRIPE_DEBUG === 'true') {
            console.log('[Webhook-DBG] Full PaymentIntent:', JSON.stringify(paymentIntent, null, 2));
            console.log('[Webhook-DBG] API Version (event):', (paymentIntent as any).api_version);
        }

        let subscriptionId: string | null = null;
        let currentPeriodEnd: Date | null = null;
        let resolvedInvoiceId: string | null = null;

        /* 1a. Preferred: use invoice.subscription via expand */
        try {
            const expandedPi = await stripe.paymentIntents.retrieve(paymentIntent.id, {
                expand: ['invoice.subscription'],
            });

            // Stripe's TS types for PaymentIntent (preview) no longer expose `invoice`,
            // so we access it via an unsafe cast which we guard below.
            const invoiceObj = (expandedPi as any).invoice;
            if (invoiceObj && typeof invoiceObj !== 'string') {
                const invSub = (invoiceObj as any).subscription;
                console.log('[Webhook-DBG] invoice.subscription via expand →', invSub);
                if (invSub) {
                    subscriptionId = typeof invSub === 'string' ? invSub : invSub.id;
                }
                resolvedInvoiceId = invoiceObj.id;
            }
        } catch (expErr) {
            console.error('[Webhook] Expand retrieve of PaymentIntent failed', expErr);
        }

        /* 1b. Fallback: latest_charge → Charge → Invoice */
        if (!subscriptionId && paymentIntent.latest_charge) {
            try {
                const chargeId = typeof paymentIntent.latest_charge === 'string'
                    ? paymentIntent.latest_charge
                    : (paymentIntent.latest_charge as Stripe.Charge).id;

                console.log('[Webhook-DBG] latest_charge id →', chargeId);
                const charge = await stripe.charges.retrieve(chargeId, { expand: ['invoice'] });
                console.log('[Webhook-DBG] Full Charge:', JSON.stringify(charge, null, 2));

                const invRef = (charge as any).invoice;
                if (invRef) {
                    const invoiceId = typeof invRef === 'string' ? invRef : invRef.id;
                    console.log('[Webhook-DBG] invoiceId resolved →', invoiceId);
                    resolvedInvoiceId = invoiceId;
                    const invoice = await stripe.invoices.retrieve(invoiceId);
                    console.log('[Webhook-DBG] Full Invoice:', JSON.stringify(invoice, null, 2));

                    const invSub = (invoice as any).subscription;
                    console.log('[Webhook-DBG] Invoice.subscription field →', invSub);
                    if (typeof invSub === 'string') {
                        subscriptionId = invSub;
                    }
                }
            } catch (chargeErr) {
                console.error('[Webhook] Failed to resolve subscription from latest_charge path', chargeErr);
            }
        }

        /* 1c. Determine current_period_end if we now have subscriptionId */
        if (subscriptionId) {
            try {
                console.log('[Webhook-DBG] Resolved subscriptionId →', subscriptionId);
                const subResp = await stripe.subscriptions.retrieve(subscriptionId);
                const sub = subResp as unknown as Stripe.Subscription;
                console.log('[Webhook-DBG] Subscription object:', JSON.stringify(sub, null, 2));

                currentPeriodEnd = getPeriodEnd(sub);
            } catch (subErr) {
                console.error('[Webhook] Failed to retrieve subscription', subErr);
            }
        } else {
            console.warn('[Webhook] No subscriptionId found for PI', paymentIntent.id, '– will wait for invoice/customer.subscription events');
            return; // don't touch the DB yet
        }

        /* 2️⃣  advance saga to PAYMENT_SUCCEEDED and store subscription meta */
        await advanceRegState(profile.id, 'PAYMENT_SUCCEEDED' as RegistrationStatus, { subscriptionId, piId: paymentIntent.id, invoiceId: resolvedInvoiceId });

        /* 2️⃣b store legacy fields (to be removed later) */
        await withPrismaRetry(() =>
          prisma.profile.update({
            where: { id: profile.id },
            data: {
              status: 'SUBSCRIBED',
              stripeSubscriptionId: subscriptionId,
              stripeCurrentPeriodEnd: currentPeriodEnd,      // ← now set
              stripePaymentIntentId: paymentIntent.id,
              ...(resolvedInvoiceId ? { stripeInvoiceId: resolvedInvoiceId } : {}),
            },
          })
        );

        console.log(`🚀 User ${profile.id} successfully subscribed. Setting status to GENERATING_ASSETS and triggering background job.`);
        
        await startAssetGeneration(profile.id);
          
    } else if (paymentIntent.status === 'requires_payment_method') { // This is the status for a failure
        const failureReason = paymentIntent.last_payment_error?.message || 'No specific reason provided.';
        console.log(`❌ Payment failed for new user ${profile.id}. Reason: ${failureReason}. Rolling back registration.`);
        await rollbackRegistration(profile.id, customerId);
    }
}

// ----------------------------------------------------------------------------------
// New helper: activate subscription via `invoice.payment_succeeded`
// ----------------------------------------------------------------------------------
/**
 * Handles `invoice.payment_succeeded` events which reliably provide
 * `customer` and `subscription` IDs without the gymnastics of
 * navigating PaymentIntent ↔︎ Charge ↔︎ Invoice.
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    let customerId: string | undefined;
    if (invoice.customer) {
        customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
    } else {
        // Legacy alias invoice_payment.paid may omit customer; retrieve fresh invoice
        try {
            const refreshed = await stripe.invoices.retrieve(invoice.id as string, {
                expand: ['customer'],
            });
            if (refreshed.customer && typeof refreshed.customer !== 'string') {
                customerId = refreshed.customer.id;
            } else if (typeof refreshed.customer === 'string') {
                customerId = refreshed.customer;
            }
            invoice = refreshed; // use the enriched version for further fields
        } catch (e) {
            console.error('[Webhook] Failed to retrieve invoice for missing customer', e);
        }
    }

    if (!customerId) {
        console.error('[Webhook] invoice.payment_succeeded received with no customer id after refresh');
        return;
    }

    // primary or fallback extraction of subscriptionId
    let subscriptionId: string | undefined;
    const invSubRef: unknown = (invoice as any).subscription;
    if (invSubRef) {
        subscriptionId = typeof invSubRef === 'string' ? invSubRef : (invSubRef as Stripe.Subscription).id;
    }
    if (!subscriptionId && (invoice as any).parent?.subscription_details?.subscription) {
        const parentSub = (invoice as any).parent.subscription_details.subscription;
        if (typeof parentSub === 'string') subscriptionId = parentSub;
    }

    if (!subscriptionId) {
        // Can happen for one-off invoices; ignore.
        console.log('[Webhook] invoice.payment_succeeded ignored – no subscription on invoice');
        if (process.env.STRIPE_DEBUG === 'true') {
            console.log('[Webhook-DBG] Full Invoice object:', JSON.stringify(invoice, null, 2));
            console.log('[Webhook-DBG] invoice.billing_reason →', invoice.billing_reason);
        }
        return;
    }

    // Find the pending profile for this customer.
    const profile = await withPrismaRetry(() => prisma.profile.findFirst({
        where: { stripeCustomerId: customerId, status: 'PENDING_PAYMENT' },
    })) as Profile | null;

    if (!profile) {
        console.log(`[Webhook] invoice.payment_succeeded for ${customerId} – no matching PENDING_PAYMENT profile. Probably already handled.`);
        return;
    }

    // Advance saga state
    await advanceRegState(profile.id, 'PAYMENT_SUCCEEDED' as RegistrationStatus, { subscriptionId, invoiceId: invoice.id });

    // Retrieve subscription to get current_period_end
    let currentPeriodEnd: Date | null = null;
    try {
        const subResp = await stripe.subscriptions.retrieve(subscriptionId);
        const sub = subResp as unknown as Stripe.Subscription;
        currentPeriodEnd = getPeriodEnd(sub);
    } catch (err) {
        console.error('[Webhook] Failed to fetch subscription for invoice handler', err);
    }

    await withPrismaRetry(() => prisma.profile.update({
        where: { id: profile.id },
        data: {
            status: 'SUBSCRIBED',
            stripeSubscriptionId: subscriptionId,
            stripeCurrentPeriodEnd: currentPeriodEnd,
            stripeInvoiceId: invoice.id,
            ...(invoice.payment_intent && typeof invoice.payment_intent === 'string' ? { stripePaymentIntentId: invoice.payment_intent } : {}),
        },
    }));

    console.log(`🚀(invoice) User ${profile.id} now SUBSCRIBED – attempting asset generation.`);

    await startAssetGeneration(profile.id);
}

// -----------------------------------------------------------------------------
// Atomic asset-generation trigger
// -----------------------------------------------------------------------------
async function startAssetGeneration(profileId: string): Promise<void> {
    try {
        await advanceRegState(profileId, 'AVATAR_JOB_ENQUEUED' as RegistrationStatus);
    } catch (err) {
        if ((err as any).code === 'P2025' || (err as Error).message?.includes('noop')) {
            console.log(`[Webhook] Asset generation already started for ${profileId}. Skipping duplicate.`);
            return;
        }
        throw err;
    }

    // We won the race – perform generation or queue job
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_QSTASH === 'true') {
        console.log(`[Webhook] DEV/SKIP_QSTASH ⇒ running asset generation synchronously for user ${profileId}`);
        await generateAndActivateUser(profileId);
    } else {
        await qstash.publishJSON({
            url: (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.anthroposcity.com').replace(/\/$/, '') + '/api/user/generate-assets',
            body: { userId: profileId },
            retries: 3,
        });
        console.log(`[Webhook] ✅ QStash message published for user ${profileId}.`);
    }
}

// ----------------------------------------------------------------------------------
// 🛠️  Helper: Extracts the current_period_end from the first subscription item.
// In Basil (2025-03-31+) the top-level `current_period_end` field was removed
// from the Subscription object.  We now pull it from the first subscription item
// (identical for single-price subscriptions). If the field is absent we return
// `null` so DB updates stay consistent with cancellable trials, etc.
function getPeriodEnd(sub: Stripe.Subscription): Date | null {
  const unix = sub.items?.data?.[0]?.current_period_end;
  return unix ? new Date(unix * 1000) : null;
} 