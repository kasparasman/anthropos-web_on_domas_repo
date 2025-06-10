// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { on } from 'node:process'

// Runtime guard for fatal errors
on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err)
})

declare global {
  // allow global var reuse in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
