'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthModal from './AuthModal'
import { useAuthSync } from '../../hooks/useFirebaseNextAuth'

export default function AuthButton() {
  const { ready, user, signOutFirebase } = useAuthSync()   // Firebase state
  const { data: session, status } = useSession()           // NextAuth state
  const [open, setOpen] = useState(false)

  /* ------------- still loading either auth state ------------- */
  if (!ready || status === 'loading')
    return <button className="px-4 py-1 bg-gray-500 rounded">…</button>

  /* ------------- Logged-in ➜ show nothing (ProfileButton will show) ------------- */
  if (user && session?.user) {
    return null  // Let ProfileButton handle the logged-in state
  }

  /* ------------- Logged-out ➜ show Sign-in / Sign-up -------------- */
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-1 bg-main text-background rounded"
      >
        Sign in / Sign up
      </button>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
