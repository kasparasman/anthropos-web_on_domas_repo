/* hooks/useFirebaseNextAuth.ts ---------------------------------- */
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { firebaseAuth, logOutClient } from '@/lib/firebase-client'
import { signIn, signOut } from 'next-auth/react'
import { useRegistrationStatus } from './useRegistrationStatus'

/* --------------------------------------------------------------- */
/*  Context shape                                                  */
/* --------------------------------------------------------------- */
interface AuthSyncState {
  ready: boolean          // true after the first auth check
  user: User | null       // current Firebase user (or null)
  signOutFirebase: () => Promise<void>
}

const AuthSyncContext = createContext<AuthSyncState | null>(null)

/* --------------------------------------------------------------- */
/*  Provider – mount once in _app.tsx                              */
/* --------------------------------------------------------------- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const { isRegistrationInProgress } = useRegistrationStatus()

  useEffect(() => {
    /** Fires on every client-side auth change */
    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setUser(fbUser)

      if (fbUser) {
        // 1) Fetch a fresh ID token from Firebase
        const idToken = await fbUser.getIdToken()

        // 2) Only sign into NextAuth if not in the middle of registration
        if (!isRegistrationInProgress) {
          console.log('[AuthSync] Proceeding with NextAuth signIn')
          await signIn('credentials', { idToken, redirect: false })
        } else {
          console.log('[AuthSync] Registration in progress, deferring NextAuth signIn')
        }
      } else {
        // 3) Firebase signed out → clear Next-Auth session too
        await signOut({ redirect: false })
      }

      setReady(true)      // initial check complete
    })

    return unsub         // clean listener on unmount (HMR)
  }, [isRegistrationInProgress])

  const value: AuthSyncState = {
    ready,
    user,
    signOutFirebase: logOutClient,
  }

  return (
    <AuthSyncContext.Provider value={value}>
      {children}
    </AuthSyncContext.Provider>
  )
}

/* --------------------------------------------------------------- */
/*  Optional hook for consumers                                    */
/* --------------------------------------------------------------- */
export function useAuthSync() {
  const ctx = useContext(AuthSyncContext)
  if (!ctx)
    throw new Error('useAuthSync must be used within <AuthProvider>')
  return ctx
}
