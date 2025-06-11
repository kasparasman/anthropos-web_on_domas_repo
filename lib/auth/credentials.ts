/* lib/auth/credentials.ts --------------------------------------- */
import { verifyIdToken } from '../firebase-admin'
import { prisma } from '@/lib/prisma'

// Type for credentials now only expects idToken, as other details are handled by provisional registration.
type Creds = {
  idToken: string
}

const ALLOWED_STATUSES = [
  'ACTIVE',
  'SUBSCRIBED',
  'CANCEL_SCHEDULED',
  // add more internal statuses that still grant access here
];

export async function authorize(
  credentials: Creds | undefined,
): Promise<{ id: string; name: string; email: string; image?: string } | null> {
  if (!credentials?.idToken) {
    console.log('[Auth Credentials] No idToken provided.')
    return null
  }

  console.log('[Auth Credentials] Starting authorization flow for login.')

  try {
    /* 1 ◀ Verify Firebase JWT */
    const decoded = await verifyIdToken(credentials.idToken)
    const { uid, email = '' } = decoded
    console.log('[Auth Credentials] Firebase user verified:', { uid, email })

    /* 2 ◀ Fetch existing profile by ID (uid) */
    const profile = await prisma.profile.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        banned: true,
        status: true, // Crucial for checking registration/payment completion
      },
    })

    if (!profile) {
      console.log('[Auth Credentials] No profile found for UID:', uid)
      throw new Error('PROFILE_NOT_FOUND')
    }

    /* 3 ◀ Ban Check */
    if (profile.banned) {
      console.log('[Auth Credentials] User is banned:', email)
      throw new Error('ACCOUNT_BANNED')
    }

    /* 4 ◀ Status Check: Ensure user has completed payment */
    if (profile.status === 'PENDING_PAYMENT') {
      console.log('[Auth Credentials] User login denied - payment pending:', email, profile.status)
      throw new Error('PAYMENT_PENDING')
    }
    
    if (!ALLOWED_STATUSES.includes(profile.status)) {
      console.log('[Auth Credentials] User login denied - invalid status for login:', email, profile.status)
      throw new Error('INVALID_USER_STATUS_FOR_LOGIN')
    }

    console.log('[Auth Credentials] Profile retrieved and authorized for login:', profile.id, 'Status:', profile.status)

    /* 5 ◀ Return user data for Next-Auth session */
    return {
      id: profile.id,
      name: profile.nickname ?? 'User', // Fallback for safety, though nickname should exist
      email: profile.email,
      image: profile.avatarUrl ?? undefined,
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
        console.error('[Auth Credentials] Authorization failed during login:', err.message)

        const knownErrors = [
          'PROFILE_NOT_FOUND',
          'ACCOUNT_BANNED',
          'PAYMENT_PENDING',
          'INVALID_USER_STATUS_FOR_LOGIN'
        ]

        if (knownErrors.includes(err.message)) {
          throw err // Re-throw known errors to be handled by NextAuth
        }
        
        // For unknown errors that are actual Errors, log them.
        console.error('[Auth Credentials] Unknown error during authorize():', err)
    } else {
        // Handle cases where a non-Error was thrown
        console.error('[Auth Credentials] An unexpected non-Error was thrown:', err);
    }
    
    return null
  }
}
