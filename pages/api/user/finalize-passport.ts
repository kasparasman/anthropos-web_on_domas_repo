import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withPrismaRetry } from '@/lib/prisma/util';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId, avatarUrl, nickname } = req.body;

    if (!userId || !avatarUrl || !nickname) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // Validate that the avatarUrl and nickname are among the options
        const profile = await withPrismaRetry(() => prisma.profile.findUnique({
            where: { id: userId },
            select: { avatarUrls: true, nicknameOptions: true }
        })) as { avatarUrls: string[]; nicknameOptions: string[] } | null;
        if (!profile) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (!profile.avatarUrls.includes(avatarUrl)) {
            return res.status(400).json({ message: 'Invalid avatar selection.' });
        }
        if (!profile.nicknameOptions.includes(nickname)) {
            return res.status(400).json({ message: 'Invalid nickname selection.' });
        }

        // Update profile with final selection
        await withPrismaRetry(() => prisma.profile.update({
            where: { id: userId },
            data: {
                avatarUrl,
                nickname,
                avatarUrls: [],
                nicknameOptions: [],
                status: 'ACTIVE',
            },
        }));

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error finalizing passport:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
} 