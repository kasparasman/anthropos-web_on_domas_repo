import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAndActivateUser } from '@/lib/services/assetService';

/**
 * A lightweight API wrapper for the asset generation service.
 * This can be used for manual triggers or testing, but the primary invocation
 * should be the direct service call from the Stripe webhook.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    // Acknowledge the request immediately.
    res.status(202).json({ message: 'Asset generation job received.' });

    // Execute the actual logic in the background.
    try {
        await generateAndActivateUser(userId);
    } catch (error) {
        // The service itself handles logging and marking the profile as failed.
        // We just log that the trigger itself failed here.
        console.error(`[API /generate-assets] Invocation for user ${userId} failed. See assetService logs for details.`);
    }
} 