import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import { deleteUserAccount } from '../../../lib/services/accountDeletionService';

type ResponseData = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get authenticated user from session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - you must be logged in to delete your account' 
      });
    }

    const userId = session.user.id;
    console.log(`[API DeleteAccount] Received deletion request for user: ${userId}`);
    
    // Get optional reason from request body
    const { reason } = req.body as { reason?: string };
    
    // Process account deletion
    const success = await deleteUserAccount(userId, reason);
    
    if (success) {
      console.log(`[API DeleteAccount] Successfully deleted account for user: ${userId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Account has been successfully deleted' 
      });
    } else {
      console.error(`[API DeleteAccount] Failed to delete account for user: ${userId}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete account. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('[API DeleteAccount] Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred during account deletion' 
    });
  }
} 