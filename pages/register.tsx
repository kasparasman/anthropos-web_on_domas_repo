import { useAuthModalManager } from '../contexts/AuthModalManagerContext'

import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { registerClient } from '../lib/firebase-client';
import { checkFaceDuplicate } from '../lib/services/authApiService';
import { uploadFileToStorage } from '../lib/services/fileUploadService';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const styleOptions = [
  { id: 'male1', src: '/avatars/male1.jpg' },
  { id: 'male2', src: '/avatars/male2.jpg' },
  { id: 'female1', src: '/avatars/female1.jpg' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read file as base64'));
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read blob as base64'));
    reader.readAsDataURL(blob);
  });
}

async function generateAvatar(selfieB64: string, styleB64: string): Promise<string> {
  const res = await fetch('/api/avatar-gen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selfieBase64: selfieB64, styleBase64: styleB64 }),
  });
  if (!res.body) throw new Error('No response body');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let url: string | null = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      if (part.includes('event: uploaded')) {
        const line = part.split('\n').find(l => l.startsWith('data:'));
        if (line) url = line.slice(6);
      }
    }
  }
  if (!url) throw new Error('Avatar generation failed');
  return url;
}

interface RegistrationFormProps {
  clientSecret: string | null;
  setClientSecret: (s: string | null) => void;
}

function RegistrationForm({ clientSecret, setClientSecret }: RegistrationFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [style, setStyle] = useState(styleOptions[0].id);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!email) return;
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(r => r.json())
      .then(d => setClientSecret(d.clientSecret))
      .catch(() => setError('Failed to init payment'));
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !faceFile || !clientSecret) return;
    setError(null);
    setProgress('Uploading face...');
    try {
      const faceUrl = await uploadFileToStorage(faceFile);
      setProgress('Checking face...');
      await checkFaceDuplicate({ imageUrl: faceUrl, email });
      setProgress('Creating user...');
      const cred = await registerClient(email, password);
      const idToken = await cred.user.getIdToken();
      setProgress('Registering...');
      const provRes = await fetch('/api/auth/provisional-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, tmpFaceUrl: faceUrl }),
      });
      const provData = await provRes.json();
      if (!provRes.ok || !provData.success) throw new Error(provData.message || 'provisional failed');

      setProgress('Processing payment...');
      const { error: payErr } = await stripe.confirmPayment({
        elements,
        confirmParams: { receipt_email: email, return_url: `${window.location.origin}/register` },
      });
      if (payErr) throw new Error(payErr.message);

      setProgress('Confirming payment...');
      const confirmRes = await fetch('/api/user/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || !confirmData.success) throw new Error(confirmData.message || 'confirm payment failed');

      setProgress('Generating avatar...');
      const selfieB64 = await fileToBase64(faceFile);
      const styleImg = styleOptions.find(s => s.id === style)!;
      const styleBlob = await fetch(styleImg.src).then(r => r.blob());
      const styleB64 = await blobToBase64(styleBlob);
      const avatarUrl = await generateAvatar(selfieB64, styleB64);

      setProgress('Finalizing profile...');
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: provData.tempNickname, avatarUrl }),
      });

      setDone(true);
      setProgress(null);
    } catch (err: any) {
      setError(err.message || 'Error during registration');
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-bold text-center">Become Anthropos Citizen!</h1>
        <div className="w-64 h-80 bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-white">Passport Design Placeholder</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">Participation in Chat</div>
          <div className="bg-gray-800 p-3 rounded-lg">Limitless Knowledge</div>
          <div className="bg-gray-800 p-3 rounded-lg">Anthropos Avatar</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-base">Unlock your passport below</p>
        <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black">1</div>
            <div className="h-0.5 w-10 bg-yellow-400"></div>
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white">2</div>
            <div className="h-0.5 w-10 bg-gray-600"></div>
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white">3</div>
          </div>
          <h2 className="text-xl font-semibold">Step 1: Email & face scan</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto p-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border px-3 py-2 rounded bg-gray-800 text-white border-gray-700"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border px-3 py-2 rounded bg-gray-800 text-white border-gray-700"
              required
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-40 bg-gray-700 rounded-lg flex items-center justify-center text-white">
                Face Scan Area Placeholder
              </div>
              <input type="file" accept="image/*" onChange={e => setFaceFile(e.target.files?.[0] || null)} required className="text-white" />
              <button type="button" className="bg-yellow-400 text-black py-2 px-4 rounded-full font-semibold">Scan your face</button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black">
              ✓
            </div>
            <div className="h-0.5 w-10 bg-green-400"></div>
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black">2</div>
            <div className="h-0.5 w-10 bg-yellow-400"></div>
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white">3</div>
          </div>
          <h2 className="text-xl font-semibold">Step 2: Payment</h2>
          {clientSecret && <PaymentElement />}
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black">
              ✓
            </div>
            <div className="h-0.5 w-10 bg-green-400"></div>
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black">
              ✓
            </div>
            <div className="h-0.5 w-10 bg-green-400"></div>
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black">3</div>
          </div>
          <h2 className="text-xl font-semibold">Step 3: Passport Generation</h2>
          <div className="flex flex-col items-center gap-3">
            <p className="text-base">Choose your style</p>
            <div className="flex gap-2">
              {styleOptions.map(opt => (
                <label key={opt.id} className="flex flex-col items-center text-center">
                  <input
                    type="radio"
                    name="style"
                    value={opt.id}
                    checked={style === opt.id}
                    onChange={() => setStyle(opt.id)}
                    className="mb-1"
                  />
                  <img src={opt.src} alt={opt.id} className="w-16 h-16 object-cover rounded-lg" />
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!stripe || !elements || !clientSecret || progress !== null}
            className="bg-yellow-400 text-black py-2 px-6 rounded-full mt-2 font-semibold"
          >
            Generate my passport
          </button>
        </div>

      </div>

      {progress && <p className="mt-4">{progress}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {done && <p className="text-green-500 mt-4">Passport generated!</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { setMode } = useAuthModalManager()
  useEffect(() => {
    setMode('register')
  }, [setMode])
  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
      <Elements stripe={stripePromise} options={clientSecret ? { clientSecret } : undefined}>
        <RegistrationForm clientSecret={clientSecret} setClientSecret={setClientSecret} />
      </Elements>
    </main>
  );
}
