// lib/auth/credentials.ts
import { verifyIdToken } from '../firebase-admin'
import { prisma } from '@/lib/prisma'

/**
 * Credentials provider now expects a single field:  idToken
 * (set in hooks/useFirebaseNextAuth → signIn('credentials', { idToken }))
 */
export async function authorize(
  credentials: Record<'idToken', string> | undefined,
): Promise<{ id: string; name: string; email: string; image?: string } | null> {
  if (!credentials?.idToken) return null

  try {
    /* 1 ▶ Verify the Firebase ID token on the server */
    const decoded = await verifyIdToken(credentials.idToken)
    const { uid, email = '', name = '', picture } = decoded

    /* 2 ▶ Upsert (or fetch) your local profile row */
    const profile = await prisma.profiles.upsert({
      where:  { id: uid },
      update: {},
      create: {
        id:    uid,
        email,
        nickname: name || email.split('@')[0],
        avatar_url: picture ?? null,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
      },
    })

    /* 3 ▶ Return the user object Next-Auth expects */
    return {
      id:    profile.id,
      name:  profile.nickname,
      email: profile.email,
      image: profile.avatar_url ?? undefined,
    }
  } catch (err) {
    console.error('authorize(): token verification failed', err)
    return null
  }
}
