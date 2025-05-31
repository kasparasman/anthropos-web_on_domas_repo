import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { Stripe, StripeElementsOptions, loadStripe } from '@stripe/stripe-js';

// Define a type for the price object
interface StripePrice {
  id: string;
  unit_amount: number;
  recurring?: { // Make recurring optional as it might not always be present
    interval: string;
  } | null;
  product: {
    name: string;
  };
}

interface PaymentModalProps {
  email: string;
  open: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onClientSecretFetched: (secret: string | null) => void;
  clientSecret: string | null;
  stripePromise: ReturnType<typeof loadStripe>;
  provisionalUserId: string | null;
}

// Inner component that uses Stripe hooks
function PaymentForm({ email, onPaymentSuccess, clientSecret, provisionalUserId }: {
  email: string;
  onPaymentSuccess: () => void;
  clientSecret: string;
  provisionalUserId: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe.js has not loaded yet.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: email,
        return_url: `${window.location.origin}/payment-complete?provisional_user_id=${provisionalUserId}`,
      },
    });

    setLoading(false);

    if (stripeError) {
      if (stripeError.type === "card_error" || stripeError.type === "validation_error") {
        setError(stripeError.message || 'An error occurred with your card.');
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Stripe confirmPayment error:", stripeError);
    } else {
      // If confirmPayment doesn't throw an error and doesn't redirect, 
      // it means the payment was successful without a redirect (e.g., no 3DS needed).
      // In this case, onPaymentSuccess will be called, and the /payment-complete page might not be hit.
      console.log("Payment successful (no redirect)");
      onPaymentSuccess();
    }
  };

  return (
    <div className="bg-black rounded-lg p-6 border border-main shadow mb-4">
      <h2 className="text-xl font-bold mb-4 text-white">Enter payment details</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="mt-4 w-full bg-main text-black py-2 rounded font-semibold hover:bg-yellow-400 transition"
        >
          {loading ? 'Processing…' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

export default function PaymentModal({
  email,
  open,
  onClose,
  onPaymentSuccess,
  onClientSecretFetched,
  clientSecret,
  stripePromise,
  provisionalUserId
}: PaymentModalProps) {
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch prices when modal opens
  useEffect(() => {
    if (open) {
      fetch('/api/stripe/prices')
        .then(res => res.json())
        .then(data => setPrices(data.prices))
        .catch(() => setError('Failed to load prices.'));
      setStep('select');
      setSelectedPrice(null);
      onClientSecretFetched(null);
      setError(null);
    }
  }, [open]);

  // Create subscription when price is selected
  useEffect(() => {
    if (selectedPrice && email) {
      setLoading(true);
      setError(null);
      fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, priceId: selectedPrice }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.clientSecret) {
            onClientSecretFetched(data.clientSecret);
            setStep('pay');
          } else {
            setError(data.message || 'Failed to get client secret for payment setup.');
            onClientSecretFetched(null);
          }
        })
        .catch((err) => {
          console.error("Error in create-subscription fetch:", err);
          setError('Failed to create subscription.');
          onClientSecretFetched(null);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedPrice, email]);

  if (!open) return null;

  // Custom dark/gold theme for Stripe Elements
  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? {
      clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#FFD700',
          colorBackground: '#000000',
          colorText: '#fff',
          colorDanger: '#ff4d4f',
          fontFamily: 'inherit',
          borderRadius: '12px',
        },
        rules: {
          '.Block': {
            border: 'none',
            boxShadow: 'none',
            backgroundColor: '#18181b',
            fontFamily: 'inherit',
          },
          '.Input': {
            border: '1px solid #FFD700',
            backgroundColor: '#18181b',
            color: '#fff',
            fontFamily: 'inherit',
          },
          '.Label': {
            color: '#FFD700',
            fontFamily: 'inherit',
          },
          '.Tab, .Tab--selected': {
            color: '#FFD700',
            fontFamily: 'inherit',
          },
        },
      },
    }
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex flex-col bg-black rounded-xl py-6 px-8 w-full h-full sm:w-auto sm:h-auto border items-center border-main shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-main transition-colors p-2 rounded-full "
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'select' && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Step 2/3 Select a plan</h2>
            {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
            <div className="flex flex-col sm:flex-row gap-6">
              {prices.map((price) => (
                <div key={price.id} className="border border-main p-4 rounded-xl flex flex-col sm:justify-between items-center max-w-80 sm:max-w-auto bg-[linear-gradient(-45deg,_#000000_-10%,_#252014_50%,_#000000_110%)]">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold text-[24px] text-smoke mb-3 uppercase">{price.product.name}</div>
                    <div className="flex flex-col text-smoke text-[32px] font-semibold items-center mb-5">${(price.unit_amount / 100).toFixed(2)}
                      <p className="text-base ">per {price.recurring?.interval}</p>
                    </div>
                  </div>
                  <button
                    className="bg-main text-black w-full py-2 rounded-full font-semibold transition mb-5"
                    onClick={() => setSelectedPrice(price.id)}
                    disabled={loading}
                  >
                    Select Plan
                  </button>
                  <div className="">
                    <p className="w-full text-center text-smoke ">Includes:</p>
                    <p className="w-full text-center text-dim_smoke ">✓ Full access to all features</p>
                    <p className="w-full text-center text-dim_smoke ">✓ Priority support</p>
                    <p className="w-full text-center text-dim_smoke ">✓ Cancel anytime</p>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

        {step === 'pay' && clientSecret && elementsOptions && (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentForm
              email={email}
              onPaymentSuccess={onPaymentSuccess}
              clientSecret={clientSecret}
              provisionalUserId={provisionalUserId}
            />
          </Elements>
        )}

        {step === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Payment Successful!</h2>
            <p className="text-main mb-4">Your subscription is now active. You can now register.</p>
            <button onClick={onClose} className="mt-4 bg-main text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}