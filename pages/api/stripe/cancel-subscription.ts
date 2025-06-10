import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const cancelSubscriptionSchema = z.object({
  reason: z.string().min(1, 'Reason for cancellation is required.'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const result = cancelSubscriptionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, message: 'Invalid request body.', errors: result.error.errors });
  }

  try {
    const userProfile = await prisma.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!userProfile || !userProfile.stripeSubscriptionId) {
      return res.status(404).json({ success: false, message: 'Active subscription not found.' });
    }

    // Request to cancel the subscription at the end of the current billing period
    const updatedSubscription = await stripe.subscriptions.update(userProfile.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Optionally, you can update your database here to reflect the cancellation status
    // For example, setting a `cancelAtPeriodEnd` flag on the profile.
    // For now, we rely on Stripe as the source of truth, which will be fetched on page load.

    console.log(`Subscription ${updatedSubscription.id} for ${session.user.email} scheduled for cancellation.`);

    return res.status(200).json({ success: true, message: 'Subscription cancellation scheduled successfully.' });
  } catch (error) {
    console.error('Stripe subscription cancellation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ success: false, message: `Subscription cancellation failed: ${errorMessage}` });
  }
} 