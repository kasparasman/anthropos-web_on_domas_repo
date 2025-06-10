import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useAuthSync } from '@/lib/hooks/useFirebaseNextAuth';

export default function UserAccountControls() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [showUnsubscribeConfirmation, setShowUnsubscribeConfirmation] = useState(false)
  const [unsubscribeInProgress, setUnsubscribeInProgress] = useState(false)
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null)
  const router = useRouter();
  const { signOutFirebase } = useAuthSync();

  const handleSignOut = async () => {
    await signOutFirebase();
  };

  const handleAccountDeletion = async () => {
    try {
      setDeletionInProgress(true);
      setDeletionError(null);
      const response = await axios.post('/api/user/delete-account', {
        reason: 'User requested deletion'
      });
      if (response.data.success) {
        await handleSignOut();
        router.push('/deleted-confirmation');
      } else {
        setDeletionError(response.data.message || 'Failed to delete account');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setDeletionError(axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred.');
      } else {
        setDeletionError('An unexpected error occurred.');
      }
    } finally {
      setDeletionInProgress(false);
    }
  };

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

  return (
    <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm">
      <button
        onClick={handleSignOut}
        className="w-full max-w-60 px-4 py-2 bg-main text-black font-semibold uppercase rounded-md"
      >
        Sign out
      </button>
      {!showUnsubscribeConfirmation && (
        <button
          onClick={() => {
            setShowUnsubscribeConfirmation(true)
            setShowDeleteConfirmation(false)
          }}
          className="self-center px-4 py-2 bg-foreground border border-gray w-60 text-orange-400 hover:border-orange-400 transition-all duration-300 rounded-md"
        >
          Cancel subscription
        </button>
      )}

      {showUnsubscribeConfirmation && (
        <div className="mt-4 p-4 border border-gray rounded-md bg-foreground">
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
              className="px-4 py-2 bg-gray text-smoke rounded-md hover:ring hover:ring-dim_smoke transition-all duration-300"
              disabled={unsubscribeInProgress}
            >
              Stay subscribed
            </button>
            <button
              onClick={handleSubscriptionCancellation}
              className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 hover:ring hover:ring-white transition-all duration-300 disabled:opacity-50"
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

      {!showDeleteConfirmation && (
        <button
          onClick={() => {
            setShowDeleteConfirmation(true)
            setShowUnsubscribeConfirmation(false)
          }}
          className="self-center px-4 py-2 bg-foreground border border-gray w-60 text-red-500 hover:border-red-500 transition-all duration-300 rounded-md"
        >
          Delete my account
        </button>
      )}

      {showDeleteConfirmation && (
        <div className="mt-4 p-4 border border-gray rounded-md bg-foreground">
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
              className="px-4 py-2 bg-gray text-smoke rounded-md hover:ring hover:ring-dim_smoke transition-all duration-300"
              disabled={deletionInProgress}
            >
              Cancel
            </button>
            <button
              onClick={handleAccountDeletion}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:ring hover:ring-white transition-all duration-300 disabled:opacity-50"
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
  );
}; 