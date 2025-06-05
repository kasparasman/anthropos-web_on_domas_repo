import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

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

type ErrorWithMessage = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customToken } = req.body;

    if (!customToken) {
      return res.status(400).json({ error: 'Missing customToken in request body' });
    }

    // Sign in with the custom token using Firebase client SDK
    const userCredential = await signInWithCustomToken(auth, customToken);
    
    // Get the ID token from the user credential
    const idToken = await userCredential.user.getIdToken();

    // Return the ID token
    return res.status(200).json({ 
      idToken,
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      message: 'Successfully exchanged custom token for ID token'
    });
  } catch (error: unknown) {
    console.error('Error exchanging token:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return res.status(500).json({ 
      error: 'Failed to exchange token',
      message: errorMessage 
    });
  }
} 