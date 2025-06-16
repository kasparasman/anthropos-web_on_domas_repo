import type { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { createStripeClient } from '@/lib/stripe/factory';
import { verifyIdToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { withPrismaRetry } from '@/lib/prisma/util';

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
        gender
    } = req.body;

    if (!email || !plan || !paymentMethodId || !idToken || !faceUrl || !styleId || !gender) {
        const missing = Object.entries({email, plan, paymentMethodId, idToken, faceUrl, styleId, gender})
            .filter(([, value]) => !value)
            .map(([key]) => key);
        return res.status(400).json({ message: `Missing required parameters: ${missing.join(', ')}` });
    }

    const stripe = createStripeClient();

    try {
        // Step 0: Verify Firebase ID token
        const decodedToken = await verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // Require that the e-mail has been verified (custom claim set by cloud function)
        if (!decodedToken.isVerified) {
            return res.status(403).json({
                message: 'EMAIL_NOT_VERIFIED',
            });
        }
        
        // --- Final, Correct Subscription Flow ---

        // Step 1: Create a Stripe Customer.
        const customer = await stripe.customers.create({
            email: email,
        });
        // 1.5 **ATTACH the PaymentMethod to that customer**
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
        });
        await stripe.customers.update(customer.id, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });
          
        // Step 2: Create the subscription with the default payment method attached.
        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            return res.status(400).json({ message: `Invalid plan: ${plan}` });
        }
        
        const idempotencyKey = `sub_${uid}_${plan}_${Date.now()}`;   // ← add timestamp or UUID

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            collection_method: 'charge_automatically',
            default_payment_method: paymentMethodId,
            trial_period_days: 0,
            payment_settings: {
                save_default_payment_method: 'on_subscription',
              },
            expand: ['latest_invoice.payment_intent'],
        }, 
            { idempotencyKey }   // same header, but now unique per attempt
        );

        // Step 3: Create (or upsert) the user profile in your database immediately
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const periodEndUnix = (subscription as any).current_period_end as number | undefined;

        await withPrismaRetry(() => prisma.profile.upsert({
            where: { id: uid },
            create: {
                id: uid,
                email: email,
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
        }));

        // ──────────────── Step 4 — grab a usable PaymentIntent (no loop) ────────────────
        type InvoiceWithPI =
        Stripe.Invoice & { payment_intent: Stripe.PaymentIntent | string | null };

        async function getPaymentIntent(
        stripe: Stripe,
        subId: string,
        customerId: string,
        ): Promise<Stripe.PaymentIntent> {
        // 1) Retrieve subscription → invoice → payment_intent (expanded)
        const sub = (await stripe.subscriptions.retrieve(subId, {
            expand: ['latest_invoice.payment_intent'],
        })) as Stripe.Subscription;

        const invRef = sub.latest_invoice;
        if (invRef) {
            const invoice: InvoiceWithPI =
            typeof invRef === 'string'
                ? (await stripe.invoices.retrieve(invRef, {
                    expand: ['payment_intent'],
                })) as any
                : (invRef as any);

            const piRef = invoice.payment_intent;
            if (piRef && typeof piRef !== 'string' && piRef.client_secret) {
            return piRef; // 🎉 linked in time
            }
        }

        // 2) Fallback: newest PI on the customer in the last 5 min
        const piList = await stripe.paymentIntents.list({
            customer: customerId,
            limit: 1,
            created: { gte: Math.floor(Date.now() / 1000) - 300 },
        });

        const pi = piList.data.find((p) => p.client_secret);
        if (pi) return pi;

        throw new Error('Stripe produced no PaymentIntent with client_secret.');
        }
        // ────────────────────────────────────────────────────────────────────────────────

        // call the helper
        const pi = await getPaymentIntent(stripe, subscription.id, customer.id);

        res.status(200).json({
        clientSecret: pi.client_secret!,
        userId: uid,
        });


  
    } catch (error) {
        let message = 'An unknown error occurred.';
        let statusCode = 500;

        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            message = 'An account with this email already exists. Please sign in or use a different email.';
            statusCode = 409;
        } else if (error instanceof Stripe.errors.StripeError) {
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