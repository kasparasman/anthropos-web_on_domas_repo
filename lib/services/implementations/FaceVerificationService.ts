import { IFaceVerificationService } from '../interfaces/IFaceVerificationService';
import { indexOrRejectFace, indexFaceOnly } from '../../rekognition/indexFace';

export class FaceVerificationService implements IFaceVerificationService {
  async verifyAndIndexFace(imageUrl: string, userId: string): Promise<string> {
    try {
      // Use the existing function that checks for duplicates AND indexes
      const faceId = await indexOrRejectFace(imageUrl, userId);
      return faceId;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'FACE_DUPLICATE') {
          throw new Error('A user with this face already exists in the system');
        }
        if (error.message === 'FACE_INDEX_FAILED') {
          throw new Error('Failed to process face image. Please try with a different photo');
        }
      }
      throw error;
    }
  }

  async checkFaceDuplicate(imageUrl: string): Promise<boolean> {
    try {
      // For duplicate checking, we'll use the same function but catch the specific error
      await indexOrRejectFace(imageUrl, 'temp_check');
      // If no error thrown, face is unique
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === 'FACE_DUPLICATE') {
        return false; // Face is duplicate
      }
      // For other errors, re-throw them
      throw error;
    }
  }
} 