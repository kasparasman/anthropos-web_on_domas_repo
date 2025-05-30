import type { NextApiRequest, NextApiResponse } from 'next';
import { createStripeClient } from '../../../lib/stripe/factory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const stripe = createStripeClient();
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
  });
  res.json({ prices: prices.data });
}
