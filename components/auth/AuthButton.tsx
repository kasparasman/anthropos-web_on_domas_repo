'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAuthSync } from '../../hooks/useFirebaseNextAuth'
import MainButton from '../UI/button'
import { useRouter } from 'next/navigation'

interface AuthButtonProps {
  onLoginClick: () => void;
}

export default function AuthButton({ onLoginClick }: AuthButtonProps) {
  const { ready, user } = useAuthSync()   // Firebase state
  const { data: session, status } = useSession()           // NextAuth state
  const router = useRouter()

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
      <MainButton
        onClick={onLoginClick}
        className="rounded-md py-0.5"
      >
        Log in
      </MainButton>
      <MainButton
        onClick={() => router.push('/register2')}
        className="rounded-md py-0.5"
      >
        Sign up
      </MainButton>
    </div>
  )
}
