export interface PassportData {
  userId: string;
  email: string;
  nickname: string;
  avatarUrl: string;
  citizenId: number;
  issueDate: Date;
}

export interface PassportAsset {
  passportUrl: string;
  passportId: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    generatedAt: Date;
  };
}

export interface IPassportGeneratorService {
  /**
   * Generate a digital passport asset
   * @param passportData - Data to include in the passport
   * @returns Generated passport asset with URL and metadata
   */
  generatePassport(passportData: PassportData): Promise<PassportAsset>;

  /**
   * Retrieve the citizen ID for a user
   * @param userId - User ID to get citizen ID for
   * @returns User's numeric citizen ID
   */
  getCitizenId(userId: string): Promise<number>;

  /**
   * Validate passport data before generation
   * @param passportData - Data to validate
   * @returns true if valid, throws error with details if invalid
   */
  validatePassportData(passportData: PassportData): Promise<boolean>;
} 