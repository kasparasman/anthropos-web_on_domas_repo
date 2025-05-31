'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe.js outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>('Processing payment...');

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');
    const provisionalUserIdFromQuery = searchParams.get('provisional_user_id');

    if (!clientSecret) {
      setMessage('Error: Payment intent client secret not found in URL.');
      setStatus('error');
      return;
    }

    if (!provisionalUserIdFromQuery) {
      setMessage('Error: Provisional user ID not found in URL. Cannot complete process.');
      setStatus('error');
      return;
    }

    async function verifyAndSetOutcome() {
      const stripe = await stripePromise;
      if (!stripe) {
        setMessage('Stripe.js has not loaded yet.');
        setStatus('error');
        return;
      }

      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret as string);

        if (paymentIntent) {
          switch (paymentIntent.status) {
            case 'succeeded':
              setMessage('Payment successful! Redirecting...');
              setStatus('succeeded');
              localStorage.setItem('paymentCompletedForUser', provisionalUserIdFromQuery as string);
              localStorage.setItem('paymentIntentId', paymentIntent.id);
              router.push('/');
              break;
            case 'processing':
              setMessage("Payment processing...");
              setStatus('processing');
              break;
            case 'requires_payment_method':
              setMessage('Payment failed. Please try another payment method.');
              setStatus('requires_payment_method');
              localStorage.setItem('paymentFailedForUser', provisionalUserIdFromQuery as string);
              router.push('/');
              break;
            default:
              setMessage('Something went wrong.');
              setStatus('error');
              localStorage.setItem('paymentFailedForUser', provisionalUserIdFromQuery as string);
              router.push('/');
              break;
          }
        } else {
          setMessage('Could not retrieve payment intent.');
          setStatus('error');
          localStorage.setItem('paymentFailedForUser', provisionalUserIdFromQuery as string);
          router.push('/');
        }
      } catch (error) {
        console.error("Error retrieving payment intent:", error);
        setMessage('Error processing payment details.');
        setStatus('error');
        localStorage.setItem('paymentFailedForUser', provisionalUserIdFromQuery as string);
        router.push('/');
      }
    }

    if (redirectStatus === 'succeeded') {
        console.log('[PaymentCompletePage] Stripe redirect_status is succeeded.');
        setMessage('Payment confirmed! Redirecting...');
        setStatus('succeeded');
        localStorage.setItem('paymentCompletedForUser', provisionalUserIdFromQuery as string);
        router.push('/');
    } else {
        console.log('[PaymentCompletePage] No redirect_status=succeeded or other status. Verifying PaymentIntent...');
        verifyAndSetOutcome();
    }

  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background_dimmer text-text_white p-4">
      <div className="bg-background p-8 rounded-lg shadow-xl max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          {status === 'succeeded' && 'Payment Successful!'}
          {status === 'processing' && 'Payment Processing'}
          {status === 'requires_payment_method' && 'Payment Failed'}
          {status === 'error' && 'Payment Error'}
          {!status && 'Completing Payment'}
        </h1>
        <p className="mb-6">{message}</p>
        {(status === 'succeeded' || status === 'error' || status === 'requires_payment_method') && (
          <button 
            onClick={() => router.push('/')} 
            className="bg-main text-black px-6 py-2 rounded font-semibold hover:bg-yellow-400 transition"
          >
            Go to Homepage
          </button>
        )}
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main mx-auto"></div>
        )}
      </div>
    </div>
  );
} 