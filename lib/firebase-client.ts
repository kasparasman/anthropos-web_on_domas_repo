// lib/firebase-client.ts
'use client'; // ensures this only runs in the browser

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbRegister,
  signOut as fbSignOut,
  type UserCredential
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import {
  getFunctions,
  connectFunctionsEmulator          // ← import
} from 'firebase/functions';
import { ReCaptchaV3Provider, initializeAppCheck, getToken as getAppCheckToken } from 'firebase/app-check';

// Firebase client configuration is built from NEXT_PUBLIC_* environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

// Ensure all config values are present to avoid runtime errors
if (Object.values(firebaseConfig).some((v) => !v)) {
  throw new Error('Missing one or more NEXT_PUBLIC_FIREBASE_* environment variables');
}

const cfg = firebaseConfig;

export const app: FirebaseApp = !getApps().length

  ? initializeApp(cfg)
  : getApps()[0];
  

export const firebaseAuth = getAuth(app);

// Firestore instance (optional export – used mainly in dev tools)
export const firebaseDb: Firestore = getFirestore(app);

declare global {
  interface Window { __APP_CHECK_INIT__?: boolean }
}
  
if (typeof window !== 'undefined' && !window.__APP_CHECK_INIT__) {
  window.__APP_CHECK_INIT__ = true;
  if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('noop'),
      isTokenAutoRefreshEnabled: true,
    });
    console.info('[Firebase] App Check debug token enabled.');
  } else {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
      ),
      isTokenAutoRefreshEnabled: true,
    });
  }
}
console.log(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
// ─── Emulator Suite (opt-in via env) ────────────────────────────────
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  try {
    // Auth → http://localhost:9099
    connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFunctionsEmulator(getFunctions(app, 'europe-west1'), '127.0.0.1', 5001);
    console.info('[Firebase] Connected to local emulators.');
  
    // Firestore → localhost:8080
    connectFirestoreEmulator(firebaseDb, '127.0.0.1', 8080);
    console.info('[Firebase] Connected to local emulators.');
  } catch (err) {
    console.warn('[Firebase] Failed to connect to emulators:', err);
  }
}

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
