export interface AvatarStyle {
  id: string;
  label: string;
  styleImageUrl: string;
  gender: 'male' | 'female';
}

export interface AvatarGenerationResult {
  avatarUrl: string;
  generationId: string;
}

export interface IAvatarGenerationService {
  /**
   * Generate an avatar from a face image and style reference
   * @param faceImageUrl - URL of the user's face image
   * @param styleImageUrl - URL of the style reference image
   * @param userId - User ID for tracking/external reference
   * @returns Generated avatar URL and generation ID
   */
  generateAvatar(faceImageUrl: string, styleImageUrl: string, userId: string): Promise<AvatarGenerationResult>;

  /**
   * Get available avatar styles
   * @param gender - Filter by gender (optional)
   * @returns Array of available styles
   */
  getAvailableStyles(gender?: 'male' | 'female'): Promise<AvatarStyle[]>;

  /**
   * Check if avatar generation is complete
   * @param generationId - Generation ID to check
   * @returns Avatar URL if complete, null if still processing
   */
  checkGenerationStatus(generationId: string): Promise<string | null>;
} 