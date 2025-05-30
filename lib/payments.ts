// lib/payments.ts
export interface PaymentService {
    createCheckoutSession(...): Promise<...>;
    cancelSubscription(...): Promise<...>;
    // etc.
  }