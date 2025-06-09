import Stripe from 'stripe';

export function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
    appInfo: {
      name: 'YourAppName',
      version: '0.1.0',
    },
  });
}