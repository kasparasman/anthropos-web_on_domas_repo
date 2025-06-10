import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Profile } from '@prisma/client';
import { generateAvatar } from '@/lib/services/avatarService';
import { generateUniqueNicknames } from '@/lib/services/nicknameService';
import { getPromptForStyle } from '@/lib/services/promptService';
import { withPrismaRetry } from '@/lib/prisma/util';

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

        // 1. Generate Avatars (returns 3)
        const avatarUrls = await generateAvatar(profile.tmpFaceUrl, profile.styleId);
        
        // 2. Generate Nicknames (returns 3)
        const { archetype } = getPromptForStyle(profile.styleId);
        const nicknameOptions = await generateUniqueNicknames({
            avatarUrl: avatarUrls[0], // Use the first avatar as the reference image for nickname gen
            gender: profile.gender as 'male' | 'female',
            archetype,
        });

        // 3. Update Profile to AVATAR_SELECTION, store arrays
        await withPrismaRetry(() => prisma.profile.update({
            where: { id: userId },
            data: {
                status: 'AVATAR_SELECTION',
                avatarUrls: avatarUrls,
                nicknameOptions: nicknameOptions,
                tmpFaceUrl: null, // Clean up temporary data
                styleId: null,
            },
        }));

        console.log(`[GENERATOR] ✅ Avatar/nickname options ready for user ${userId}`);

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