import type { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { createStripeClient } from '@/lib/stripe/factory';
import { verifyIdToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { generateAvatar } from '@/lib/services/avatarService';

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
        styleUrl,
        nickname,
        gender
    } = req.body;

    if (!email || !plan || !paymentMethodId || !idToken || !faceUrl || !styleUrl || !nickname || !gender) {
        const missing = Object.entries({email, plan, paymentMethodId, idToken, faceUrl, styleUrl, nickname, gender})
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
        });

        // Step 3: Generate the user's avatar
        const avatarUrl = await generateAvatar(faceUrl, styleUrl);

        // Step 4: Create the user profile in your database
        await prisma.profile.create({
            data: {
                id: uid,
                email: email,
                nickname,
                gender,
                avatarUrl: avatarUrl,
                tmpFaceUrl: faceUrl, 
                status: 'ACTIVE',
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
            },
        });

        res.status(200).json({
            success: true,
            subscriptionId: subscription.id,
            avatarUrl: avatarUrl,
        });

    } catch (error) {
        let message = 'An unknown error occurred.';
        let statusCode = 500;

        if (error instanceof Stripe.errors.StripeError) {
            message = `Stripe Error: ${error.message}`;
            statusCode = error.statusCode || 500;
        } else if (error instanceof Error) {
            message = error.message;
        }
        
        console.error('Finalize registration error:', error);
        res.status(statusCode).json({ message });
    }
} 