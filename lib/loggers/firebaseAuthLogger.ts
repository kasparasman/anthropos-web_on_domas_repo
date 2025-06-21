import { admin } from '@/lib/firebase-admin'

/**
 * Logs Firebase authentication status given an ID token.
 * If no token is provided or verification fails, reports NOT_LOGGED_IN.
 */
export async function logFirebaseAuthStatus(idToken?: string) {
  if (!idToken) {
    console.log('[FirebaseAuth] Status: NOT_LOGGED_IN (no token)')
    return null
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true)
    console.log('[FirebaseAuth] Status: LOGGED_IN uid:', decoded.uid)
    return decoded
  } catch (e) {
    console.log('[FirebaseAuth] Status: NOT_LOGGED_IN (invalid/expired token)')
    return null
  }
} 