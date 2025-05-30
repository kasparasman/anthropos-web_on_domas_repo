// lib/stripeService.ts
import { PaymentService } from './payments';
import Stripe from 'stripe';

export class StripePaymentService implements PaymentService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
  }
  async createCheckoutSession(...) { /* ... */ }
  async cancelSubscription(...) { /* ... */ }
}