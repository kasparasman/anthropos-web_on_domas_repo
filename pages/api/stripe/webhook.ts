import type { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { Readable } from 'stream';
import { createStripeClient } from '@/lib/stripe/factory';
import { handleSubscriptionChange, handlePaymentIntentUpdate } from '@/lib/services/stripeWebhookService';

// Disable Next.js body parser for this route to handle raw body for Stripe signature
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to buffer the request stream
async function buffer(readable: Readable): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

const stripe = createStripeClient();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET is not set.');
        return res.status(500).json({ message: 'Webhook secret is not configured.' });
    }
    
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        if (!sig) {
            throw new Error('Missing stripe-signature header');
        }
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Stripe webhook signature verification failed: ${message}`);
        return res.status(400).json({ message: `Webhook Error: ${message}` });
    }
    
    console.log(`✅ Received Stripe event: ${event.type} ${event.id}`);

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await handleSubscriptionChange(event.data.object as Stripe.Subscription);
                break;

            case 'payment_intent.succeeded':
            case 'payment_intent.payment_failed':
                 await handlePaymentIntentUpdate(event.data.object as Stripe.PaymentIntent);
                break;
            
            // Add other event types you want to handle here
            // e.g., case 'invoice.paid': ...

            default:
                console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An internal error occurred.';
        console.error(`Webhook handler failed for event ${event.type}. Error: ${message}`);
        res.status(500).json({ message: `Webhook handler error: ${message}` });
    }
}