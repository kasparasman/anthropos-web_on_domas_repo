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
        paymentMethodId, 
        idToken,
        faceUrl,
        styleId,
        nickname,
        gender
    } = req.body;

    if (!email || !plan || !paymentMethodId || !idToken || !faceUrl || !styleId || !nickname || !gender) {
        const missing = Object.entries({email, plan, paymentMethodId, idToken, faceUrl, styleId, nickname, gender})
            .filter(([, value]) => !value)
            .map(([key]) => key);
        return res.status(400).json({ message: `Missing required parameters: ${missing.join(', ')}` });
    }

    const stripe = createStripeClient();

    try {
        // Step 0: Verify Firebase ID token
        const decodedToken = await verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // Step 1: Create a Stripe Customer and attach the payment method
        const customer = await stripe.customers.create({
            email: email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Step 2: Create the subscription
        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            return res.status(400).json({ message: `Invalid plan: ${plan}` });
        }
        
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });

        // Step 3: Create (or upsert) the user profile in your database immediately so that /check-status doesn't 404
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
                // shouldn't normally hit, but keep fields updated idempotently
                email: email,
                tmpFaceUrl: faceUrl,
                styleId: styleId,
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                ...(typeof periodEndUnix === 'number' ? { stripeCurrentPeriodEnd: new Date(periodEndUnix * 1000) } : {}),
            },
        });

        // --- Handle Payment That Requires 3DS ---
        const latestInvoice = subscription.latest_invoice as Stripe.Invoice | undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const paymentIntent = (latestInvoice as any)?.payment_intent as Stripe.PaymentIntent | undefined;

        if (paymentIntent && paymentIntent.status === 'requires_action') {
            console.log('[3DS] Subscription requires additional authentication. Sending client_secret to frontend.');
            return res.status(402).json({
                requiresAction: true,
                clientSecret: paymentIntent.client_secret,
                userId: uid,
            });
        }

        // If no 3DS is needed, finish normally
        res.status(200).json({
            success: true,
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