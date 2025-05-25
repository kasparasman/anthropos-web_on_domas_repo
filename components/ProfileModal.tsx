// components/ProfileModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useAuthSync } from '../hooks/useFirebaseNextAuth'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  avatarUrl: string | null | undefined
  nickname: string | null | undefined
  email: string | null | undefined
}

export default function ProfileModal({
  open,
  onOpenChange,
  avatarUrl,
  nickname,
  email,
}: ProfileModalProps) {
  /* signOutFirebase logs out of Firebase;
     AuthProvider will then call next-auth signOut */
  const { signOutFirebase } = useAuthSync()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-foreground border border-main p-6 flex flex-col gap-6 focus:outline-none">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-smoke">Your Account</h2>
            <Dialog.Close asChild>
              <button>
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Avatar + info */}
          <div className="flex flex-col items-center gap-3">
            <Image
              src={avatarUrl ?? '/default-avatar.png'}
              width={1080}
              height={1080}
              alt="avatar"
              className="rounded-xl object-cover h-60 w-60"
            />
            <div className="text-2xl font-bold">{nickname ?? email}</div>
            <div className=" text-dim_smoke">{email}</div>
          </div>

          {/* Footer */}
          <button
            onClick={async () => {
              await signOutFirebase()      // <- logout both layers
              onOpenChange(false)          // close modal
            }}
            className="self-center px-4 py-2 bg-main text-black font-semibold uppercase rounded-md"
          >
            Sign out
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}