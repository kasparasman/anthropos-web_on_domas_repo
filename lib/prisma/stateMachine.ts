/** @server-only */
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';

type RegistrationStatus = Prisma.RegistrationStatus;

/**
 * Atomically advance a user's registrationStatus inside a transaction.
 * - Row is locked with `FOR UPDATE` to avoid races.
 * - The transition is idempotent: if current status === nextStatus it resolves as a no-op.
 * - On failure the caller should catch and decide whether to retry or roll back.
 */
export async function advanceRegState(
  profileId: string,
  nextStatus: RegistrationStatus,
  meta?: JsonValue,
) {
  return prisma.$transaction(async (tx) => {
    // Lock the row so concurrent workers don't interleave updates.
    const [current] = await tx.$queryRaw<
      Array<{ status: RegistrationStatus; retry_count: number }>
    >`SELECT "registrationStatus" AS status, "regRetryCount" AS retry_count FROM "profiles" WHERE id = ${profileId} FOR UPDATE`;

    if (!current) throw new Error('REGISTRATION_ROW_NOT_FOUND');

    // Idempotent shortcut
    if (current.status === nextStatus) return { ok: true, noop: true } as const;

    return tx.profile.update({
      where: { id: profileId },
      data: {
        registrationStatus: nextStatus,
        regMeta: meta,
        // reset retry counter when moving forward
        regRetryCount: nextStatus !== current.status ? 0 : current.retry_count,
      },
    });
  });
} 