// components/ProfileModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useAuthSync } from '../hooks/useFirebaseNextAuth'
import Passport from './Passport'
import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  avatarUrl: string | null | undefined
  nickname: string | null | undefined
  email: string | null | undefined
  id?: number
  citizenId?: number
  gender?: 'male' | 'female'
}

export default function ProfileModal({
  open,
  onOpenChange,
  avatarUrl,
  nickname,
  email,
  id = 1,
  citizenId,
  gender = 'male',
}: ProfileModalProps) {
  /* signOutFirebase logs out of Firebase;
     AuthProvider will then call next-auth signOut */
  const { signOutFirebase } = useAuthSync()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deletionInProgress, setDeletionInProgress] = useState(false)
  const [deletionError, setDeletionError] = useState<string | null>(null)
  const [showUnsubscribeConfirmation, setShowUnsubscribeConfirmation] = useState(false)
  const [unsubscribeInProgress, setUnsubscribeInProgress] = useState(false)
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null)
  const router = useRouter()

  // Handle subscription cancellation process
  const handleSubscriptionCancellation = async () => {
    try {
      setUnsubscribeInProgress(true)
      setUnsubscribeError(null)

      console.log('Starting subscription cancellation process')

      // Call API endpoint to cancel subscription
      const response = await axios.post('/api/stripe/cancel-subscription', {
        reason: 'User requested cancellation'
      })

      console.log('Subscription cancellation response:', response.data)

      if (response.data.success) {
        setShowUnsubscribeConfirmation(false)
        // Could add a success message or redirect if needed
      } else {
        setUnsubscribeError(response.data.message || 'Failed to cancel subscription')
      }
    } catch (error: unknown) {
      console.error('Error cancelling subscription:', error)

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>
        setUnsubscribeError(
          axiosError.response?.data?.message ||
          axiosError.message ||
          'An unexpected error occurred while cancelling your subscription'
        )
      } else {
        setUnsubscribeError('An unexpected error occurred while cancelling your subscription')
      }
    } finally {
      setUnsubscribeInProgress(false)
    }
  }

  // Handle account deletion process
  const handleAccountDeletion = async () => {
    try {
      setDeletionInProgress(true)
      setDeletionError(null)

      console.log('Starting account deletion process')

      // Call API endpoint to delete account
      const response = await axios.post('/api/user/delete-account', {
        reason: 'User requested deletion'
      })

      console.log('Account deletion response:', response.data)

      if (response.data.success) {
        // Sign out after successful deletion
        await signOutFirebase()
        onOpenChange(false)

        // Redirect to deletion confirmation page
        router.push('/deleted-confirmation')
      } else {
        setDeletionError(response.data.message || 'Failed to delete account')
      }
    } catch (error: unknown) {
      console.error('Error deleting account:', error)

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>
        setDeletionError(
          axiosError.response?.data?.message ||
          axiosError.message ||
          'An unexpected error occurred while deleting your account'
        )
      } else {
        setDeletionError('An unexpected error occurred while deleting your account')
      }
    } finally {
      setDeletionInProgress(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed h-full sm:h-auto items-center justify-center left-1/2 top-1/2 w-full sm:w-auto -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black sm:border border-main p-8 flex flex-col gap-6 focus:outline-none z-50">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className=" text-2xl whitespace-nowrap sm:text-2xl font-semibold text-smoke">Your Anthopos City account</h2>
            <Dialog.Close asChild>
              <button>
                <X size={20} className="absolute top-4 right-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Passport Component */}
          <Passport
            id={id}
            citizenId={citizenId}
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
              onClick={() => setShowUnsubscribeConfirmation(true)}
              className="self-center px-4 py-2 text-orange-500 hover:underline"
            >
              Cancel subscription
            </button>

            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="self-center px-4 py-2 text-red-500 hover:underline"
            >
              Delete my account
            </button>

            {showUnsubscribeConfirmation && (
              <div className="mt-4 p-4 border border-orange-500 rounded-md bg-black/50">
                <p className="text-smoke text-center mb-4">Are you sure you want to cancel your monthly subscription? You will lose access to premium features.</p>

                {unsubscribeError && (
                  <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-smoke text-center">
                    {unsubscribeError}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowUnsubscribeConfirmation(false)
                      setUnsubscribeError(null)
                    }}
                    className="px-4 py-2 bg-gray text-smoke rounded-md hover:bg-gray-700"
                    disabled={unsubscribeInProgress}
                  >
                    Stay Subscribed
                  </button>
                  <button
                    onClick={handleSubscriptionCancellation}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                    disabled={unsubscribeInProgress}
                  >
                    {unsubscribeInProgress ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>

                <p className="mt-4 text-xs text-dim_smoke text-center">
                  Note: Your subscription will remain active until the end of the current billing period.
                </p>
              </div>
            )}

            {showDeleteConfirmation && (
              <div className="mt-4 p-4 border border-red-500 rounded-md bg-black/50">
                <p className="text-smoke text-center mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>

                {deletionError && (
                  <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-smoke text-center">
                    {deletionError}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowDeleteConfirmation(false)
                      setDeletionError(null)
                    }}
                    className="px-4 py-2 bg-gray text-smoke rounded-md hover:bg-gray-700"
                    disabled={deletionInProgress}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccountDeletion}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={deletionInProgress}
                  >
                    {deletionInProgress ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>

                <p className="mt-4 text-xs text-dim_smoke text-center">
                  Note: You will not be able to register a new account using the same face.
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}