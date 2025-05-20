// components/ProfileButton.tsx
'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Image from 'next/image'
import ProfileModal from './ProfileModal'

export default function ProfileButton() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  /* ---------------- unauthenticated ---------------- */
  if (status === 'loading') {
    return <div className="w-9 h-9 rounded-full bg-zinc-700 animate-pulse" />
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn()}
        className="px-3 py-1 bg-main text-background rounded-md text-sm"
      >
        Sign in
      </button>
    )
  }

  /* ---------------- authenticated ---------------- */
  const { image, nickname, email } = session.user as {
    image?: string | null
    nickname?: string | null
    email: string | null
  }

  return (
    <>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-full w-9 h-9 overflow-hidden border border-main"
      >
        <Image
          src={image ?? '/default-avatar.png'}
          alt="profile avatar"
          width={36}
          height={36}
          className="object-cover"
        />
      </button>

      {/* Modal */}
      <ProfileModal
        open={open}
        onOpenChange={setOpen}
        avatarUrl={image}
        nickname={nickname}
        email={email}
      />
    </>
  )
}
