export interface IFaceVerificationService {
  /**
   * Check if face already exists in the system and index it if unique
   * @param imageUrl - URL of the face image to verify
   * @param userId - User ID for external reference
   * @returns Face ID from recognition system
   * @throws Error if face is duplicate or verification fails
   */
  verifyAndIndexFace(imageUrl: string, userId: string): Promise<string>;

  /**
   * Check for face duplicates without indexing
   * @param imageUrl - URL of the face image to check
   * @returns true if face is unique, throws if duplicate
   */
  checkFaceDuplicate(imageUrl: string): Promise<boolean>;
} 