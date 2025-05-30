import type { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe'; // Import Stripe type for better type safety
import { createStripeClient } from '../../../lib/stripe/factory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const stripe = createStripeClient();
  const { email, priceId } = req.body;

  if (!email || !priceId) {
    return res.status(400).json({ message: 'Missing email or priceId' });
  }

  try {
    // Create customer (or fetch existing)
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer: Stripe.Customer; // Add type
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'], 
    });

    // Due to expand: ['latest_invoice.payment_intent']
    // subscription.latest_invoice is an Invoice object
    // subscription.latest_invoice.payment_intent is a PaymentIntent object
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    // @ts-ignore - Linter struggles with Stripe's expanded types for payment_intent on Invoice
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;
    let clientSecret: string | null = null;

    if (paymentIntent && paymentIntent.client_secret) {
        clientSecret = paymentIntent.client_secret;
    }

    if (clientSecret) {
      res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: clientSecret,
        status: subscription.status, 
      });
    } else {
      // This case should ideally not be hit if payment_behavior is 'default_incomplete' 
      // and a price is involved, as a PaymentIntent should be created for the first invoice.
      console.error('Stripe subscription: client_secret not found on latest_invoice.payment_intent despite default_incomplete behavior.', {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          latestInvoiceId: latestInvoice?.id,
          paymentIntentIdOrObject: paymentIntent?.id,
          // @ts-ignore - Suppressing for logging in error case
          rawPaymentIntent: latestInvoice?.payment_intent // Log the raw value for inspection
      });
      res.status(500).json({ message: 'Failed to initialize payment for the subscription.' });
    }

  } catch (error: any) {
    console.error('Stripe API error in create-subscription:', error.message, error.stack);
    // Send a user-friendly message, but log the full error for debugging.
    const userMessage = error.type === 'StripeCardError' ? error.message : 'An error occurred while setting up your subscription.';
    res.status(error.statusCode || 500).json({ message: userMessage });
  }
}
