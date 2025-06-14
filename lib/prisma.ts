// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { DATABASE_URL } from './dbUrl'

declare global {
  // allow global var reuse in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    datasourceUrl: DATABASE_URL, // explicitly pass to ensure runtime matches compile time
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
