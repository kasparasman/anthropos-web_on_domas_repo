import { prisma } from '@/lib/prisma';
import { Profile, Prisma } from '@prisma/client';
import { generateAvatar } from '@/lib/services/avatarService';
import { generateUniqueNickname } from '@/lib/services/nicknameService';
import { getPromptForStyle } from '@/lib/services/promptService';
import { withPrismaRetry } from '@/lib/prisma/util';
import { indexFace } from '@/lib/services/faceIndexingService';
import { getNextCitizenId } from '@/lib/prisma/counter';
import { logProgress } from '@/lib/progressServer';

/**
 * The core logic for generating user assets (avatar, nickname) and activating the profile.
 * This is designed to be called from a trusted internal source, like a webhook handler.
 * @param userId The ID of the user profile to process.
 */
export async function generateAndActivateUser(userId: string): Promise<void> {
    // High-level try-catch to ensure any unexpected error is logged.
    try {
        console.log(`[assetService] Starting asset generation for user ${userId}`);
        await logProgress(userId, 'GEN_START', 'Starting asset generation');

        console.log('[assetService BREADCRUMB] 1. About to fetch profile.');
        const profile = await withPrismaRetry(() => prisma.profile.findUnique({
            where: { id: userId },
        })) as (Profile & { tmpFaceUrl?: string | null; styleId?: string | null; gender?: string | null; });
        console.log('[assetService BREADCRUMB] 2. Profile fetched successfully.');
        await logProgress(userId, 'PROFILE_FETCHED', 'Profile fetched from DB');

        if (!profile || !profile.tmpFaceUrl || !profile.styleId || !profile.gender) {
            console.error(`[assetService] Profile data is missing or incomplete for user ${userId}.`);
            throw new Error(`Profile ${userId} is missing data required for generation.`);
        }
        console.log('[assetService BREADCRUMB] 3. Profile data validated.');
        await logProgress(userId, 'PROFILE_VALIDATED', 'Profile data validated');

        // 1. Generate Avatar
        console.log('[assetService BREADCRUMB] 4. About to generate avatar.');
        await logProgress(userId, 'AVATAR_GEN_START', 'Starting avatar generation');
        const avatarUrl = await generateAvatar(profile.tmpFaceUrl, profile.styleId, userId);
        console.log('[assetService BREADCRUMB] 5. Avatar generated successfully.');
        await logProgress(userId, 'AVATAR_GENERATED', 'Avatar generated');

        // 2. Index Face in Rekognition
        console.log('[assetService BREADCRUMB] 6. About to index face.');
        await logProgress(userId, 'FACE_INDEX_START', 'Starting face indexing');
        const rekFaceId = await indexFace(profile.tmpFaceUrl, userId);
        console.log('[assetService BREADCRUMB] 7. Face indexed successfully.');
        await logProgress(userId, 'FACE_INDEXED', 'Face indexed');

        // 3. Generate Nickname
        console.log('[assetService BREADCRUMB] 8. About to generate nickname.');
        await logProgress(userId, 'NICKNAME_GEN_START', 'Starting nickname generation');
        const { archetype } = getPromptForStyle(profile.styleId);
        const nickname = await generateUniqueNickname({
            avatarUrl,
            gender: profile.gender as 'male' | 'female',
            archetype,
        });
        console.log('[assetService BREADCRUMB] 9. Nickname generated successfully.');
        await logProgress(userId, 'NICKNAME_GENERATED', 'Nickname generated');

        // 4. Update Profile to ACTIVE
        console.log('[assetService BREADCRUMB] 10. About to update profile to ACTIVE.');
        await logProgress(userId, 'PROFILE_UPDATE', 'Updating profile to ACTIVE');
        await withPrismaRetry(() =>
          prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const nextId = await getNextCitizenId(tx);

            await tx.profile.update({
              where: { id: userId },
              data: {
                citizenId: nextId,
                status: 'ACTIVE',
                registrationStatus: 'ACTIVE',
                avatarUrl: avatarUrl,
                nickname: nickname,
                rekFaceId: rekFaceId,
                tmpFaceUrl: null,
                styleId: null,
              },
            });
          })
        );
        console.log('[assetService BREADCRUMB] 11. Profile updated successfully.');

        console.log(`[assetService] ✅ Assets generated and profile activated for user ${userId}`);

    } catch (error) {
        console.error(`[assetService] ❌ An unhandled error occurred in the asset generator for user ${userId}.`);
        console.error(`[assetService] Error Message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // In a real app, you'd have more robust error telemetry here.

        // Attempt to mark the profile as failed to prevent it from being stuck.
        try {
            await withPrismaRetry(() => prisma.profile.update({
                where: { id: userId },
                data: { status: 'ACTIVATION_FAILED' },
            }));
            console.log(`[assetService] Successfully marked profile ${userId} as ACTIVATION_FAILED.`);
        } catch (dbError) {
            console.error(`[assetService] CRITICAL: Failed to update profile status to ACTIVATION_FAILED for user ${userId}. Manual intervention required.`, dbError);
        }
        
        // Re-throw the error so the calling context knows about the failure.
        throw error;
    }
} 