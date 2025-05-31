import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from '../../../lib/firebase-admin'; // Adjust if using NextAuth session
import { prisma } from '../../../lib/prisma';
import { getSession } from 'next-auth/react'; // Or from 'next-auth' for server-side

interface ProfileStatusData {
  success: boolean;
  message?: string;
  profile?: {
    id: string;
    email: string | null;
    status: string | null;
    tmpFaceUrl: string | null; // Needed for AvatarNicknameStep
    // Add other fields if needed by AuthModalManager to resume state
  };
}

// Helper to get user ID, attempting Firebase token first, then NextAuth session
async function getUserId(req: NextApiRequest): Promise<string | null> {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
      const decodedToken = await verifyIdToken(idToken);
      return decodedToken.uid;
    } catch (error) {
      console.warn('[API ProfileStatus] Invalid Firebase token:', error);
      // Fall through to try NextAuth session
    }
  }
  // If no Firebase token, try to get user from NextAuth session (server-side)
  // Note: For client-side calls, client should send idToken or use client-side getSession
  // This is a simplified example; robust session handling might be needed.
  const session = await getSession({ req }); 
  if (session?.user?.id) {
    return session.user.id;
  }
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileStatusData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user session found' });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
        tmpFaceUrl: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found for authenticated user.' });
    }

    return res.status(200).json({ 
      success: true, 
      profile: {
        id: profile.id,
        email: profile.email,
        status: profile.status,
        tmpFaceUrl: profile.tmpFaceUrl,
      }
    });

  } catch (error: any) {
    console.error('[API ProfileStatus] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
} 