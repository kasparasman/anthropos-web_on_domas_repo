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
    // High-level try-catch to ensure any unexpected error is logged.
    try {
        console.log(`[GENERATOR] Starting asset generation for user ${userId}`);

        console.log('[GENERATOR BREADCRUMB] 1. About to fetch profile.');
        const profile = await withPrismaRetry(() => prisma.profile.findUnique({
            where: { id: userId },
        })) as (Profile & { tmpFaceUrl?: string | null; styleId?: string | null; gender?: string | null; });
        console.log('[GENERATOR BREADCRUMB] 2. Profile fetched successfully.');

        if (!profile || !profile.tmpFaceUrl || !profile.styleId || !profile.gender) {
            console.error('[GENERATOR] Profile data is missing or incomplete.');
            throw new Error(`Profile ${userId} is missing data required for generation.`);
        }
        console.log('[GENERATOR BREADCRUMB] 3. Profile data validated.');

        // 1. Generate Avatar
        console.log('[GENERATOR BREADCRUMB] 4. About to generate avatar.');
        const avatarUrl = await generateAvatar(profile.tmpFaceUrl, profile.styleId);
        console.log('[GENERATOR BREADCRUMB] 5. Avatar generated successfully.');

        // 2. Index Face in Rekognition
        console.log('[GENERATOR BREADCRUMB] 6. About to index face.');
        const rekFaceId = await indexFace(profile.tmpFaceUrl, userId);
        console.log('[GENERATOR BREADCRUMB] 7. Face indexed successfully.');

        // 3. Generate Nickname
        console.log('[GENERATOR BREADCRUMB] 8. About to generate nickname.');
        const { archetype } = getPromptForStyle(profile.styleId);
        const nickname = await generateUniqueNickname({
            avatarUrl,
            gender: profile.gender as 'male' | 'female',
            archetype,
        });
        console.log('[GENERATOR BREADCRUMB] 9. Nickname generated successfully.');

        // 4. Update Profile to ACTIVE
        console.log('[GENERATOR BREADCRUMB] 10. About to update profile to ACTIVE.');
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
        console.log('[GENERATOR BREADCRUMB] 11. Profile updated successfully.');

        console.log(`[GENERATOR] ✅ Assets generated and profile activated for user ${userId}`);

    } catch (error) {
        console.error(`[GENERATOR] ❌ An unhandled error occurred in the asset generator for user ${userId}.`);
        console.error(`[GENERATOR] Error Message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`[GENERATOR] Error Stack: ${error instanceof Error ? error.stack : 'No stack available'}`);
        console.error(`[GENERATOR] Full Error Object:`, JSON.stringify(error, null, 2));

        // Attempt to mark the profile as failed to prevent it from being stuck.
        try {
            await withPrismaRetry(() => prisma.profile.update({
                where: { id: userId },
                data: { status: 'ACTIVATION_FAILED' },
            }));
            console.log(`[GENERATOR] Successfully marked profile ${userId} as ACTIVATION_FAILED.`);
        } catch (dbError) {
            console.error(`[GENERATOR] CRITICAL: Failed to update profile status to ACTIVATION_FAILED for user ${userId}. Manual intervention required.`, dbError);
        }
    }
} 