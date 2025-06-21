import { Prisma } from '@prisma/client'

/**
 * Atomically increments and returns the next citizenId.
 * Must be called inside a Prisma transaction.
 */
export async function getNextCitizenId(tx: Prisma.TransactionClient): Promise<number> {
  /*
   * Atomically insert the counter row if it doesn't exist, then increment and return.
   * This single-statement UPSERT guarantees we never skip or duplicate IDs even if
   *   a) the row was missing, or
   *   b) multiple concurrent transactions race.
   *
   * Logic:
   *   1. Try to INSERT (citizenId, 1).
   *   2. If row exists, ADD 1 to current value.
   *   3. RETURN the new value in both cases.
   */
  const result = await tx.$queryRaw<{ value: number }[]>`
    INSERT INTO "counters" ("name", "value")
    VALUES ('citizenId', 1)
    ON CONFLICT ("name") DO UPDATE
      SET "value" = "counters"."value" + 1
    RETURNING "value";
  `
  return result[0].value
} 