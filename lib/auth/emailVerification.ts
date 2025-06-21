'use client';

import {
  sendEmailVerification,
  getAuth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { sendVerifyMail } from './sendVerifyMail';

/**
 * Kick off the email-verification flow for a freshly-created Firebase user.
 * 1. Pre-create Firestore status doc
 * 2. Send verification e-mail with continue URL
 * 3. Sign the user out so their ID-token cannot be mis-used
 */
export async function kickOffEmailVerification(user: User) {
  //const db   = getFirestore();
  const auth = getAuth();

  console.log('[emailVerification] kickOffEmailVerification: Starting for user', user.uid);

 /* // 1️⃣ Pre-create status doc so the first tab can listen
  await setDoc(
    doc(db, 'userVerificationStatus', user.uid),
    { emailVerified: false, createdAt: serverTimestamp() },
    { merge: true },
  );
*/
  // 2️⃣ Send link
  if (user.email) {
    await sendVerifyMail(user.email);
    // log progress
    console.log('[emailVerification] kickOffEmailVerification: Email sent to', user.email);
    const db = getFirestore();
    await setDoc(
      doc(db, 'registrationProgress', user.uid),
      { step: 'EMAIL_SENT', message: 'Verification e-mail sent', ts: serverTimestamp() },
      { merge: true },
    );
  }
  /*
  await sendEmailVerification(user, {
    url: `${window.location.origin}/verifyEmail?mode=verifyEmail`,  // ← add mode
    handleCodeInApp: true   // <- false while emulating

  });*/
  
  console.log('[emailVerification] kickOffEmailVerification: Email sent to', user.email);
  // Note: we no longer sign out here to keep the session alive.
}

/**
 * Promise that resolves once Firestore status doc flips to emailVerified:true.
 */
export function waitForVerification(uid: string, timeoutMs = 30 * 60 * 1000): Promise<void> {
  const db  = getFirestore();
  const ref = doc(db, 'userVerificationStatus', uid);

  return new Promise((resolve, reject) => {
    let unsub: () => void = () => {};

    const timer = setTimeout(() => {
      unsub();
      reject(new Error('EMAIL_VERIFICATION_TIMED_OUT'));
    }, timeoutMs);

    unsub = onSnapshot(ref, (snap) => {
      if (snap.exists() && snap.data().emailVerified) {
        clearTimeout(timer);
        unsub();
        resolve();
      }
    });
  });
} 


/** Poll Auth until emailVerified=true or timeout. */
export async function pollForVerification(
  user: User,
  intervalMs = 3_000,
  timeoutMs  = 30 * 60 * 1000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    try {
      await user.reload();                // may throw user-token-expired
    } catch (e: unknown) {
      if ((e as any).code === 'auth/user-token-expired') {
        // ID-token revoked → force refresh with the refresh token we still hold
        await user.getIdToken(true);      // gets a brand-new ID-token
        await user.reload();              // and a fresh user record
      } else {
        throw e;                          // any other error: fail fast
      }
    }

    if (user.emailVerified) {
      // mark progress
      const db = getFirestore();
      await setDoc(
        doc(db, 'registrationProgress', user.uid),
        { step: 'EMAIL_VERIFIED', message: 'E-mail verified', ts: serverTimestamp() },
        { merge: true },
      );
      return;       // 🚀 success
    }

    if (Date.now() > deadline) {
      throw new Error('EMAIL_VERIFICATION_TIMED_OUT');
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
}
