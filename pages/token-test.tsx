import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase client
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Stripe test payment method IDs
const STRIPE_TEST_CARDS = [
  { name: 'Visa Success', id: 'pm_card_visa', description: 'Always succeeds' },
  { name: 'Visa Debit', id: 'pm_card_visa_debit', description: 'Always succeeds' },
  { name: 'Mastercard', id: 'pm_card_mastercard', description: 'Always succeeds' },
  { name: 'Test Card 123', id: 'pm_card_test_123', description: 'Custom test card, always succeeds' },
  { name: '3D Secure', id: 'pm_card_threeDSecure2Required', description: 'Requires 3D Secure authentication' },
  { name: 'Declined', id: 'pm_card_declined', description: 'Always fails' },
];

type ApiResponseType = {
  status: number;
  data: Record<string, unknown>;
} | null;

export default function TokenTestPage() {
  // Auth state
  const [customToken, setCustomToken] = useState('');
  const [idToken, setIdToken] = useState('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Password123!');
  const [authMode, setAuthMode] = useState<'token' | 'email_password'>('token');
  
  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState<ApiResponseType>(null);
  const [selectedCard, setSelectedCard] = useState(STRIPE_TEST_CARDS[0].id);
  const [requestPayload, setRequestPayload] = useState(`{
  "faceImageUrl": "https://example.com/face.jpg", 
  "plan": { "type": "monthly", "amount": 99 },
  "paymentMethodId": "pm_card_visa",
  "selectedStyleId": "male_classic",
  "gender": "male",
  "nickname": "test_0815"
}`);

  // Update payload when card changes
  useEffect(() => {
    if (!requestPayload) return;
    
    try {
      const payload = JSON.parse(requestPayload);
      payload.paymentMethodId = selectedCard;
      setRequestPayload(JSON.stringify(payload, null, 2));
    } catch (err) {
      console.error('Error updating payload with selected card:', err);
    }
  }, [selectedCard]);

  // Update payload when auth mode changes
  useEffect(() => {
    if (!requestPayload) return;
    
    try {
      const payload = JSON.parse(requestPayload);
      
      if (authMode === 'token') {
        // Remove email/password, add idToken
        delete payload.email;
        delete payload.password;
        payload.idToken = idToken || '';
      } else {
        // Remove idToken, add email/password
        delete payload.idToken;
        payload.email = email;
        payload.password = password;
      }
      
      setRequestPayload(JSON.stringify(payload, null, 2));
    } catch (err) {
      console.error('Error updating payload with auth mode:', err);
    }
  }, [authMode, idToken, email, password]);

  const exchangeToken = async () => {
    if (!customToken) {
      setError('Please enter a custom token');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Sign in with custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      
      // Get ID token
      const newIdToken = await userCredential.user.getIdToken();
      setIdToken(newIdToken);
      
      // Update the payload with the new ID token
      const payloadObj = JSON.parse(requestPayload);
      payloadObj.idToken = newIdToken;
      delete payloadObj.email;
      delete payloadObj.password;
      setRequestPayload(JSON.stringify(payloadObj, null, 2));
      
      // Set auth mode to token
      setAuthMode('token');
      
    } catch (err) {
      console.error('Error exchanging token:', err);
      setError(err instanceof Error ? err.message : 'Failed to exchange token');
    } finally {
      setLoading(false);
    }
  };

  const testApi = async () => {
    if (authMode === 'token' && !idToken) {
      setError('Please exchange for an ID token first');
      return;
    }

    setLoading(true);
    setError('');
    setApiResponse(null);
    
    try {
      // Parse the payload
      const payload = JSON.parse(requestPayload);
      
      // Call the registration API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      setApiResponse({
        status: response.status,
        data
      });
      
    } catch (err) {
      console.error('API error:', err);
      setError(err instanceof Error ? err.message : 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registration API Test Page</h1>
      
      <div className="mb-8 p-4 border border-gray-800 rounded-lg bg-black">
        <h2 className="text-xl font-semibold mb-3">Authentication Options</h2>
        
        <div className="mb-4">
          <div className="flex space-x-4 mb-4">
            <button 
              onClick={() => setAuthMode('token')}
              className={`px-4 py-2 rounded ${
                authMode === 'token' 
                  ? 'bg-yellow-600 text-black font-medium' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Use Firebase Token
            </button>
            
            <button 
              onClick={() => setAuthMode('email_password')}
              className={`px-4 py-2 rounded ${
                authMode === 'email_password' 
                  ? 'bg-yellow-600 text-black font-medium' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Use Email/Password
            </button>
          </div>
          
          {authMode === 'token' ? (
            <>
              <label className="block mb-2">Custom Token:</label>
              <textarea
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded h-24"
                placeholder="Paste your custom token here..."
              />
              
              <button
                onClick={exchangeToken}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black font-medium"
              >
                {loading ? 'Exchanging...' : 'Exchange for ID Token'}
              </button>
              
              {idToken && (
                <div className="mt-4">
                  <label className="block mb-2">ID Token:</label>
                  <div className="bg-gray-900 p-2 rounded overflow-auto break-all border border-yellow-500">
                    {idToken}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block mb-2">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
                  placeholder="Enter password"
                />
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                The API will automatically create or sign in the user with these credentials.
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-8 p-4 border border-gray-800 rounded-lg bg-black">
        <h2 className="text-xl font-semibold mb-3">API Test</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Select Stripe Test Card:</label>
          <select 
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded mb-2"
          >
            {STRIPE_TEST_CARDS.map(card => (
              <option key={card.id} value={card.id}>
                {card.name} ({card.description})
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-400 mb-4">
            These are Stripe&apos;s test payment method IDs that work with our mock payment service.
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Request Payload:</label>
          <textarea
            value={requestPayload}
            onChange={(e) => setRequestPayload(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded h-60 font-mono text-sm"
          />
        </div>
        
        <button
          onClick={testApi}
          disabled={loading || (authMode === 'token' && !idToken)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black font-medium mb-4"
        >
          {loading ? 'Sending...' : 'Test Registration API'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-3 border border-red-700 bg-red-900/50 rounded-lg text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {apiResponse && (
        <div className="p-4 border border-gray-800 rounded-lg bg-black">
          <h2 className="text-xl font-semibold mb-3">API Response</h2>
          <div className="mb-2">Status: <span className={apiResponse.status < 400 ? 'text-green-500' : 'text-red-500'}>{apiResponse.status}</span></div>
          <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(apiResponse.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 