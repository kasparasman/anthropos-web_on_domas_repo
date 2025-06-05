import { 
  IAuthService, 
  IFaceVerificationService, 
  IPaymentService, 
  IAvatarGenerationService, 
  IPassportGeneratorService 
} from './interfaces';

// Import concrete implementations
import { AuthService } from './implementations/AuthService';
import { FaceVerificationService } from './implementations/FaceVerificationService';
import { PaymentService } from './implementations/PaymentService';
import { MockPaymentService } from './implementations/MockPaymentService';
import { AvatarGenerationService } from './implementations/AvatarGenerationService';
import { MockAvatarGenerationService } from './implementations/MockAvatarGenerationService';
import { PassportGeneratorService } from './implementations/PassportGeneratorService';

export interface ServiceContainer {
  authService: IAuthService;
  faceVerificationService: IFaceVerificationService;
  paymentService: IPaymentService;
  avatarGenerationService: IAvatarGenerationService;
  passportGeneratorService: IPassportGeneratorService;
}

/**
 * Determines if running in development environment
 */
const isDevEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test' || 
         !process.env.NODE_ENV;
};

/**
 * Creates and configures all services with their dependencies
 * This is the composition root for dependency injection
 */
export function createServiceContainer(): ServiceContainer {
  // Create instances of all services
  const authService = new AuthService();
  const faceVerificationService = new FaceVerificationService();
  
  // Choose payment service based on environment
  // Use mock payment in development to avoid Stripe charges
  const useMockPayment = process.env.USE_MOCK_PAYMENT === 'true' || isDevEnvironment();
  
  const paymentService: IPaymentService = useMockPayment
    ? new MockPaymentService()
    : new PaymentService();
  
  if (useMockPayment) {
    console.log('[ServiceContainer] Using MockPaymentService for development');
  } else {
    console.log('[ServiceContainer] Using real PaymentService with Stripe');
  }
  
  // Choose avatar generation service based on environment
  // Set USE_MOCK_AVATAR=true in development to avoid OpenAI costs
  const useMockAvatar = process.env.USE_MOCK_AVATAR === 'true' || isDevEnvironment();
  
  const avatarGenerationService: IAvatarGenerationService = useMockAvatar 
    ? new MockAvatarGenerationService()
    : new AvatarGenerationService();

  if (useMockAvatar) {
    console.log('[ServiceContainer] Using MockAvatarGenerationService for development');
  } else {
    console.log('[ServiceContainer] Using real AvatarGenerationService with OpenAI');
  }

  const passportGeneratorService = new PassportGeneratorService();

  return {
    authService,
    faceVerificationService,
    paymentService,
    avatarGenerationService,
    passportGeneratorService
  };
}

/**
 * Factory function for testing - allows injection of mocked services
 */
export function createTestServiceContainer(overrides: Partial<ServiceContainer> = {}): ServiceContainer {
  const defaultContainer = createServiceContainer();
  
  return {
    ...defaultContainer,
    ...overrides
  };
}

/**
 * Force mock services regardless of environment
 * Useful for specific testing scenarios
 */
export function createMockServiceContainer(): ServiceContainer {
  const authService = new AuthService();
  const faceVerificationService = new FaceVerificationService();
  const paymentService = new MockPaymentService();
  const avatarGenerationService = new MockAvatarGenerationService();
  const passportGeneratorService = new PassportGeneratorService();

  console.log('[ServiceContainer] Using forced mock services for testing');

  return {
    authService,
    faceVerificationService,
    paymentService,
    avatarGenerationService,
    passportGeneratorService
  };
} 