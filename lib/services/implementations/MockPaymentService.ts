import { IPaymentService, PaymentPlan, PaymentResult } from '../interfaces/IPaymentService';

/**
 * Mock payment service that simulates Stripe payments in development
 * Uses Stripe's test payment method IDs
 */
export class MockPaymentService implements IPaymentService {
  async processPayment(
    email: string, 
    plan: PaymentPlan, 
    paymentMethodId: string
  ): Promise<PaymentResult> {
    console.log(`[MockPaymentService] Processing payment for ${email}, plan: ${plan.type}, amount: ${plan.amount} cents`);
    console.log(`[MockPaymentService] Using payment method: ${paymentMethodId}`);
    
    // Check for Stripe test cards or special test values
    if (paymentMethodId === 'pm_card_visa' || 
        paymentMethodId === 'pm_card_visa_debit' || 
        paymentMethodId === 'pm_card_mastercard' || 
        paymentMethodId === 'pm_card_test_123') {
      
      // Simulate successful payment
      console.log('[MockPaymentService] Payment succeeded with test card');
      
      return {
        paymentIntentId: `pi_mock_${Date.now()}`,
        status: 'succeeded'
      };
    } 
    
    // Simulate 3D Secure challenge
    else if (paymentMethodId === 'pm_card_threeDSecure2Required') {
      console.log('[MockPaymentService] Payment requires 3D Secure authentication');
      
      return {
        paymentIntentId: `pi_mock_3ds_${Date.now()}`,
        status: 'requires_action',
        clientSecret: 'mock_client_secret_requiring_action'
      };
    } 
    
    // Simulate declined payment
    else if (paymentMethodId === 'pm_card_declined') {
      console.log('[MockPaymentService] Payment declined with test card');
      
      return {
        paymentIntentId: `pi_mock_declined_${Date.now()}`,
        status: 'failed'
      };
    }
    
    // Default to success for development convenience
    else {
      console.log('[MockPaymentService] Unknown payment method, defaulting to success for testing');
      
      return {
        paymentIntentId: `pi_mock_default_${Date.now()}`,
        status: 'succeeded'
      };
    }
  }

  async createPaymentIntent(email: string, plan: PaymentPlan): Promise<string> {
    console.log(`[MockPaymentService] Creating payment intent for ${email}, plan: ${plan.type}, amount: ${plan.amount} cents`);
    
    // Return a mock client secret
    return `mock_client_secret_${Date.now()}`;
  }

  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    console.log(`[MockPaymentService] Verifying payment ${paymentIntentId}`);
    
    // Consider all payments as verified in development, unless specifically mocking a failed payment
    if (paymentIntentId.includes('declined')) {
      return false;
    }
    
    return true;
  }
} 