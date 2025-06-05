import { IPaymentService, PaymentPlan, PaymentResult } from '../interfaces/IPaymentService';
import { createStripeClient } from '../../stripe/factory';

export class PaymentService implements IPaymentService {
  private stripe = createStripeClient();

  async processPayment(
    email: string, 
    plan: PaymentPlan, 
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: plan.amount,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          email,
          plan: plan.type
        }
      });

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status as 'succeeded' | 'requires_action' | 'failed',
        clientSecret: paymentIntent.client_secret || undefined
      };

    } catch (error) {
      console.error('[PaymentService] Payment processing failed:', error);
      
      return {
        paymentIntentId: '',
        status: 'failed'
      };
    }
  }

  async createPaymentIntent(email: string, plan: PaymentPlan): Promise<string> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: plan.amount,
      currency: 'usd',
      metadata: {
        email,
        plan: plan.type
      }
    });

    return paymentIntent.client_secret!;
  }

  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('[PaymentService] Payment verification failed:', error);
      return false;
    }
  }
} 