import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

/**
 * Logs the current NextAuth session status for every request.
 * Usage: await logNextAuthStatus(req)
 */
export async function logNextAuthStatus(req: NextRequest) {
  const token = await getToken({ req })
  const status = token ? 'LOGGED_IN' : 'NOT_LOGGED_IN'
  console.log(`[NextAuth] Status: ${status}`)
  return token
} 