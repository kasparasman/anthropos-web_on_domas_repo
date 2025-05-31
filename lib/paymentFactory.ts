// lib/paymentFactory.ts
import { StripePaymentService } from './stripeService';

export function getPaymentService() {
  // Could switch based on config/env
  return new StripePaymentService();
}


/* 
use case:
const paymentService = getPaymentService();
await paymentService.createCheckoutSession(...);

*/
