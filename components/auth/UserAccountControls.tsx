import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useAuthSync } from '@/lib/hooks/useFirebaseNextAuth';

export default function UserAccountControls() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
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

  return (
    <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-sm">
      <button
        onClick={handleSignOut}
        className="w-full px-4 py-2 bg-main text-black font-semibold uppercase rounded-md"
      >
        Sign out
      </button>
      <button
        onClick={() => setShowDeleteConfirmation(true)}
        className="px-4 py-2 text-red-500 hover:underline"
      >
        Delete my account
      </button>

      {showDeleteConfirmation && (
        <div className="mt-4 p-4 border border-red-500 rounded-md bg-black/50 w-full">
          <p className="text-white text-center mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
          {deletionError && (
            <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-white text-center">
              {deletionError}
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setShowDeleteConfirmation(false); setDeletionError(null); }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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
          <p className="mt-4 text-xs text-gray-400 text-center">
            Note: As per our security policy, you cannot register a new account using the same face.
          </p>
        </div>
      )}
    </div>
  );
}; 