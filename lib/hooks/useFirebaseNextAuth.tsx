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
  const [signOutFunc, setSignOutFunc] = useState(() => async () => {});
  const { isRegistrationInProgress } = useRegistrationStatus()

  useEffect(() => {
    // Dynamically import Firebase here
    import('@/lib/firebase-client').then(({ firebaseAuth, logOutClient }) => {
      setSignOutFunc(() => logOutClient);

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
        }

        setReady(true)      // initial check complete
      })

      return () => unsub(); // clean listener on unmount
    });
  }, [isRegistrationInProgress])

  const value: AuthSyncState = {
    ready,
    user,
    signOutFirebase: signOutFunc,
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
