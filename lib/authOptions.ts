/* lib/authOptions.ts -------------------------------------------- */
import { NextAuthOptions, Session, User  } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authorize } from './auth/credentials'
import { prisma } from './prisma'
import { JWT } from 'next-auth/jwt'

/** Extend the JWT type on the fly so TS lets us add props */
type AppToken = JWT & {
  nickname?: string | null
  picture?: string
  banned?: boolean
  citizenId?: number | null
  billingStatus?: string | null     // legacy column
  registrationStatus?: string | null
  subscriptionExpires?: string | null // ISO string of stripeCurrentPeriodEnd
}
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },

  /* ─────── credentials provider (idToken ± tmpUrl/nickname) ───── */
  providers: [
    Credentials({
      name: 'Firebase',
      credentials: {
        idToken:  { label: 'ID token',  type: 'text' },
        tmpAvatarUrl:  { label: 'Temp Avatar URL', type: 'text' },     // optional
        tmpFaceUrl:   { label: 'Temp Face URL', type: 'text' },     // optional
        nickname: { label: 'Nickname', type: 'text' },     // optional
      },
      authorize,
    }),
  ],

  /* ─────── Callbacks ─────── */
  callbacks: {

    async signIn({ user }) {
      // user.id should be the Firebase UID, which matches Profile.id
      const profile = await prisma.profile.findUnique({ where: { id: user.id } });
      if (!profile || profile.banned) {
        return false; // Block sign-in if banned
      }
      return true;
    },

    /** runs on *every* request carrying a JWT cookie */
    async jwt({ token, user }) {
      const t = token as AppToken         // type helper

      /* 1️⃣  If this is the *initial* login attach id & picture */
      if (user) {
        t.id      = (user as User).id
        t.picture = (user as User).image ?? undefined
        if ((user as any).registrationStatus !== undefined) {
          t.registrationStatus = (user as any).registrationStatus;
        }
      }

      /* 2️⃣  Look up profile by token.id (present after first login) */
      if (t.id) {
        const profile = await prisma.profile.findUnique({
          where : { id: t.id },
          select: { banned: true, nickname: true, avatarUrl: true, citizenId: true, status: true, stripeCurrentPeriodEnd: true, registrationStatus: true },
        })

        if (profile) {
          t.nickname = profile.nickname ?? null
          t.picture  = profile.avatarUrl ?? t.picture
          t.banned   = !!profile.banned
          t.citizenId           = profile.citizenId ?? null
          t.billingStatus       = profile.status
          t.subscriptionExpires = profile.stripeCurrentPeriodEnd?.toISOString() ?? null
          t.registrationStatus  = profile.registrationStatus ?? null
        }
      }
      return t
    },

    /** shapes the session object returned by useSession() */
    async session({ session, token }) {
      const t = token as AppToken

      /* 3️⃣  If banned, invalidate the session immediately */
      if (t.banned) {
        // no active session → user is signed-out on the client
        return null as unknown as Session
      }
    
      if (session.user) {
        session.user = {
          id      : t.id!,
          nickname: t.nickname ?? null,
          email   : session.user.email!,     // already present
          image   : t.picture,
          citizenId: t.citizenId ?? null,
          billingStatus      : t.billingStatus ?? null,
          registrationStatus : t.registrationStatus ?? null,
          subscriptionExpires: t.subscriptionExpires ?? null,
        } as typeof session.user & {
          billingStatus: string | null
          registrationStatus: string | null
          subscriptionExpires: string | null
        }
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
