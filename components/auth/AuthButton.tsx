'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAuthSync } from '../../hooks/useFirebaseNextAuth'

interface AuthButtonProps {
  onLoginClick: () => void;
}

export default function AuthButton({ onLoginClick }: AuthButtonProps) {
  const { ready, user } = useAuthSync()   // Firebase state
  const { data: session, status } = useSession()           // NextAuth state

  /* ------------- still loading either auth state ------------- */
  if (!ready || status === 'loading')
    return <button className="px-4 py-1 bg-gray-500 rounded">…</button>

  /* ------------- Logged-in ➜ show nothing (ProfileButton will show) ------------- */
  if (user && session?.user) {
    return null  // Let ProfileButton handle the logged-in state
  }

  /* ------------- Logged-out ➜ show Sign-in / Sign-up -------------- */
  return (
    <div className="flex space-x-2">
      <button
        onClick={onLoginClick}
        className="px-4 py-1 bg-main text-background rounded"
      >
        Log in
      </button>
      <Link
        href="/register2"
        className="px-4 py-1 bg-main text-background rounded"
      >
        Sign up
      </Link>
    </div>
  )
}
