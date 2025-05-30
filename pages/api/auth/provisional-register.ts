import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken, deleteFirebaseUser } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { indexFaceOnly } from '@/lib/rekognition/indexFace';

type ProvisionalRegisterRequestBody = {
  idToken: string;
  tmpFaceUrl: string;
};

type ProvisionalRegisterResponse = {
  success: boolean;
  message?: string;
  userId?: string;
  email?: string;
  tempNickname?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProvisionalRegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { idToken, tmpFaceUrl } = req.body as ProvisionalRegisterRequestBody;

  if (!idToken || !tmpFaceUrl) {
    return res.status(400).json({ success: false, message: 'Missing idToken or tmpFaceUrl' });
  }

  console.log('[API ProvisionalReg] Starting provisional registration flow');
  console.log('[API ProvisionalReg] Has tmpFaceUrl:', !!tmpFaceUrl);

  try {
    /* 1 ◀ Verify Firebase JWT */
    const decoded = await verifyIdToken(idToken);
    const { uid, email } = decoded;

    if (!email) {
      // This case should ideally be caught by Firebase rules or client-side validation
      // but good to have a safeguard.
      console.error('[API ProvisionalReg] Firebase token decoded but email is missing.');
      return res.status(400).json({ success: false, message: 'Email not found in token.' });
    }
    
    console.log('[API ProvisionalReg] Firebase user verified:', { uid, email });

    /* 2 ◀ Check for existing profile by email */
    const existingByEmail = await prisma.profile.findUnique({
      where: { email },
      select: { id: true, banned: true, status: true },
    });

    if (existingByEmail?.banned) {
      console.log('[API ProvisionalReg] User is banned:', email);
      // Consider deleting the new Firebase user if they are banned
      // await deleteFirebaseUser(uid); 
      return res.status(403).json({ success: false, message: 'ACCOUNT_BANNED' });
    }

    if (existingByEmail && existingByEmail.id !== uid) {
      console.log('[API ProvisionalReg] Email conflict:', email);
      // Delete the newly created Firebase user as the email is already in use by another profile
      await deleteFirebaseUser(uid);
      console.log('[API ProvisionalReg] Deleted Firebase user due to email conflict:', uid);
      return res.status(409).json({ success: false, message: 'EMAIL_ALREADY_IN_USE' });
    }
    
    // If the user exists with the same UID, and status is PENDING_PAYMENT, allow to proceed
    // (e.g. they closed the browser and are trying again)
    // If status is already active, this might be an error or re-registration attempt.
    if (existingByEmail && existingByEmail.id === uid && existingByEmail.status !== 'PENDING_PAYMENT') {
        console.log(`[API ProvisionalReg] User ${email} already exists with status: ${existingByEmail.status}.`);
        // Depending on desired logic, either error out or allow re-indexing face if that's a use case.
        // For now, let's prevent re-processing if not PENDING_PAYMENT.
        return res.status(409).json({ success: false, message: 'USER_ALREADY_REGISTERED_AND_PROCESSED' });
    }


    /* 3 ◀ Rekognition face indexing */
    let faceId: string | null = null;
    console.log('[API ProvisionalReg] Indexing face (already verified as unique by client)');
    try {
      faceId = await indexFaceOnly(tmpFaceUrl, email); // email is used for logging/tagging in Rekognition
      console.log('[API ProvisionalReg] Face indexed successfully, faceId:', faceId);
    } catch (faceError: any) {
      console.error('[API ProvisionalReg] Face indexing failed:', faceError.message);
      await deleteFirebaseUser(uid);
      console.log('[API ProvisionalReg] Deleted Firebase user after face indexing failure:', uid);
      // Forward a generic or specific error message
      return res.status(500).json({ success: false, message: 'FACE_INDEX_FAILED' });
    }

    /* 4 ◀ ATOMIC nickname generation and profile creation/update */
    let finalNickname: string;
    const profile = await prisma.$transaction(async (tx) => {
      let baseNickname = email.split('@')[0];
      let counter = 1;
      finalNickname = baseNickname;
      let isUnique = false;

      while (!isUnique) {
        const existingByNickname = await tx.profile.findUnique({
          where: { nickname: finalNickname },
          select: { id: true },
        });
        if (!existingByNickname || existingByNickname.id === uid) {
          isUnique = true;
        } else {
          finalNickname = `${baseNickname}_${counter}`; // Added underscore for clarity
          counter++;
        }
      }

      return await tx.profile.upsert({
        where: { id: uid },
        update: { // If user re-attempts provisional registration before payment
          rekFaceId: faceId,
          status: 'PENDING_PAYMENT', // Ensure status is PENDING_PAYMENT
          lastModifiedAt: new Date(),
        },
        create: {
          id: uid,
          email,
          nickname: finalNickname, // Temporary unique nickname
          rekFaceId: faceId,
          status: 'PENDING_PAYMENT', // Initial status
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          nickname: true,
        },
      });
    });

    console.log('[API ProvisionalReg] Profile provisionally created/updated:', profile.id);

    return res.status(200).json({
      success: true,
      message: 'Provisional registration successful.',
      userId: profile.id,
      email: profile.email,
      tempNickname: profile.nickname,
    });

  } catch (err: any) {
    console.error('[API ProvisionalReg] Provisional registration failed:', err.message, err.stack);
    // General error, attempt to clean up Firebase user if not already handled
    // Check if uid is available from decoded token, if not, this error is pre-token-verification
    if (idToken) {
        try {
            const decodedAttempt = await verifyIdToken(idToken).catch(() => null);
            if (decodedAttempt) {
                // Check if it's one of our specific thrown errors that already handled Firebase user deletion
                const noDeleteMessages = ['ACCOUNT_BANNED', 'EMAIL_ALREADY_IN_USE', 'FACE_INDEX_FAILED', 'USER_ALREADY_REGISTERED_AND_PROCESSED'];
                if (!noDeleteMessages.includes(err.message)) {
                    await deleteFirebaseUser(decodedAttempt.uid);
                    console.log('[API ProvisionalReg] Deleted Firebase user after general error:', decodedAttempt.uid);
                }
            }
        } catch (deleteError: any) {
            console.error('[API ProvisionalReg] Failed to decode token for cleanup or delete Firebase user:', deleteError.message);
        }
    }
    
    const knownErrors: { [key: string]: number } = {
        'ACCOUNT_BANNED': 403,
        'EMAIL_ALREADY_IN_USE': 409,
        'FACE_INDEX_FAILED': 500,
        'USER_ALREADY_REGISTERED_AND_PROCESSED': 409,
    };

    if (knownErrors[err.message]) {
        return res.status(knownErrors[err.message]).json({ success: false, message: err.message });
    }

    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
} 