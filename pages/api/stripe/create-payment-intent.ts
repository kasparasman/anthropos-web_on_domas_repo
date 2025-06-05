import type { NextApiRequest, NextApiResponse } from 'next';
import { createStripeClient } from '../../../lib/stripe/factory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = createStripeClient();
  const { email, plan } = req.body;
  if (!email || !plan) {
    return res.status(400).json({ error: 'Missing email or plan' });
  }

  // Determine amount based on selected plan (prices in cents)
  const PRICING: Record<string, number> = {
    monthly: 99,  // $0.99
    yearly: 999,  // $9.99 (save ~20%)
  };

  const amount = PRICING[plan] ?? PRICING.monthly;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { email, plan },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}
