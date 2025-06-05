import { IAuthService } from '../interfaces/IAuthService';
import { prisma } from '../../prisma';

export class AuthService implements IAuthService {
  async createProvisionalUser(
    firebaseUid: string, 
    email: string, 
    tmpFaceUrl: string
  ): Promise<{ userId: string; tempNickname: string }> {
    // Generate a temporary nickname (could be more sophisticated)
    const tempNickname = this.generateTempNickname(email);

    // Create user profile with PENDING_PAYMENT status
    const profile = await prisma.profile.create({
      data: {
        id: firebaseUid,
        email,
        nickname: tempNickname,
        tmpFaceUrl,
        status: 'PENDING_PAYMENT',
        avatarUrl: null,
        deletedAt: null,
        deletionReason: null
      }
    });

    return {
      userId: profile.id,
      tempNickname: profile.nickname
    };
  }

  async updateUserStatus(
    userId: string, 
    status: 'ACTIVE_PENDING_PROFILE_SETUP' | 'ACTIVE_COMPLETE'
  ): Promise<void> {
    await prisma.profile.update({
      where: { id: userId },
      data: { status }
    });
  }

  async completeUserProfile(
    userId: string, 
    avatarUrl: string, 
    nickname: string
  ): Promise<void> {
    await prisma.profile.update({
      where: { id: userId },
      data: {
        avatarUrl,
        nickname,
        status: 'ACTIVE_COMPLETE'
      }
    });
  }

  private generateTempNickname(email: string): string {
    // Extract username part from email and add random suffix
    const username = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${username}_${randomSuffix}`;
  }
} 