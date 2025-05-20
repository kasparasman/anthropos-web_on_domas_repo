'use client'

import { useState } from 'react'
import AuthModal from './AuthModal'
import { useAuthSync } from '../../hooks/useFirebaseNextAuth'

export default function AuthButton() {
  const { ready, user, signOutFirebase } = useAuthSync()   // ← context
  const [open, setOpen] = useState(false)

  /* ------------- still loading initial Firebase state ------------- */
  if (!ready)
    return <button className="px-4 py-1 bg-gray-500 rounded">…</button>

  /* ------------- Logged-in ➜ show Sign-out ------------------------ */
  if (user) {
    return (
      <button
        onClick={signOutFirebase}            // logs out both layers
        className="px-4 py-1 bg-red-500 text-white rounded"
      >
        Sign out
      </button>
    )
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
