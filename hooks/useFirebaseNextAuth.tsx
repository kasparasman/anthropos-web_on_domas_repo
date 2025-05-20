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
import { firebaseAuth, logOutClient } from '../lib/firebase-client'
import { signIn, signOut } from 'next-auth/react'

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

  useEffect(() => {
    /** Fires on every client-side auth change */
    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setUser(fbUser)

      if (fbUser) {
        // 1) Fetch a fresh ID token from Firebase
        const idToken = await fbUser.getIdToken()

        // 2) Tell Next-Auth to create/update its session
        await signIn('credentials', { idToken, redirect: false })
      } else {
        // 3) Firebase signed out → clear Next-Auth session too
        await signOut({ redirect: false })
      }

      setReady(true)      // initial check complete
    })

    return unsub         // clean listener on unmount (HMR)
  }, [])

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
