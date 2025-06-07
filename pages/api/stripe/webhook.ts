import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { buffer } from 'micro';
import { createStripeClient } from '@/lib/stripe/factory';
import { prisma } from '@/lib/prisma';
import { generateAvatar } from '@/lib/services/avatarService';

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
                const customerId = invoice.customer as string | null;

                if (!customerId) {
                    console.error('Webhook Error: No customer ID found on the invoice.');
                    return res.status(400).send('Webhook Error: Missing customer ID.');
                }
                
                // Find the user by their Stripe Customer ID
                const profile = await prisma.profile.findFirst({
                    where: { stripeCustomerId: customerId },
                });

                if (profile && profile.status === 'PENDING_PAYMENT' && profile.tmpFaceUrl && profile.styleUrl) {
                    console.log(`Activating profile for new user ${profile.id} via customer ID ${customerId}...`);
                    const avatarUrl = await generateAvatar(profile.tmpFaceUrl, profile.styleUrl);

                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: {
                            status: 'ACTIVE',
                            avatarUrl: avatarUrl,
                            tmpFaceUrl: null,
                            styleUrl: null,
                        },
                    });
                    console.log(`✅ Successfully activated profile for user ${profile.id}`);
                } else if (profile) {
                    console.log(`Recurring payment for ${profile.id}, ensuring status is ACTIVE.`);
                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: { status: 'ACTIVE' },
                    });
                } else {
                    console.warn(`Webhook received for unknown customer ID: ${customerId}`);
                }
                break;

            case 'customer.subscription.deleted':
            case 'customer.subscription.updated':
                const subscription = event.data.object as unknown as { id: string; status: string; current_period_end: number };
                const newStatus = subscription.status.toUpperCase().replace('-', '_');
                await prisma.profile.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: { 
                        status: newStatus,
                        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });
                console.log(`Updated subscription status for ${subscription.id} to ${newStatus}`);
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
