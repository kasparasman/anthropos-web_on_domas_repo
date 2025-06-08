import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { buffer } from 'micro';
import { createStripeClient } from '@/lib/stripe/factory';
import { prisma } from '@/lib/prisma';
import { generateAvatar } from '@/lib/services/avatarService';
import { generateUniqueNickname } from '@/lib/services/nicknameService';
import { getPromptForStyle } from '@/lib/services/promptService';
import { admin } from '@/lib/firebase-admin';

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
            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                if (!customerId) {
                    console.error('Webhook Error: No customer ID on the invoice.', { id: invoice.id });
                    return res.status(400).send('Webhook Error: Missing customer ID.');
                }
                
                const profile = await prisma.profile.findFirst({
                    where: { stripeCustomerId: customerId },
                });

                // --- New User Activation Flow ---
                if (profile && profile.status === 'PENDING_PAYMENT') {
                    if (!profile.tmpFaceUrl || !profile.styleId || !profile.gender) {
                        console.error(`Profile ${profile.id} is missing required data for activation.`, {
                            hasFace: !!profile.tmpFaceUrl,
                            hasStyle: !!profile.styleId,
                            hasGender: !!profile.gender,
                        });
                        // Don't throw, just log and exit. Prevents Stripe from retrying a doomed request.
                        return res.status(200).send('Profile data missing, cannot activate.');
                    }
                    
                    console.log(`🚀 Activating profile for user ${profile.id}...`);
                    
                    try {
                        // Step 1: Generate the Avatar
                        const avatarUrl = await generateAvatar(profile.tmpFaceUrl, profile.styleId);
                        
                        // Step 2: Determine Archetype for Nickname Generation
                        const { archetype } = getPromptForStyle(profile.styleId);

                        // Step 3: Generate a Unique Nickname
                        const nickname = await generateUniqueNickname({
                            avatarUrl,
                            gender: profile.gender as 'male' | 'female',
                            archetype,
                        });

                        // Step 4: Update Profile to ACTIVE
                        await prisma.profile.update({
                            where: { id: profile.id },
                            data: {
                                status: 'ACTIVE',
                                avatarUrl: avatarUrl,
                                nickname: nickname,
                                tmpFaceUrl: null, // Clean up temporary data
                                styleId: null, // Clean up temporary data
                            },
                        });
                        console.log(`✅ Successfully activated profile for user ${profile.id} with nickname "${nickname}"`);

                    } catch (generationError) {
                        console.error(`❌ Failed to generate avatar or nickname for user ${profile.id}:`, generationError);
                        // Update status to FAILED so we know not to retry this user automatically.
                        await prisma.profile.update({
                            where: { id: profile.id },
                            data: { status: 'ACTIVATION_FAILED' },
                        });

                        // --- Compensation logic: refund and cleanup ---
                        try {
                            const invoiceIds = invoice as unknown as { payment_intent?: string; subscription?: string };
                            const paymentIntentId = invoiceIds.payment_intent;
                            if (paymentIntentId) {
                                await stripe.refunds.create({ payment_intent: paymentIntentId });
                                console.log(`💸 Issued refund for user ${profile.id}`);
                            }

                            const subscriptionId = invoiceIds.subscription;
                            if (subscriptionId) {
                                // Some Stripe typings may not include the `.del` method on subscriptions.
                                // Use a safe cast to access it.
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-explicit-any
                                await (stripe.subscriptions as unknown as { del: (id: string) => Promise<Stripe.Subscription> }).del(subscriptionId);
                                console.log(`✂️  Cancelled subscription ${subscriptionId} for user ${profile.id}`);
                            }
                        } catch (compErr) {
                            console.error(`⚠️  Compensation steps (refund/cancel) failed for user ${profile.id}:`, compErr);
                        }

                        // Delete the Firebase auth user so they can restart the flow
                        try {
                            await admin.auth().deleteUser(profile.id);
                            console.log(`🗑️  Deleted Firebase user ${profile.id} after failed activation.`);
                        } catch (firebaseErr) {
                            console.error(`⚠️  Failed to delete Firebase user ${profile.id}:`, firebaseErr);
                        }

                        // Return 200 to Stripe so it doesn't keep retrying a failed generation.
                        return res.status(200).send('Activation failed during generation step.');
                    }

                // --- Recurring Payment for Existing User ---
                } else if (profile) {
                    console.log(`Renewing subscription for ${profile.id}. Ensuring status is ACTIVE.`);
                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: { status: 'ACTIVE' }, // Ensure they are active on renewal
                    });
                } else {
                    console.warn(`Webhook received for unknown customer ID: ${customerId}`);
                }
                break;

            case 'customer.subscription.deleted':
            case 'customer.subscription.updated':
                const subscription = event.data.object as unknown as { id: string; status: string; current_period_end: number };
                const newStatus = subscription.status.toUpperCase().replace('-', '_');
                // Avoid overwriting the PENDING_PAYMENT state for new users awaiting activation.
                const updateResult = await prisma.profile.updateMany({
                    where: {
                        stripeSubscriptionId: subscription.id,
                        // Only update if the profile is NOT still awaiting activation.
                        NOT: { status: 'PENDING_PAYMENT' },
                    },
                    data: {
                        status: newStatus,
                        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });

                if (updateResult.count > 0) {
                    console.log(`Updated subscription status for ${subscription.id} to ${newStatus} on ${updateResult.count} profile(s).`);
                } else {
                    console.log(`Skipped status update for subscription ${subscription.id} because associated profile(s) are still pending activation.`);
                }
                break;

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