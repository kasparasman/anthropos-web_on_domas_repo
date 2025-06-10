import { GetServerSideProps, NextPage } from 'next';
import { prisma } from '@/lib/prisma';
import Passport from '@/components/Passport';
import { Profile } from '@prisma/client';
import GridWithRays from '@/components/GridWithRays';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useAuthSync } from '@/lib/hooks/useFirebaseNextAuth';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';

// This type accurately reflects the serialized profile data passed as props
type SerializableProfile = {
  id: string;
  email: string;
  nickname: string | null;
  citizenId: number;
  warnings: number;
  banned: boolean;
  avatarUrl: string | null;
  status: string;
  rekFaceId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  tmpFaceUrl: string | null;
  gender: string | null;
  banReason: string | null;
  deletionReason: string | null;
  // Dates converted to strings
  createdAt: string;
  lastModifiedAt: string;
  stripeCurrentPeriodEnd: string | null;
  bannedAt: string | null;
  deletedAt: string | null;
};

interface UserProfilePageProps {
  profile: SerializableProfile | null;
}

const UserAccountControls = ({ onSignOut }: { onSignOut: () => void }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const router = useRouter();

  const handleAccountDeletion = async () => {
    try {
      setDeletionInProgress(true);
      setDeletionError(null);
      const response = await axios.post('/api/user/delete-account', {
        reason: 'User requested deletion'
      });
      if (response.data.success) {
        await onSignOut();
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
        onClick={onSignOut}
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

const UserProfilePage: NextPage<UserProfilePageProps> = ({ profile }) => {
  const { data: session } = useSession();
  const { signOutFirebase } = useAuthSync();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (session?.user && profile?.nickname) {
      const sessionNickname = (session.user as { nickname?: string })?.nickname;
      setIsOwner(sessionNickname === profile.nickname);
    } else {
      setIsOwner(false);
    }
  }, [session, profile]);

  if (!profile) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen text-white">
        <GridWithRays />
        <h1 className="text-4xl z-10">User Not Found</h1>
        <p className="text-yellow-400 my-4 z-10">
          The profile you are looking for does not exist.
        </p>
      </main>
    );
  }
  
  const handleSignOut = async () => {
      await signOutFirebase();
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-white p-4">
      <GridWithRays />
       <div className="h-full flex fixed justify-between bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
         <img src="/BurjKalifa.png" alt="background" className="hidden lg:block object-cover opacity-100 pointer-events-none" />
         <img src="/Building2.png" alt="background" className="hidden lg:block mr-[-300px] lg:mr-[-200px] object-cover opacity-100 pointer-events-none" />
       </div>
      <div className="z-10 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Anthropos Citizen Passport</h1>
        <Passport
          citizenId={profile.citizenId}
          nickname={profile.nickname || ''}
          gender={profile.gender as 'male' | 'female' || 'male'}
          avatarUrl={profile.avatarUrl || '/default-avatar.svg'}
        />
        {isOwner && <UserAccountControls onSignOut={handleSignOut} />}
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { nickname } = context.params as { nickname: string };

  try {
    const profile = await prisma.profile.findUnique({
      where: { nickname },
    });

    // The profile object contains dates, which are not directly serializable.
    // We need to convert them to strings or numbers.
    const serializableProfile = profile
      ? {
          ...profile,
          createdAt: profile.createdAt.toISOString(),
          lastModifiedAt: profile.lastModifiedAt.toISOString(),
          stripeCurrentPeriodEnd: profile.stripeCurrentPeriodEnd?.toISOString() || null,
          bannedAt: profile.bannedAt?.toISOString() || null,
          deletedAt: profile.deletedAt?.toISOString() || null,
        }
      : null;

    return {
      props: {
        profile: serializableProfile,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch profile for nickname ${nickname}:`, error);
    return {
      props: {
        profile: null, // Return null on error to show not found page
      },
    };
  }
};

export default UserProfilePage; 