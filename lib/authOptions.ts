/* lib/authOptions.ts -------------------------------------------- */
import { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authorize } from './auth/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },

  /* ─────── credentials provider (idToken ± tmpUrl/nickname) ───── */
  providers: [
    Credentials({
      name: 'Firebase',
      credentials: {
        idToken:  { label: 'ID token',  type: 'text' },
        tmpUrl:   { label: 'Temp URL', type: 'text' },     // optional
        nickname: { label: 'Nickname', type: 'text' },     // optional
      },
      authorize,
    }),
  ],

  /* ─────── JWT & session callbacks ─────── */
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id
        token.picture = user.image

        /* pull nickname from DB (or you can pass it via user) */
        const profile = await prisma.profiles.findUnique({
          where: { id: user.id as string },
          select: { nickname: true },
        })
        token.nickname = profile?.nickname ?? null
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user = {
          id:       token.id as string,
          nickname: token.nickname as string | null,
          email:    session.user.email!,          // already in session
          image:    token.picture as string | undefined,
        }
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
