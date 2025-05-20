'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import ProfileModal from './ProfileModal'

export default function ProfileButton() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null               // rendered only when logged-in

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

      {/* Profile modal */}
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
