import Stripe from 'stripe';

export function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-08-01',
    appInfo: {
      name: 'YourAppName',
      version: '0.1.0',
    },
  });
}