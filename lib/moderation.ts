// lib/moderation.ts
import { prisma } from './prisma'
import { admin } from './firebase-admin' // Your Firebase Admin SDK instance

/**
 * Ban a user in both Neon (Postgres) and Firebase.
 * @param userId - The Profile.id (UUID, same as Firebase UID)
 * @param reason - Reason for the ban (optional)
 */
export async function banUser(userId: string, reason?: string) {
  // 1. Update Neon (Postgres)
  await prisma.profile.update({
    where: { id: userId },
    data: {
      banned: true,
      banReason: reason,
      bannedAt: new Date(),
    },
  });

  // 2. Update Firebase
  await admin.auth().updateUser(userId, { disabled: true });
}