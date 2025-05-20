// types/next-auth.d.ts
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /** Extend session.user */
  interface Session {
    user: {
      id: string           // ← we add this
      nickname: string | null

    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  /** Extend token returned in JWT callback */
  interface JWT {
    id: string
    nickname?: string | null
    picture?: string | null
  }
}
