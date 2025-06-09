import type { NextApiRequest, NextApiResponse } from 'next';
import { createStripeClient } from '../../../lib/stripe/factory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const stripe = createStripeClient();

  try {
    const setupIntent = await stripe.setupIntents.create({
      usage: 'on_session',
      payment_method_options: {
        card: {
          request_three_d_secure: 'any', // Prefer frictionless but allow challenge
        },
      },
    });

    res.status(200).json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Stripe API error in create-setup-intent:', message);
    res.status(500).json({ message: 'Failed to initialize payment form.' });
  }
}
