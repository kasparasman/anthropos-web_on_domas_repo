// lib/firebase-admin.ts
import admin from 'firebase-admin';
import axios from 'axios';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export { admin }

export const verifyIdToken = (token: string) =>
  admin.auth().verifyIdToken(token);

export const deleteFirebaseUser = (uid: string) => 
  admin.auth().deleteUser(uid);

/**
 * Create a new Firebase user with email and password
 * @param email User email
 * @param password User password
 * @returns Firebase user record
 */
export const createUser = async (email: string, password: string) => {
  try {
    // Create user with Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });
    
    console.log(`[Firebase Admin] Created new user: ${userRecord.uid}, email: ${email}`);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email
    };
  } catch (error) {
    console.error('[Firebase Admin] Error creating user:', error);
    throw error;
  }
};

/**
 * Sign in with email and password (this is a custom implementation using Firebase REST API)
 * Note: Firebase Admin SDK doesn't have a direct sign-in method, so we use the REST API
 * @param email User email
 * @param password User password
 * @returns Firebase user info
 */
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    // Get the Firebase API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Firebase API key not found in environment variables');
    }

    // Call Firebase Auth REST API to sign in
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    console.log(`[Firebase Admin] Signed in user: ${response.data.localId}, email: ${email}`);
    
    return {
      uid: response.data.localId,
      email: response.data.email,
      idToken: response.data.idToken
    };
  } catch (error) {
    console.error('[Firebase Admin] Error signing in user:', error);
    throw error;
  }
};
