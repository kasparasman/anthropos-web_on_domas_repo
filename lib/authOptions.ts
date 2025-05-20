// lib/authOptions.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authorize } from './auth/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      credentials: { idToken: { type: 'text' } },
      authorize
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id
        token.picture = user.image
        const profile = await prisma.profiles.findUnique({ where: { id: user.id } })
        token.nickname = profile?.nickname ?? null

      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          id:    token.id as string,
          nickname: token.nickname ?? null,
          email: session.user.email!,
          image: token.picture as string | undefined,
        }
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
