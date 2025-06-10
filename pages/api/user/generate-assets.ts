import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAndActivateUser } from '@/lib/services/assetService';
import { Receiver } from '@upstash/qstash';

// Disable Next.js body parser for this route to handle raw body for verification
export const config = {
    api: {
        bodyParser: false,
    },
};

const qstashReceiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

/**
 * This API route is the subscriber for QStash background jobs.
 * It verifies the request signature and then executes the asset generation service.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    let userId: string;

    try {
        const body = await qstashReceiver.verify({
            signature: req.headers['upstash-signature'] as string,
            body: await (async (readable) => {
                const chunks = [];
                for await (const chunk of readable) {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                }
                return Buffer.concat(chunks).toString('utf-8');
            })(req),
        });

        // The parsed and verified body will be a JSON object
        const parsedBody = JSON.parse(body);
        userId = parsedBody.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required in the verified body.' });
        }

    } catch (error) {
        console.error('[QStash] Signature verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Now that the request is verified and we have the userId, execute the job.
    // QStash will wait for this to complete.
    try {
        console.log(`[generate-assets API] Received and verified job for user ${userId}. Starting processing.`);
        await generateAndActivateUser(userId);
        // Respond with success
        res.status(200).json({ message: `Successfully processed job for user ${userId}` });
    } catch (error) {
        // The service itself handles logging and marking the profile as failed.
        // We just log that the trigger itself failed here and return an error status to QStash.
        console.error(`[generate-assets API] Invocation for user ${userId} failed. See assetService logs for details.`);
        res.status(500).json({ message: `Processing failed for user ${userId}` });
    }
} 