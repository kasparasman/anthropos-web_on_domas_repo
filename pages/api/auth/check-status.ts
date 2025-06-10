import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withPrismaRetry } from '@/lib/prisma/util';
import { Profile } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const profile : Partial<Profile> | null = await withPrismaRetry(() => 
            prisma.profile.findUnique({
                where: { id: userId },
                select: {
                    status: true,
                    avatarUrl: true,
                    avatarUrls: true,
                    nickname: true,
                    nicknameOptions: true,
                    citizenId: true,
                },
            })
        );

        if (!profile) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            status: profile.status,
            avatarUrl: profile.avatarUrl,
            avatarUrls: profile.avatarUrls ?? [],
            nickname: profile.nickname,
            nicknameOptions: profile.nicknameOptions ?? [],
            citizenId: profile.citizenId,
        });

    } catch (error) {
        console.error(`Error fetching status for user ${userId}:`, error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
