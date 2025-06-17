/* ───── top of file ───── */
console.log('[markVerified] file start');

import * as functions from 'firebase-functions/v1';
console.log('[markVerified] imported functions');
import {
  getFirestore,
  FieldValue,                 // ← NEW import
} from 'firebase-admin/firestore';

import * as admin from 'firebase-admin';
console.log('[markVerified] imported admin');

admin.initializeApp();
console.log('[markVerified] admin initialised');

const db = getFirestore();     // modular replacement for admin.firestore()
console.log('[markVerified] got firestore');

export const markVerified = functions
  .region('europe-west1')
  .https.onCall(async (_data, context) => {
    console.log('[markVerified] handler entered', { uid: context.auth?.uid });

    /* 1 ─ auth guard */
    if (!context.auth?.uid) {
      console.warn('[markVerified] unauthenticated');
      throw new functions.https.HttpsError('unauthenticated', 'Not signed in');
    }

    /* 2 ─ fetch user */
    console.log('[markVerified] fetching user');
    const user = await admin.auth().getUser(context.auth.uid);

    if (!user.emailVerified) {
      console.warn('[markVerified] email not verified');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email address is not verified.'
      );
    }

    /* 3 ─ firestore update */
    console.log('[markVerified] writing firestore');
    await db
      .doc(`userVerificationStatus/${user.uid}`)
      .set(
        { emailVerified: true, updatedAt: FieldValue.serverTimestamp(), },
        { merge: true }
      );

    /* 4 ─ custom claim */
    console.log('[markVerified] setting custom claim');
    await admin.auth().setCustomUserClaims(user.uid, {
      ...(user.customClaims ?? {}),
      isVerified: true,
    });

    console.log('[markVerified] success');
    return { success: true };
  });
