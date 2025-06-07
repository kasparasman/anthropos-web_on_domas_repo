'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProfileButton() {
  const { data: session } = useSession()

  if (!session?.user) return null               // rendered only when logged-in

  const { image, nickname } = session.user as {
    image?: string | null
    nickname?: string | null
  }

  // We need a nickname to link to the profile page
  if (!nickname) {
    // Fallback or loading state if nickname isn't available right away.
    // This could also be an icon or a non-clickable button.
    return (
        <div className="rounded-full w-9 h-9 overflow-hidden border border-gray-500 bg-gray-700 animate-pulse" />
    );
  }

  return (
    <Link href={`/users/${nickname}`} passHref>
        <div className="rounded-full w-9 h-9 overflow-hidden border border-main cursor-pointer">
            <Image
              src={image ?? '/default-avatar.png'}
              alt="profile avatar"
              width={36}
              height={36}
              className="object-cover"
            />
        </div>
    </Link>
  )
}
