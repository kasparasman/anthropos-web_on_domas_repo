import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions } from '@stripe/stripe-js';

interface PaymentModalProps {
  email: string;
  open: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onClientSecretFetched: (secret: string | null) => void;
  clientSecret: string | null;
  stripePromise: any;
}

// Inner component that uses Stripe hooks
function PaymentForm({ email, onPaymentSuccess, clientSecret }: { 
  email: string; 
  onPaymentSuccess: () => void; 
  clientSecret: string; 
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
        return_url: `${window.location.origin}/payment-complete`,
      },
    });

    setLoading(false);

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
    } else {
      onPaymentSuccess();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Enter payment details</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
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
  stripePromise 
}: PaymentModalProps) {
  const [prices, setPrices] = useState<any[]>([]);
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

  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance: { theme: 'stripe' } }
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400">✕</button>
        
        {step === 'select' && (
          <>
            <h2 className="text-xl font-bold mb-4">Select a plan</h2>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="space-y-4">
              {prices.map((price) => (
                <div key={price.id} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{price.product.name}</div>
                    <div>${(price.unit_amount / 100).toFixed(2)} / {price.recurring?.interval}</div>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => setSelectedPrice(price.id)}
                    disabled={loading}
                  >
                    Select
                  </button>
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
            />
          </Elements>
        )}

        {step === 'success' && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Payment Successful!</h2>
            <p>Your subscription is now active. You can now register.</p>
            <button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}