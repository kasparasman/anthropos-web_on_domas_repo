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

/**
 * Kick off the email-verification flow for a freshly-created Firebase user.
 * 1. Pre-create Firestore status doc
 * 2. Send verification e-mail with continue URL
 * 3. Sign the user out so their ID-token cannot be mis-used
 */
export async function kickOffEmailVerification(user: User) {
  const db   = getFirestore();
  const auth = getAuth();

  // 1️⃣ Pre-create status doc so the first tab can listen
  await setDoc(
    doc(db, 'userVerificationStatus', user.uid),
    { emailVerified: false, createdAt: serverTimestamp() },
    { merge: true },
  );

  // 2️⃣ Send link
  await sendEmailVerification(user, {
    url: `${window.location.origin}/verifyEmail`, // your custom landing page
  });

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