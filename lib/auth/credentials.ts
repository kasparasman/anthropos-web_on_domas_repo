/* lib/auth/credentials.ts --------------------------------------- */
import { verifyIdToken } from '../firebase-admin'
import { prisma } from '@/lib/prisma'
import { promoteAvatar } from '../promoteAvatar'

type Creds = {
  idToken:  string
  tmpUrl?:  string   // present only during registration
  nickname?: string  // present only during registration
}

export async function authorize(
  credentials: Creds | undefined,
): Promise<{ id: string; name: string; email: string; image?: string } | null> {
  if (!credentials?.idToken) return null

  try {
    /* 1 ◀ verify Firebase JWT */
    const decoded = await verifyIdToken(credentials.idToken)
    const { uid, email = '' } = decoded

    /* 2 ◀ if tmpUrl present, move avatar to avatars/<uid>.png */
    let avatarUrl: string | null = null
    if (credentials.tmpUrl) {
      avatarUrl = await promoteAvatar(credentials.tmpUrl, uid)
    }

    /* 3 ◀ upsert profile row */
    const profile = await prisma.profiles.upsert({
      where:  { id: uid },
      update: {
        ...(avatarUrl && { avatar_url: avatarUrl }),
        ...(credentials.nickname && { nickname: credentials.nickname }),
      },
      create: {
        id:    uid,
        email,
        nickname: credentials.nickname || email.split('@')[0],
        avatar_url: avatarUrl,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
      },
    })

    /* 4 ◀ return user for Next-Auth session */
    return {
      id:    profile.id,
      name:  profile.nickname,
      email: profile.email,
      image: profile.avatar_url ?? undefined,
    }
  } catch (err) {
    console.error('authorize():', err)
    return null
  }
}
