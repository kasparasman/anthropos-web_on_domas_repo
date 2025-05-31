'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthModalManager, AuthStep } from '../hooks/useAuthModalManager';

// Load Stripe.js outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>('Processing payment...');
  const { handlePaymentSuccess, resetToInitial, setCurrentStep, setMode } = useAuthModalManager();

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');
    const provisionalUserIdFromQuery = searchParams.get('provisional_user_id');

    if (!clientSecret) {
      setMessage('Error: Payment intent client secret not found in URL.');
      setStatus('error');
      return;
    }

    async function checkStatus() {
      const stripe = await stripePromise;
      if (!stripe) {
        setMessage('Stripe.js has not loaded yet.');
        setStatus('error');
        return;
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret as string);

      if (paymentIntent) {
        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Payment successful! Redirecting you to complete your profile...');
            setStatus('succeeded');
            // Mark payment as complete in our system
            // This will trigger the AuthModal to move to the next step
            // We use a flag in localStorage because AuthModal might not be mounted
            // or its state might be lost if the user navigated away and came back.
            localStorage.setItem('paymentCompletedForUser', provisionalUserIdFromQuery || 'unknown');
            localStorage.setItem('paymentIntentId', paymentIntent.id);
            // Directly call the success handler if possible (e.g., if modal is open)
            // This is an optimistic update, localStorage is the primary mechanism
            handlePaymentSuccess(); 
            router.push('/'); // Redirect to home, AuthModal will pick up the status
            break;
          case 'processing':
            setMessage("Payment processing. We'll update you when payment is received.");
            setStatus('processing');
            break;
          case 'requires_payment_method':
            setMessage('Payment failed. Please try another payment method.');
            setStatus('requires_payment_method');
            // Potentially redirect back to a payment page or show an error
            localStorage.setItem('paymentFailedForUser', provisionalUserIdFromQuery || 'unknown');
            router.push('/'); // Redirect to home, AuthModal might reopen or show error
            break;
          default:
            setMessage('Something went wrong with your payment.');
            setStatus('error');
            localStorage.setItem('paymentFailedForUser', provisionalUserIdFromQuery || 'unknown');
            router.push('/');
            break;
        }
      } else {
        setMessage('Could not retrieve payment intent details.');
        setStatus('error');
      }
    }

    if (redirectStatus === 'succeeded' && clientSecret) {
        // If Stripe already confirms success via redirect_status, proceed directly
        // This can happen if 3DS was successful but the client-side check is also needed.
        setMessage('Payment confirmed by redirect! Redirecting you to complete your profile...');
        setStatus('succeeded');
        localStorage.setItem('paymentCompletedForUser', provisionalUserIdFromQuery || 'unknown');
        handlePaymentSuccess();
        router.push('/');
    } else if (clientSecret) {
        checkStatus();
    }

  }, [searchParams, router, handlePaymentSuccess]);

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