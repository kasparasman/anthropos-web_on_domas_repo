import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken, createUser, signInWithEmailPassword } from '../../lib/firebase-admin';
import { RegistrationOrchestrator, RegistrationData, RegistrationProgress } from '../../lib/services/registration/RegistrationOrchestrator';
import { createServiceContainer } from '../../lib/services/ServiceContainer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

interface RegisterRequest {
  // Firebase authentication (either token or email/password)
  idToken?: string;
  email?: string;
  password?: string;

  // Profile data
  faceImageUrl: string;
  plan: {
    type: 'monthly' | 'yearly';
    amount: number;
  };
  paymentMethodId: string;
  selectedStyleId: string;
  gender: 'male' | 'female';
  nickname?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no', // disable nginx/Cloudflare buffering
  });

  // Send initial connection event
  res.write('data: {"type":"connected"}\n\n');

  try {
    const {
      idToken,
      email,
      password,
      faceImageUrl,
      plan,
      paymentMethodId,
      selectedStyleId,
      gender,
      nickname
    }: RegisterRequest = req.body;

    // Validate required fields
    if (!faceImageUrl || !plan || !paymentMethodId || !selectedStyleId || !gender) {
      res.write('event: error\ndata: {"error":"Missing required fields"}\n\n');
      return res.end();
    }

    // Either idToken OR (email AND password) must be provided
    if (!idToken && (!email || !password)) {
      res.write('event: error\ndata: {"error":"Either idToken or email/password combination is required"}\n\n');
      return res.end();
    }

    console.log('[API Register] Starting registration process...');

    // Get Firebase user info either from token or by creating/signing in
    let firebaseUid: string;
    let userEmail: string;

    if (idToken) {
      // Use existing Firebase token
      const decodedToken = await verifyIdToken(idToken);
      firebaseUid = decodedToken.uid;
      userEmail = decodedToken.email || '';

      if (!userEmail) {
        res.write('event: error\ndata: {"error":"Email not found in Firebase token"}\n\n');
        return res.end();
      }
    } else {
      // Create or sign in Firebase user with email/password
      try {
        // First try to sign in (for returning users)
        const signInResult = await signInWithEmailPassword(email!, password!);
        firebaseUid = signInResult.uid;
        userEmail = signInResult.email || email!;
      } catch (authError) {
        // If sign-in fails, create a new user
        try {
          const createUserResult = await createUser(email!, password!);
          firebaseUid = createUserResult.uid;
          userEmail = createUserResult.email || email!;
        } catch (createError) {
          console.error('[API Register] Failed to create/sign-in Firebase user:', createError);
          res.write('event: error\ndata: {"error":"Failed to authenticate: ' + 
            (createError instanceof Error ? createError.message : 'Unknown error') + '"}\n\n');
          return res.end();
        }
      }
    }

    console.log(`[API Register] Processing registration for user: ${firebaseUid}, email: ${userEmail}`);

    // Create service container with all dependencies
    const serviceContainer = createServiceContainer();

    // Create orchestrator with injected dependencies
    const orchestrator = new RegistrationOrchestrator(
      serviceContainer.authService,
      serviceContainer.faceVerificationService,
      serviceContainer.paymentService,
      serviceContainer.avatarGenerationService,
      serviceContainer.passportGeneratorService
    );

    // Prepare registration data
    const registrationData: RegistrationData = {
      firebaseUid,
      email: userEmail,
      faceImageUrl,
      plan,
      paymentMethodId,
      selectedStyleId,
      gender,
      nickname
    };

    // Progress callback to send SSE updates
    const progressCallback = (progress: RegistrationProgress) => {
      console.log(`[API Register] Progress: ${progress.stage} - ${progress.percent}% - ${progress.message}`);
      
      const eventData = {
        stage: progress.stage,
        percent: progress.percent,
        message: progress.message,
        error: progress.error
      };

      res.write(`event: progress\n`);
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    // Execute registration
    const result = await orchestrator.execute(registrationData, progressCallback);

    // Send final result
    if (result.success) {
      console.log(`[API Register] Registration completed successfully for user: ${firebaseUid}`);
      res.write('event: complete\n');
      res.write(`data: ${JSON.stringify({ 
        success: true, 
        userId: result.userId,
        passportUrl: result.passportUrl 
      })}\n\n`);
    } else {
      console.error(`[API Register] Registration failed for user: ${firebaseUid}, error: ${result.error}`);
      res.write('event: error\n');
      res.write(`data: ${JSON.stringify({ 
        success: false, 
        error: result.error 
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[API Register] Unexpected error:', errorMessage);
    
    res.write('event: error\n');
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
} 