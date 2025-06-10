import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Profile } from '@prisma/client';
import { generateAvatar } from '@/lib/services/avatarService';
import { generateUniqueNickname } from '@/lib/services/nicknameService';
import { getPromptForStyle } from '@/lib/services/promptService';
import { withPrismaRetry } from '@/lib/prisma/util';
import { indexFace } from '@/lib/services/faceIndexingService';

// This is our background job processor.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Basic security: In a real-world app, you might add a secret
    // passed between the webhook and this endpoint to ensure it's not called by malicious actors.
    // For now, we'll trust it's called internally.

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    // Acknowledge the request immediately to prevent the caller (the webhook) from waiting.
    res.status(202).json({ message: 'Asset generation started.' });

    // --- Start background processing ---
    console.log(`[GENERATOR] Starting asset generation for user ${userId}`);

    try {
        const profile = await withPrismaRetry(() => prisma.profile.findUnique({
            where: { id: userId },
        })) as (Profile & { tmpFaceUrl?: string | null; styleId?: string | null; gender?: string | null; });

        if (!profile || !profile.tmpFaceUrl || !profile.styleId || !profile.gender) {
            throw new Error(`Profile ${userId} is missing data required for generation.`);
        }

        // 1. Generate Avatar
        const avatarUrl = await generateAvatar(profile.tmpFaceUrl, profile.styleId);

        // 2. Index Face in Rekognition
        const rekFaceId = await indexFace(profile.tmpFaceUrl, userId);

        // 3. Generate Nickname
        const { archetype } = getPromptForStyle(profile.styleId);
        const nickname = await generateUniqueNickname({
            avatarUrl,
            gender: profile.gender as 'male' | 'female',
            archetype,
        });

        // 4. Update Profile to ACTIVE
        await withPrismaRetry(() => prisma.profile.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                avatarUrl: avatarUrl,
                nickname: nickname,
                rekFaceId: rekFaceId,
                tmpFaceUrl: null,
                styleId: null,
            },
        }));

        console.log(`[GENERATOR] ✅ Assets generated and profile activated for user ${userId}`);

    } catch (error) {
        console.error(`[GENERATOR] ❌ Failed to generate assets for user ${userId}:`, error);
        
        // If generation fails, mark the profile so we know not to retry automatically.
        await withPrismaRetry(() => prisma.profile.update({
            where: { id: userId },
            data: { status: 'ACTIVATION_FAILED' },
        })).catch(err => {
            // Log if even the failure update fails, but don't crash
            console.error(`[GENERATOR] CRITICAL: Failed to update profile status to ACTIVATION_FAILED for user ${userId}`, err);
        });
    }
} 