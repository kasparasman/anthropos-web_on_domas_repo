/* lib/auth/credentials.ts --------------------------------------- */
import { verifyIdToken, deleteFirebaseUser } from '../firebase-admin'
import { prisma } from '@/lib/prisma'
import { promoteAvatar } from '../promoteAvatar'
import { indexFaceOnly } from '../rekognition/indexFace'

type Creds = {
  idToken:  string
  tmpAvatarUrl?:  string   // present only during registration
  nickname?: string  // present only during registration
  tmpFaceUrl?: string  // present only during registration
}

export async function authorize(
  credentials: Creds | undefined,
): Promise<{ id: string; name: string; email: string; image?: string } | null> {
  if (!credentials?.idToken) return null

  console.log('[Auth] Starting authorization flow')
  console.log('[Auth] Has tmpFaceUrl:', !!credentials.tmpFaceUrl)

  try {
    /* 1 ◀ verify Firebase JWT */
    const decoded = await verifyIdToken(credentials.idToken)
    const { uid, email = '' } = decoded
    
    console.log('[Auth] Firebase user verified:', { uid, email })
    
    /* 2 ◀ check for existing profile by email */
    const existingByEmail = await prisma.profile.findUnique({
      where: { email },
      select: { id: true, banned: true }
    })
    
    // Ban check
    if (existingByEmail?.banned) {
      console.log('[Auth] User is banned:', email)
      throw new Error('ACCOUNT_BANNED')
    }
    
    // Email conflict check (different user with same email)
    if (existingByEmail && existingByEmail.id !== uid) {
      console.log('[Auth] Email conflict:', email)
      throw new Error('EMAIL_ALREADY_IN_USE')
    }
    
    /* 3 ◀ nickname conflict check */
    let finalNickname = credentials.nickname || email.split('@')[0]
    
    if (credentials.nickname) {
      const existingByNickname = await prisma.profile.findUnique({ 
        where: { nickname: credentials.nickname },
        select: { id: true }
      })
      if (existingByNickname && existingByNickname.id !== uid) {
        console.log('[Auth] Nickname conflict:', credentials.nickname)
        
        // 🔧 NEW: Clean up Firebase user before throwing error
        try {
          await deleteFirebaseUser(uid)
          console.log('[Auth] Deleted Firebase user after nickname conflict:', uid)
        } catch (deleteError) {
          console.error('[Auth] Failed to delete Firebase user after nickname conflict:', deleteError)
        }
        
        throw new Error('NICKNAME_ALREADY_IN_USE')
      }
    } else {
      // If no nickname provided, ensure the generated one is unique
      let baseNickname = email.split('@')[0]
      let counter = 1
      let isUnique = false
      
      while (!isUnique) {
        const existingByNickname = await prisma.profile.findUnique({ 
          where: { nickname: finalNickname },
          select: { id: true }
        })
        
        if (!existingByNickname || existingByNickname.id === uid) {
          isUnique = true
        } else {
          finalNickname = `${baseNickname}${counter}`
          counter++
        }
      }
    }

    /* 4 ◀ Rekognition step only during REGISTER (tmpFaceUrl present) */
    let faceId: string | null = null
    if (credentials.tmpFaceUrl) {
      console.log('[Auth] Indexing face (already verified as unique)')
      try {
        faceId = await indexFaceOnly(credentials.tmpFaceUrl, email)
        console.log('[Auth] Face indexed successfully, faceId:', faceId)
      } catch (faceError: any) {
        console.error('[Auth] Face indexing failed unexpectedly:', faceError.message)
        // This shouldn't happen since we already checked for duplicates
        // But if it does, we still need to clean up the Firebase user
        try {
          await deleteFirebaseUser(uid)
          console.log('[Auth] Deleted Firebase user after unexpected face indexing failure:', uid)
        } catch (deleteError) {
          console.error('[Auth] Failed to delete Firebase user:', deleteError)
        }
        throw faceError
      }
    }
    
    /* 5 ◀ if tmpAvatarUrl present, move avatar to avatars/<uid>.png */
    const avatarUrl = credentials.tmpAvatarUrl
      ? await promoteAvatar(credentials.tmpAvatarUrl, uid)
      : null

    /* 6 ◀ upsert profile row */
    const profile = await prisma.profile.upsert({
      where:  { id: uid },
      update: {
        ...(avatarUrl && { avatarUrl }),
        ...(faceId && { rekFaceId: faceId }),
        ...(credentials.nickname && { nickname: finalNickname }),
      },
      create: {
        id:    uid,
        email,
        nickname: finalNickname,
        avatarUrl,
        rekFaceId: faceId,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
      },
    })

    console.log('[Auth] Profile created/updated successfully:', profile.id)

    /* 7 ◀ return user for Next-Auth session */
    return {
      id:    profile.id,
      name:  profile.nickname,
      email: profile.email,
      image: profile.avatarUrl ?? undefined,
    }
  } catch (err: any) {
    console.log('[Auth] Authorization failed:', err.message)
    
    // Let specific errors propagate, everything else becomes null
    const knownErrors = [
      'FACE_DUPLICATE', 
      'FACE_INDEX_FAILED', 
      'ACCOUNT_BANNED',
      'EMAIL_ALREADY_IN_USE',
      'NICKNAME_ALREADY_IN_USE'
    ]
    
    if (knownErrors.includes(err.message)) throw err
    
    console.error('authorize():', err)
    return null
  }
}
