// lib/firebase-client.ts
'use client'; // ensures this only runs in the browser

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbRegister,
  signOut as fbSignOut,
  type UserCredential
} from 'firebase/auth';

// Firebase client configuration is built from NEXT_PUBLIC_* environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

// Ensure all config values are present to avoid runtime errors
if (Object.values(firebaseConfig).some((v) => !v)) {
  throw new Error('Missing one or more NEXT_PUBLIC_FIREBASE_* environment variables');
}

const cfg = firebaseConfig;

const app: FirebaseApp = !getApps().length

  ? initializeApp(cfg)
  : getApps()[0];
  

export const firebaseAuth = getAuth(app);
/**
 * Sign in a new user with email & password
 */
export function signInClient(email: string, password: string): Promise<UserCredential> {
  return fbSignIn(firebaseAuth, email, password);
}

/**
 * Sign up a user with email & password
 */
export function registerClient(email: string, password: string): Promise<UserCredential> {
  return fbRegister(firebaseAuth, email, password);
}

/**
 * Log out the current user
 */
export function logOutClient(): Promise<void> {
  return fbSignOut(firebaseAuth);
}
