// functions/src/index.ts
import * as functions from 'firebase-functions/v1';   // ← v1 helper set
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Callable used by /verify-email page after applyActionCode().
 * The caller must still be signed-in, so context.auth.uid is present.
 */
export const markVerified = functions
  .region('europe-west1')
  .https.onCall(async (_data, context) => {
    /* ─── 1. Auth context guard ─────────────────────────────── */
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be signed in to call markVerified.'
      );
    }

    /* ─── 2. Double-check the Auth record ───────────────────── */
    const user = await admin.auth().getUser(uid);
    if (!user.emailVerified) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email address is not verified.'
      );
    }

    /* ─── 3. Firestore: idempotent update ───────────────────── */
    await db
      .doc(`userVerificationStatus/${uid}`)
      .set(
        {
          emailVerified: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    /* ─── 4. Merge existing custom claims ───────────────────── */
    const prevClaims = user.customClaims ?? {};
    await admin.auth().setCustomUserClaims(uid, {
      ...prevClaims,
      isVerified: true,
    });

    return { success: true };
  });
