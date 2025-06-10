import { GetServerSideProps, NextPage } from 'next';
import { prisma } from '@/lib/prisma';
import { Profile } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
//import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import components with client-side dependencies
const UserAccountControls = dynamic(
  () => import('@/components/auth/UserAccountControls'),
  { ssr: false, loading: () => <div className="h-24" /> }
);
const Passport = dynamic(() => import('@/components/Passport'), {
  ssr: false,
  loading: () => <div className="w-60 h-96 bg-black/20 rounded-lg animate-pulse" />,
});
const GridWithRays = dynamic(() => import('@/components/GridWithRays'), {
  ssr: false,
});

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

const UserProfilePage: NextPage<UserProfilePageProps> = ({ profile }) => {
  const { data: session } = useSession();
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
        {isOwner && <UserAccountControls />}
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