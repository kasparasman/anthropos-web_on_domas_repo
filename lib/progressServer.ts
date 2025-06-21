/** @server-only */
import { admin } from '@/lib/firebase-admin'

/**
 * Logs a human-readable progress message for the given user.
 * The document path is: registrations/{uid}/progress
 */
export async function logProgress(uid: string, step: string, message: string) {
  // Build the data object
  const data: Record<string, any> = {
    step,
    message,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  // Remove any undefined fields
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  await admin
    .firestore()
    .doc(`registrationProgress/${uid}`)
    .set(
      data,
      { merge: true },
    )
} 