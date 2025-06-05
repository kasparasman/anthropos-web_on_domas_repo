export interface PaymentPlan {
  type: 'monthly' | 'yearly';
  amount: number; // in cents
}

export interface PaymentResult {
  paymentIntentId: string;
  status: 'succeeded' | 'requires_action' | 'failed';
  clientSecret?: string;
}

export interface IPaymentService {
  /**
   * Create and confirm a payment for the user
   * @param email - User email
   * @param plan - Selected payment plan
   * @param paymentMethodId - Stripe payment method ID from frontend
   * @returns Payment result with status
   */
  processPayment(email: string, plan: PaymentPlan, paymentMethodId: string): Promise<PaymentResult>;

  /**
   * Create a payment intent for later confirmation
   * @param email - User email
   * @param plan - Selected payment plan
   * @returns Client secret for frontend confirmation
   */
  createPaymentIntent(email: string, plan: PaymentPlan): Promise<string>;

  /**
   * Verify a payment was completed successfully
   * @param paymentIntentId - Payment intent ID to verify
   * @returns true if payment succeeded
   */
  verifyPayment(paymentIntentId: string): Promise<boolean>;
} 