export interface IAuthService {
  /**
   * Create a provisional user account
   * @param firebaseUid - Firebase user ID
   * @param email - User email
   * @param tmpFaceUrl - Temporary face image URL for verification
   * @returns User ID and temporary nickname
   */
  createProvisionalUser(firebaseUid: string, email: string, tmpFaceUrl: string): Promise<{
    userId: string;
    tempNickname: string;
  }>;

  /**
   * Update user profile status after payment completion
   * @param userId - User ID
   * @param status - New status to set
   */
  updateUserStatus(userId: string, status: 'ACTIVE_PENDING_PROFILE_SETUP' | 'ACTIVE_COMPLETE'): Promise<void>;

  /**
   * Complete user profile with avatar and nickname
   * @param userId - User ID
   * @param avatarUrl - Final avatar URL
   * @param nickname - User nickname
   */
  completeUserProfile(userId: string, avatarUrl: string, nickname: string): Promise<void>;
} 