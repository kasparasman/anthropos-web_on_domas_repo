// components/ProfileModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useAuthSync } from '../hooks/useFirebaseNextAuth'
import Passport from './Passport'
import { useState } from 'react'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  avatarUrl: string | null | undefined
  nickname: string | null | undefined
  email: string | null | undefined
  id?: number
  gender?: 'male' | 'female'
}

export default function ProfileModal({
  open,
  onOpenChange,
  avatarUrl,
  nickname,
  email,
  id = 1, // Change later on
  gender = 'male', // Change later on
}: ProfileModalProps) {
  /* signOutFirebase logs out of Firebase;
     AuthProvider will then call next-auth signOut */
  const { signOutFirebase } = useAuthSync()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed h-full sm:h-auto items-center justify-center left-1/2 top-1/2 w-full sm:w-auto -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black sm:border border-main p-8 flex flex-col gap-6 focus:outline-none">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className=" text-xl whitespace-nowrap sm:text-2xl font-semibold text-smoke">Your Anthopos City account</h2>
            <Dialog.Close asChild>
              <button>
                <X size={20} className="absolute top-4 right-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Passport Component */}
          <Passport
            id={id}
            nickname={nickname ?? email ?? 'Anonymous'}
            gender={gender}
            avatarUrl={avatarUrl ?? '/default-avatar.png'}
          />

          {/* Footer */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={async () => {
                await signOutFirebase()      // <- logout both layers
                onOpenChange(false)          // close modal
              }}
              className="self-center px-4 py-2 bg-main text-black font-semibold uppercase rounded-md"
            >
              Sign out
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="self-center px-4 py-2 text-red-500 hover:underline"
            >
              Delete my account
            </button>

            {showDeleteConfirmation && (
              <div className="mt-4 p-4 border border-red-500 rounded-md bg-black/50">
                <p className="text-smoke text-center mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="px-4 py-2 bg-gray-600 text-smoke rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement account deletion logic
                      console.log('Account deletion requested')
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}