import type { NextApiRequest, NextApiResponse } from 'next';
import { createStripeClient } from '../../../lib/stripe/factory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = createStripeClient();
  const { email } = req.body;

  // You can set amount/currency as needed
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 9900, // $99.00 in cents
    currency: 'usd',
    metadata: { email },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}
