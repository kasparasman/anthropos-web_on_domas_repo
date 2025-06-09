import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { buffer } from 'micro';
import { createStripeClient } from '@/lib/stripe/factory';
import { prisma } from '@/lib/prisma';
import { generateAvatar } from '@/lib/services/avatarService';
import { generateUniqueNickname } from '@/lib/services/nicknameService';
import { getPromptForStyle } from '@/lib/services/promptService';
import { admin } from '@/lib/firebase-admin';
import { withPrismaRetry } from '@/lib/prisma/util';
import { Profile } from '@prisma/client';

const stripe = createStripeClient();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

if (!webhookSecret) {
    throw new Error("Stripe webhook secret is not set in environment variables.");
}

export const config = {
    api: {
        bodyParser: false, // We need the raw body to verify the signature
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Stripe webhook signature verification failed: ${errorMessage}`);
        return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    console.log(`✅ Received Stripe event: ${event.type}`, event.id);

    try {
        switch (event.type) {
            case 'invoice.paid':
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                if (!customerId) {
                    console.error('Webhook Error: No customer ID on the invoice.', { id: invoice.id });
                    return res.status(400).send('Webhook Error: Missing customer ID.');
                }
                
                const profile: (Profile & { styleId?: string | null }) | null = await withPrismaRetry(() => prisma.profile.findFirst({
                    where: { stripeCustomerId: customerId },
                }));

                // --- New User Activation Flow ---
                if (profile && profile.status === 'PENDING_PAYMENT') {
                    // First, update the status to show that generation is in progress.
                    // This is a quick operation.
                    await withPrismaRetry(
                        () => prisma.profile.update({
                            where: { id: profile.id },
                            data: { status: 'GENERATING_ASSETS' },
                        })
                    );
                    console.log(`🚀 Set status to GENERATING_ASSETS for user ${profile.id}. Triggering background job.`);

                    // Now, trigger the background job. We DO NOT wait for it to finish.
                    // This is a "fire-and-forget" call.
                    const generatorUrl = new URL('/api/user/generate-assets', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').toString();
                    
                    fetch(generatorUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: profile.id }),
                    }).catch(error => {
                        // If the trigger fails, we should log it, but the user is in a recoverable state.
                        console.error(`CRITICAL: Failed to trigger asset generator for user ${profile.id}`, error);
                    });
                    
                    // Respond to Stripe immediately.
                    console.log(`✅ Webhook finished for ${profile.id}. Background job is running.`);

                // --- Recurring Payment for Existing User ---
                } else if (profile) {
                    console.log(`Renewing subscription for ${profile.id}. Ensuring status is ACTIVE.`);
                    await withPrismaRetry(() => prisma.profile.update({
                        where: { id: profile.id },
                        data: { status: 'ACTIVE' }, // Ensure they are active on renewal
                    }));
                } else {
                    console.warn(`Webhook received for unknown customer ID: ${customerId}`);
                }
                break;
            }
            case 'invoice.payment_failed': {
                const failedInvoice = event.data.object as Stripe.Invoice;
                const failedCustomerId = failedInvoice.customer as string;

                if (!failedCustomerId) {
                    console.error('Webhook Error: No customer ID on the failed invoice.', { id: failedInvoice.id });
                    return res.status(400).send('Webhook Error: Missing customer ID on failed invoice.');
                }
                
                // Find the user profile, specifically one that is waiting for payment
                const failedProfile: Profile | null = await withPrismaRetry(() => prisma.profile.findFirst({
                    where: { 
                        stripeCustomerId: failedCustomerId,
                        status: 'PENDING_PAYMENT' 
                    },
                }));

                if (failedProfile) {
                    console.log(`❌ Payment failed for new user ${failedProfile.id}. Rolling back registration.`);

                    // --- Full Rollback Logic ---
                    try {
                        // 1. Delete Prisma Profile
                        await withPrismaRetry(() => prisma.profile.delete({ where: { id: failedProfile.id } }));
                        console.log(`🗑️  Deleted Prisma profile for user ${failedProfile.id}.`);
                        
                        // 2. Delete Firebase User
                        await admin.auth().deleteUser(failedProfile.id);
                        console.log(`🗑️  Deleted Firebase auth user ${failedProfile.id}.`);
                        
                        // 3. Delete Stripe Customer
                        await stripe.customers.del(failedCustomerId);
                        console.log(`🗑️  Deleted Stripe customer ${failedCustomerId}.`);

                    } catch (rollbackError) {
                        console.error(`💀 CRITICAL: Rollback failed for user ${failedProfile.id}. Manual cleanup required.`, rollbackError);
                        // Still return 200 so Stripe doesn't retry a failed state
                    }
                } else {
                     console.log(`Payment failed for customer ${failedCustomerId}, but no matching PENDING_PAYMENT profile found. Ignoring.`);
                }
                break;
            }
            case 'customer.subscription.deleted':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const newStatus = subscription.status.toUpperCase().replace('-', '_');
                
                const dataToUpdate: { status: string; stripeCurrentPeriodEnd?: Date } = {
                    status: newStatus,
                };

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                const periodEndUnix = (subscription as any).current_period_end as number | undefined;
                if (typeof periodEndUnix === 'number') {
                    dataToUpdate.stripeCurrentPeriodEnd = new Date(periodEndUnix * 1000);
                }

                // Avoid overwriting the PENDING_PAYMENT state for new users awaiting activation.
                const updateResult = await withPrismaRetry(() => prisma.profile.updateMany({
                    where: {
                        stripeSubscriptionId: subscription.id,
                        // Only update if the profile is NOT still awaiting activation.
                        NOT: { status: 'PENDING_PAYMENT' },
                    },
                    data: dataToUpdate,
                })) as { count: number };

                if (updateResult.count > 0) {
                    console.log(`Updated subscription status for ${subscription.id} to ${newStatus} on ${updateResult.count} profile(s).`);
                } else {
                    console.log(`Skipped status update for subscription ${subscription.id} because associated profile(s) are still pending activation.`);
                }
                break;
            }
            default:
                console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
        }
    } catch (dbError) {
        console.error('Webhook handler database error:', dbError);
        return res.status(500).json({ error: 'Server error while processing webhook.' });
    }

    res.json({ received: true });
};

export default handler;