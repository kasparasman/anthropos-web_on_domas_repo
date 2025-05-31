import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from '../../../lib/firebase-admin'; // Adjust path as needed
import { prisma } from '../../../lib/prisma'; // Adjust path as needed

type Data = {
  success: boolean;
  message?: string;
  status?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Missing ID token' });
  }

  try {
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.status === 'PENDING_PAYMENT') {
      const updatedProfile = await prisma.profile.update({
        where: { id: userId },
        data: { status: 'ACTIVE_PENDING_PROFILE_SETUP' }, // New status after payment
      });
      console.log(`[API ConfirmPayment] User ${userId} status updated to ACTIVE_PENDING_PROFILE_SETUP`);
      return res.status(200).json({ 
        success: true, 
        message: 'Payment confirmed, profile status updated.', 
        status: updatedProfile.status 
      });
    } else if (profile.status === 'ACTIVE_PENDING_PROFILE_SETUP' || profile.status === 'ACTIVE_COMPLETE') {
      // If already updated or completed, consider it a success (idempotency)
      console.log(`[API ConfirmPayment] User ${userId} status already confirmed or completed: ${profile.status}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Payment already confirmed.', 
        status: profile.status 
      });
    } else {
      // Other statuses might indicate an issue or a different state
      console.warn(`[API ConfirmPayment] User ${userId} has status ${profile.status}, not PENDING_PAYMENT. No update performed.`);
      return res.status(400).json({ 
        success: false, 
        message: `Profile status is ${profile.status}, cannot confirm payment.`,
        status: profile.status
      });
    }
  } catch (error: any) {
    console.error('[API ConfirmPayment] Error:', error.message);
    if (error.message.includes('Firebase ID token has expired')) {
        return res.status(401).json({ success: false, message: 'Firebase token expired. Please sign in again.' });
    }
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
} 