import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Load Stripe.js outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('Processing payment...');
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      setMessage('Error: Payment intent client secret not found in URL.');
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          // Here you would typically:
          // 1. Notify your backend to confirm the payment and update user status if not already done by webhook.
          // 2. Redirect the user to their dashboard or next step in the app.
          // For testing, you might redirect back to the app or show a link.
          // Example: router.push('/dashboard');
          break;
        case 'processing':
          setMessage("Payment processing. We'll update you when payment is received.");
          break;
        case 'requires_payment_method':
          setMessage('Payment failed. Please try another payment method.');
          // Example: router.push('/checkout'); // Or back to the payment modal
          break;
        default:
          setMessage('Something went wrong with your payment.');
          // Example: router.push('/checkout');
          break;
      }
    }).catch(error => {
      console.error("Error retrieving payment intent:", error);
      setMessage('Error processing payment. Please contact support.');
    });
  }, [stripe, router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Payment Status</h1>
      <p>{message}</p>
      {/* You might want a link to go back to the main app */}
      <button onClick={() => router.push('/')}>Go to Homepage</button>
    </div>
  );
} 