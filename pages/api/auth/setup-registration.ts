import type { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { createStripeClient } from '@/lib/stripe/factory';
import { verifyIdToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

// Map plan names to Stripe Price IDs
const PRICE_IDS: Record<string, string> = {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Increased body size limit to handle potential future needs, though we moved away from base64
    // This is a good practice for endpoints that might handle complex data.
    // Note: Vercel Hobby plan has a 1MB limit. Pro plan can be configured up to 4.5MB.
    // This export is a Next.js specific configuration.
    // export const config = {
    //     api: {
    //         bodyParser: {
    //             sizeLimit: '4mb',
    //         },
    //     },
    // };

    const { 
        email, 
        plan, 
        idToken,
        faceUrl,
        styleId,
        nickname,
        gender
    } = req.body;

    if (!email || !plan || !idToken || !faceUrl || !styleId || !nickname || !gender) {
        const missing = Object.entries({email, plan, idToken, faceUrl, styleId, nickname, gender})
            .filter(([, value]) => !value)
            .map(([key]) => key);
        return res.status(400).json({ message: `Missing required parameters: ${missing.join(', ')}` });
    }

    const stripe = createStripeClient();

    try {
        // Step 0: Verify Firebase ID token
        const decodedToken = await verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // --- Streamlined Subscription Flow ---

        // Step 1: Create a Stripe Customer.
        const customer = await stripe.customers.create({
            email: email,
        });

        // Step 2: Create the subscription with payment behavior set to 'default_incomplete'.
        // It will save the payment method automatically on successful confirmation.
        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            return res.status(400).json({ message: `Invalid plan: ${plan}` });
        }
        
        const idempotencyKey = `sub_create_${uid}_${plan}`;

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { 
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
        }, {
            idempotencyKey: idempotencyKey,
        });

        // Step 3: Create (or upsert) the user profile in your database immediately
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const periodEndUnix = (subscription as any).current_period_end as number | undefined;

        await prisma.profile.upsert({
            where: { id: uid },
            create: {
                id: uid,
                email: email,
                nickname,
                gender,
                tmpFaceUrl: faceUrl,
                styleId: styleId,
                status: 'PENDING_PAYMENT',
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                ...(typeof periodEndUnix === 'number' ? { stripeCurrentPeriodEnd: new Date(periodEndUnix * 1000) } : {}),
            },
            update: {
                email: email,
                tmpFaceUrl: faceUrl,
                styleId: styleId,
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                ...(typeof periodEndUnix === 'number' ? { stripeCurrentPeriodEnd: new Date(periodEndUnix * 1000) } : {}),
            },
        });

        // Step 4: Return the client secret from the subscription's invoice to the frontend.
        const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            userId: uid,
        });

    } catch (error) {
        let message = 'An unknown error occurred.';
        let statusCode = 500;

        if (error instanceof Stripe.errors.StripeError) {
            // Handle card errors that require 3DS authentication
            if (error.code === 'card_error' && error.decline_code === 'authentication_required') {
                const paymentIntent = error.payment_intent;
                if (paymentIntent) {
                    console.log('[3DS] Authentication required. Sending client_secret to frontend.');
                    return res.status(402).json({
                        requiresAction: true,
                        clientSecret: paymentIntent.client_secret,
                        userId: (error as { doc?: { userId_for_logging?: string } })?.doc?.userId_for_logging
                    });
                }
            }
            message = `Stripe Error: ${error.message}`;
            statusCode = error.statusCode || 500;
        } else if (error instanceof Error) {
            message = error.message;
        }
        
        console.error('Setup registration error:', error);
        res.status(statusCode).json({ message });
    }
} 