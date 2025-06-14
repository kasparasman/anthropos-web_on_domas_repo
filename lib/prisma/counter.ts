import { Prisma } from '@prisma/client'

/**
 * Atomically increments and returns the next citizenId.
 * Must be called inside a Prisma transaction.
 */
export async function getNextCitizenId(tx: Prisma.TransactionClient): Promise<number> {
  const result = await tx.$queryRaw<{ value: number }[]>`
    UPDATE "counters"
    SET value = value + 1
    WHERE name = 'citizenId'
    RETURNING value;
  `
  return result[0].value
} 