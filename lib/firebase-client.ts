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

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

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
