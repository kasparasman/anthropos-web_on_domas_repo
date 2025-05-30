import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createStripeClient } from '../../../lib/stripe/factory';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const stripe = createStripeClient();
  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    // TODO: Mark user/email as paid in your DB using paymentIntent.metadata.email
    // Example: await markUserAsPaid(paymentIntent.metadata.email)
  }

  res.status(200).json({ received: true });
}
