import { 
  IAuthService, 
  IFaceVerificationService, 
  IPaymentService, 
  IAvatarGenerationService, 
  IPassportGeneratorService,
  PaymentPlan,
  AvatarStyle,
  PassportData
} from '../interfaces';

export interface RegistrationData {
  // Firebase auth data
  firebaseUid: string;
  email: string;
  
  // Face verification
  faceImageUrl: string;
  
  // Payment
  plan: PaymentPlan;
  paymentMethodId: string;
  
  // Avatar generation
  selectedStyleId: string;
  gender: 'male' | 'female';
  
  // Profile
  nickname?: string; // Optional, will be generated if not provided
}

export interface RegistrationProgress {
  stage: 'auth' | 'face_verification' | 'payment' | 'avatar_generation' | 'passport_creation' | 'complete' | 'error';
  percent: number;
  message: string;
  error?: string;
}

export interface RegistrationResult {
  success: boolean;
  userId?: string;
  passportUrl?: string;
  error?: string;
}

export class RegistrationOrchestrator {
  constructor(
    private authService: IAuthService,
    private faceVerificationService: IFaceVerificationService,
    private paymentService: IPaymentService,
    private avatarGenerationService: IAvatarGenerationService,
    private passportGeneratorService: IPassportGeneratorService
  ) {}

  async execute(
    data: RegistrationData,
    progressCallback: (progress: RegistrationProgress) => void
  ): Promise<RegistrationResult> {
    let userId: string | null = null;
    let tempNickname: string | null = null;
    
    try {
      // Stage 1: Create provisional user
      progressCallback({
        stage: 'auth',
        percent: 10,
        message: 'Creating user account...'
      });

      const userResult = await this.authService.createProvisionalUser(
        data.firebaseUid,
        data.email,
        data.faceImageUrl
      );
      userId = userResult.userId;
      tempNickname = userResult.tempNickname;

      // Stage 2: Face verification and indexing
      progressCallback({
        stage: 'face_verification',
        percent: 25,
        message: 'Verifying face uniqueness...'
      });

      await this.faceVerificationService.verifyAndIndexFace(data.faceImageUrl, userId);

      // Stage 3: Process payment
      progressCallback({
        stage: 'payment',
        percent: 45,
        message: 'Processing payment...'
      });

      const paymentResult = await this.paymentService.processPayment(
        data.email,
        data.plan,
        data.paymentMethodId
      );

      if (paymentResult.status !== 'succeeded') {
        throw new Error(`Payment failed with status: ${paymentResult.status}`);
      }

      // Update user status after successful payment
      await this.authService.updateUserStatus(userId, 'ACTIVE_PENDING_PROFILE_SETUP');

      // Stage 4: Generate avatar
      progressCallback({
        stage: 'avatar_generation',
        percent: 65,
        message: 'Generating your digital avatar...'
      });

      const availableStyles = await this.avatarGenerationService.getAvailableStyles(data.gender);
      const selectedStyle = availableStyles.find(style => style.id === data.selectedStyleId);
      
      if (!selectedStyle) {
        throw new Error(`Style ${data.selectedStyleId} not found`);
      }

      const avatarResult = await this.avatarGenerationService.generateAvatar(
        data.faceImageUrl,
        selectedStyle.styleImageUrl,
        userId
      );

      // Stage 5: Generate passport
      progressCallback({
        stage: 'passport_creation',
        percent: 85,
        message: 'Forging your digital passport...'
      });

      // Get the auto-assigned citizen ID from the database
      const citizenId = await this.passportGeneratorService.getCitizenId(userId);
      const finalNickname = data.nickname || tempNickname;
      
      const passportData: PassportData = {
        userId,
        email: data.email,
        nickname: finalNickname,
        avatarUrl: avatarResult.avatarUrl,
        citizenId,
        issueDate: new Date()
      };

      await this.passportGeneratorService.validatePassportData(passportData);
      const passportAsset = await this.passportGeneratorService.generatePassport(passportData);

      // Stage 6: Complete user profile
      await this.authService.completeUserProfile(
        userId,
        avatarResult.avatarUrl,
        finalNickname
      );

      // Final stage: Complete
      progressCallback({
        stage: 'complete',
        percent: 100,
        message: 'Welcome to Antropos City!'
      });

      return {
        success: true,
        userId,
        passportUrl: passportAsset.passportUrl
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      progressCallback({
        stage: 'error',
        percent: 0,
        message: 'Registration failed',
        error: errorMessage
      });

      // Cleanup logic could go here (rollback user, refund payment, etc.)
      await this.handleRegistrationFailure(userId, errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private async handleRegistrationFailure(userId: string | null, error: string): Promise<void> {
    // TODO: Implement compensation logic
    // - If payment succeeded but avatar generation failed, refund payment
    // - If user was created but face indexing failed, cleanup user
    // - Log errors for investigation
    console.error(`Registration failed for user ${userId}: ${error}`);
    
    // For now, just log. In production, implement proper saga-style compensation
  }
} 