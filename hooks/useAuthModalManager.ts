import { useState, useCallback, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import {
  registerClient,
  signInClient,
  firebaseAuth
} from '../lib/firebase-client';
import * as authApiService from '../lib/services/authApiService';
import { uploadFileToStorage } from '../lib/services/fileUploadService';
import { useRegistrationStatus } from './useRegistrationStatus';
import { useAuthSync } from './useFirebaseNextAuth';

// Define the possible steps in the authentication/registration flow
// Changed to an object to allow usage as values
export const AuthStep = {
  InitialRegistration: 'initialRegistration',
  Payment: 'payment',
  AvatarNicknameSetup: 'avatarNicknameSetup',
  Login: 'login',
} as const;
export type AuthStep = typeof AuthStep[keyof typeof AuthStep]; // Keep the type definition

interface AuthModalManagerState {
  mode: 'login' | 'register';
  currentStep: AuthStep;
  email: string; 
  provisionalUserId: string | null; 
  provisionalNickname: string | null; 
  tmpFaceUrl: string | null;
  isPaymentComplete: boolean;
  paymentClientSecret: string | null; // Added for Stripe client secret
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean; // Added to control modal visibility from the hook
  pendingPaymentConfirmationUserId: string | null; // New state
}

const initialState: AuthModalManagerState = {
  mode: 'login',
  currentStep: AuthStep.Login,
  email: '',
  provisionalUserId: null,
  provisionalNickname: null,
  tmpFaceUrl: null,
  isPaymentComplete: false,
  paymentClientSecret: null,
  isLoading: false,
  error: null,
  isModalOpen: false, // Default to false
  pendingPaymentConfirmationUserId: null, // New state initial value
};

export function useAuthModalManager() {
  const [state, setState] = useState<AuthModalManagerState>(initialState);
  const { setRegistrationInProgress } = useRegistrationStatus();
  const { user: firebaseUser, ready: firebaseReady } = useAuthSync();

  // Define all useCallback hooks first
  const openAuthModal = useCallback((targetMode?: 'login' | 'register', targetStep?: AuthStep) => {
    console.log('[AuthModalManager] openAuthModal called with mode:', targetMode, 'step:', targetStep);
    setState(s => ({
       ...s, 
       mode: targetMode || s.mode, // Fallback to current mode or login if nothing specific
       currentStep: targetStep || (targetMode === 'register' ? AuthStep.InitialRegistration : AuthStep.Login),
       isModalOpen: true 
      }));
  }, []);

  const closeAuthModal = useCallback(() => {
    console.log('[AuthModalManager] closeAuthModal called.');
    // If a registration was in progress but not fully complete (e.g., payment done, but avatar not set)
    // keep registrationInProgress true, so checkAndResume can pick it up later.
    // Only set to false if registration is truly abandoned or fully completed.
    if (state.currentStep === AuthStep.InitialRegistration || state.currentStep === AuthStep.Payment) {
      setRegistrationInProgress(false); // User explicitly closed before completion
      console.log('[AuthModalManager] Registration explicitly abandoned by user closing modal.');
    }
    // For AvatarNicknameSetup, if closed, it might mean they want to do it later.
    // setRegistrationInProgress is handled by handleFinalProfileUpdate for completion.

    setState(s => ({ ...s, isModalOpen: false, error: null })); // Clear error on explicit close
  }, [state.currentStep, setRegistrationInProgress]);
  
  const setMode = useCallback((mode: 'login' | 'register') => {
    console.log('[AuthModalManager] setMode called:', mode);
    setState(s => ({
      ...initialState, 
      email: s.email, 
      mode,
      currentStep: mode === 'login' ? AuthStep.Login : AuthStep.InitialRegistration,
      isModalOpen: true, 
    }));
    if (mode === 'register') setRegistrationInProgress(true);
    else setRegistrationInProgress(false);
  }, [setRegistrationInProgress]);

  const setEmail = useCallback((newEmail: string) => {
    setState(s => ({ ...s, email: newEmail }));
  }, []);

  const setPaymentClientSecret = useCallback((secret: string | null) => {
    setState(s => ({ ...s, paymentClientSecret: secret }));
  }, []);

  const handleInitialRegistration = useCallback(
    async (email_val: string, password_in: string, faceFile: File) => {
      console.log('[AuthModalManager] handleInitialRegistration started for email:', email_val);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('paymentCompletedForUser');
        localStorage.removeItem('paymentIntentId');
        localStorage.removeItem('paymentFailedForUser');
      }
      setState(s => ({ 
        ...s, 
        isLoading: true, 
        error: null, 
        email: email_val, 
        provisionalUserId: null, 
        provisionalNickname: null, 
        tmpFaceUrl: null, 
        paymentClientSecret: null,
        isModalOpen: true, // Ensure modal is open for this step
        currentStep: AuthStep.InitialRegistration, // Explicitly set step
        mode: 'register', // Explicitly set mode
      }));
      let firebaseUserUid: string | null = null;
      let idToken: string | null = null;
      let uploadedFaceUrl: string | null = null;

      try {
        console.log('[AuthModalManager] Uploading face image...');
        uploadedFaceUrl = await uploadFileToStorage(faceFile);
        console.log('[AuthModalManager] Face image uploaded:', uploadedFaceUrl);

        console.log('[AuthModalManager] Checking face duplicate (client-side pre-check)...');
        await authApiService.checkFaceDuplicate({ imageUrl: uploadedFaceUrl, email: email_val });
        console.log('[AuthModalManager] Client-side face check passed.');

        console.log('[AuthModalManager] Creating Firebase user...');
        const cred = await registerClient(email_val, password_in);
        firebaseUserUid = cred.user.uid;
        idToken = await cred.user.getIdToken();
        console.log('[AuthModalManager] Firebase user created:', firebaseUserUid);

        console.log('[AuthModalManager] Calling backend /api/auth/provisional-register...');
        const provisionalResponse = await fetch('/api/auth/provisional-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, tmpFaceUrl: uploadedFaceUrl }),
        });

        const provisionalData = await provisionalResponse.json();
        console.log('[AuthModalManager] Provisional registration API response:', provisionalData);

        if (!provisionalResponse.ok || !provisionalData.success) {
          // Cleanup Firebase user if provisional reg fails
          if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid === firebaseUserUid) {
            console.warn(`[AuthModalManager] Provisional registration failed (${provisionalData.message || 'Unknown API error'}). Attempting to delete Firebase user: ${firebaseUserUid}`);
            try { await firebaseAuth.currentUser.delete(); console.log('[AuthModalManager] Successfully deleted Firebase user after provisional reg failure.'); }
            catch (deleteErr) {
              const delErrMsg = deleteErr instanceof Error ? deleteErr.message : 'Unknown error during Firebase user deletion';
              console.error('[AuthModalManager] Failed to delete Firebase user after provisional reg failure:', delErrMsg); 
            }
          }
          throw new Error(provisionalData.message || 'Provisional registration failed after Firebase user creation.');
        }
        
        console.log('[AuthModalManager] Provisional registration successful. Proceeding to payment step for price selection.');
        setState(s => ({
          ...s,
          isLoading: false,
          currentStep: AuthStep.Payment,
          tmpFaceUrl: uploadedFaceUrl,
          provisionalUserId: provisionalData.userId,
          provisionalNickname: provisionalData.tempNickname,
          email: provisionalData.email || email_val,
        }));

        if (typeof window !== 'undefined') {
          localStorage.removeItem('paymentCompletedForUser');
          localStorage.removeItem('paymentIntentId');
          localStorage.removeItem('paymentFailedForUser');
        }

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Initial registration failed.';
        console.error('[AuthModalManager] Initial registration failed catch block:', errMsg);
        if (firebaseUserUid && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === firebaseUserUid && 
            (!(errMsg?.includes('Provisional registration failed')) && !(errMsg?.includes('Failed to set up payment'))) ) {
          console.warn(`[AuthModalManager] Error occurred after Firebase user creation (${firebaseUserUid}). Attempting cleanup.`);
          try { await firebaseAuth.currentUser.delete(); console.log('[AuthModalManager] Successfully deleted Firebase user during general error catch.'); }
          catch (deleteErr) {
            const delErrMsg = deleteErr instanceof Error ? deleteErr.message : 'Unknown error during Firebase user deletion in general catch';
            console.error('[AuthModalManager] Failed to delete Firebase user during general error catch:', delErrMsg); 
          }
        }
        setState(s => ({ ...s, isLoading: false, error: errMsg, tmpFaceUrl: null, provisionalUserId: null, provisionalNickname: null, paymentClientSecret: null }));
      }
    },
    [] 
  );

  const handlePaymentSuccess = useCallback(async (userIdToProcess?: string | null) => {
    const currentProvisionalUserId = userIdToProcess || state.provisionalUserId;

    if (!currentProvisionalUserId) {
      console.error("[AuthModalManager] handlePaymentSuccess: provisionalUserId is missing. Aborting.");
      setState(s => ({ ...s, isLoading: false, error: "User context lost. Cannot complete session.", isModalOpen: true, pendingPaymentConfirmationUserId: null }));
      setRegistrationInProgress(false);
      return;
    }

    if (!firebaseUser || firebaseUser.uid !== currentProvisionalUserId) {
      console.error(`[AuthModalManager] handlePaymentSuccess: Firebase user not ready or mismatch. Firebase UID: ${firebaseUser?.uid}, Expected: ${currentProvisionalUserId}. Aborting.`);
      setState(s => ({ ...s, isLoading: false, error: "Firebase session issue. Please wait a moment and try again.", isModalOpen: true, pendingPaymentConfirmationUserId: currentProvisionalUserId }));
      return;
    }

    console.log(`[AuthModalManager] handlePaymentSuccess: Proceeding for user ${currentProvisionalUserId}`);
    if (userIdToProcess && userIdToProcess !== state.provisionalUserId) {
        setState(s => ({ ...s, provisionalUserId: userIdToProcess, isLoading: true, error: null, isModalOpen: false }));
    } else {
        setState(s => ({ ...s, isLoading: true, error: null, isModalOpen: false }));
    }

    try {
      const idToken = await firebaseUser.getIdToken(true);
      console.log(`[AuthModalManager] handlePaymentSuccess: Confirming payment for user ${currentProvisionalUserId}`);
      const confirmPaymentResponse = await fetch('/api/user/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const confirmPaymentData = await confirmPaymentResponse.json();
      if (!confirmPaymentResponse.ok || !confirmPaymentData.success) {
        throw new Error(confirmPaymentData.message || 'Failed to confirm payment with backend.');
      }
      console.log('[AuthModalManager] Profile status confirmed by backend:', confirmPaymentData.status);

      console.log('[AuthModalManager] Calling NextAuth signIn to complete registration session...');
      const result = await signIn('credentials', {
        idToken,
        redirect: false,
      });
      if (result?.error) {
        console.error("[AuthModalManager] Error from NextAuth signIn during session completion:", result.error);
        if (result.error === 'PAYMENT_PENDING') {
            console.error("[AuthModalManager] CRITICAL: signIn returned PAYMENT_PENDING after confirm-payment call. Status update might have failed or NextAuth is using stale data.");
        }
        throw new Error(result.error); 
      }
      
      setState(s => ({
        ...s,
        mode: 'register',
        provisionalUserId: currentProvisionalUserId,
        isPaymentComplete: true,
        currentStep: AuthStep.AvatarNicknameSetup,
        isLoading: false,
        error: null,
        paymentClientSecret: null,
        isModalOpen: true,
        pendingPaymentConfirmationUserId: null,
      }));
      console.log('[AuthModalManager] Payment successful & session created. Proceeding to avatar/nickname setup.');

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Payment success handling failed.';
      console.error('[AuthModalManager] Error during payment success handling for user:', state.provisionalUserId, 'Error:', errMsg);
      setState(s => ({ 
        ...s, 
        isLoading: false, 
        error: errMsg, 
        isModalOpen: true,
        currentStep: AuthStep.Payment,
        pendingPaymentConfirmationUserId: null 
      }));
    }
  }, [state.provisionalUserId, firebaseUser, firebaseReady, setRegistrationInProgress]);

  const handlePaymentModalClose = useCallback(() => {
    console.log('[AuthModalManager] Payment modal closed/cancelled by user.');
    setState(s => ({
        ...s,
        currentStep: AuthStep.InitialRegistration, // Revert to initial registration
        paymentClientSecret: null,
        error: 'Payment was cancelled.',
        isLoading: false,
        isModalOpen: true, // Keep modal open at initial registration step
    }));
  }, []);

  const handleFinalProfileUpdate = useCallback(async (avatarUrl: string, nickname_in: string) => {
    console.log('[AuthModalManager] handleFinalProfileUpdate started.');
    setState(s => ({ ...s, isLoading: true, error: null, isModalOpen: true }));
    try {
      await authApiService.updateProfile({ avatarUrl, nickname: nickname_in });
      setRegistrationInProgress(false);
      setState(s => ({ ...initialState, isModalOpen: false }));
      console.log('[AuthModalManager] Registration completed successfully. Modal closed & state reset.');
      return true; 
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Final profile update failed.';
      console.error('[AuthModalManager] Error during final profile update:', errMsg);
      setState(s => ({ ...s, isLoading: false, error: errMsg, isModalOpen: true }));
      return false; 
    }
  }, [setRegistrationInProgress]);

  const handleLogin = useCallback(async (email_in: string, password_in: string) => {
    console.log('[AuthModalManager] handleLogin started for email:', email_in);
    setState(s => ({ 
      ...s, 
      isLoading: true, 
      error: null, 
      email: email_in, 
      paymentClientSecret: null, 
      isModalOpen: true, // Ensure modal is open
      currentStep: AuthStep.Login, // Explicitly set step
      mode: 'login', // Explicitly set mode
    }));
    let firebaseIdToken: string | null = null;
    try {
      const cred = await signInClient(email_in, password_in);
      firebaseIdToken = await cred.user.getIdToken();
      const result = await signIn('credentials', {
        idToken: firebaseIdToken,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'PAYMENT_PENDING') {
          console.warn('[AuthModalManager] Login attempt for user with PENDING_PAYMENT status.');
          throw new Error('Your account is pending payment. Please complete the registration process or contact support.');
        } else if (result.error === 'PROFILE_NOT_FOUND'){
           throw new Error('Profile not found. Please register first.');
        } else if (result.error === 'INVALID_USER_STATUS_FOR_LOGIN') {
          throw new Error('Your account status is not valid for login. Please contact support.');
        } else if (result.error === 'ACCOUNT_BANNED') {
            throw new Error('This account has been banned.');
        }
        console.error("[AuthModalManager] Login NextAuth signIn error:", result.error);
        throw new Error(result.error);
      }
      console.log('[AuthModalManager] Login successful.');
      setState(s => ({ 
          ...initialState, 
          mode: 'login',
          currentStep: AuthStep.Login, 
          email: email_in,
          isModalOpen: false, // Close modal on successful login
      }));
      return true; 
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Login failed.';
      console.error('[AuthModalManager] Login failed catch block:', errMsg);
      if (firebaseIdToken && firebaseAuth.currentUser) {
        console.log('[AuthModalManager] Signing out Firebase user due to NextAuth login failure.');
        await firebaseAuth.signOut();
      }
      setState(s => ({ ...s, isLoading: false, error: errMsg, isModalOpen: true }));
      return false;
    }
  }, []);

  const resetToInitial = useCallback(() => {
    console.log('[AuthModalManager] resetToInitial CALLED. Stack trace:', new Error().stack);
    setState({...initialState, isModalOpen: false });
    setRegistrationInProgress(false);
  }, [setRegistrationInProgress]);

  const setCurrentStep = useCallback((step: AuthStep) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  const checkAndResumeIncompleteRegistration = useCallback(async (currentAuthUserId?: string | null) => {
    const effectiveUserId = currentAuthUserId || state.provisionalUserId;
    if (!effectiveUserId) {
      console.log('[AuthModalManager] checkAndResume: No user ID to check.');
      return;
    }
    console.log(`[AuthModalManager] checkAndResume: Checking profile status for ${effectiveUserId}...`);
    const profileData = await authApiService.getCurrentUserProfileStatus();

    if (profileData && profileData.id === effectiveUserId && profileData.status === 'ACTIVE_PENDING_PROFILE_SETUP') {
      console.log('[AuthModalManager] checkAndResume: Found ACTIVE_PENDING_PROFILE_SETUP for user:', profileData.id);
      
      if (state.currentStep !== AuthStep.AvatarNicknameSetup || !state.isModalOpen || state.mode !== 'register') {
        console.log('[AuthModalManager] checkAndResume: Modal state needs update for AvatarNicknameSetup. Current state:', 
          { step: state.currentStep, isOpen: state.isModalOpen, mode: state.mode });
        setState(s => ({
          ...s, 
          mode: 'register', 
          currentStep: AuthStep.AvatarNicknameSetup,
          email: profileData.email || s.email, 
          provisionalUserId: profileData.id, 
          tmpFaceUrl: profileData.tmpFaceUrl || s.tmpFaceUrl, 
          isPaymentComplete: true, 
          isModalOpen: true,
          isLoading: false,
          error: null,
        }));
        setRegistrationInProgress(true);
      } else {
        console.log('[AuthModalManager] checkAndResume: Modal already in correct state for AvatarNicknameSetup. Ensuring registration is marked as in progress.');
        setRegistrationInProgress(true); // Ensure the flag is set if we are in this state.
      }
    } else if (profileData && profileData.id === effectiveUserId && profileData.status === 'ACTIVE_COMPLETE') {
      console.log('[AuthModalManager] checkAndResume: User status is ACTIVE_COMPLETE.');
      if (state.isModalOpen && state.currentStep === AuthStep.AvatarNicknameSetup && state.mode === 'register') {
        console.log('[AuthModalManager] checkAndResume: Profile is complete. Closing modal if it was for setup.');
        setState(s => ({...s, isModalOpen: false}));
        setRegistrationInProgress(false);
      } else if (state.mode === 'register') {
        console.log('[AuthModalManager] checkAndResume: Profile complete but modal in register mode. Resetting/closing.');
        resetToInitial();
      }
    } else if (profileData) {
      console.log(`[AuthModalManager] checkAndResume: User status is ${profileData.status}. Current modal state: step=${state.currentStep}, mode=${state.mode}, open=${state.isModalOpen}. No specific action taken.`);
      if (state.mode === 'register' && state.isModalOpen && 
          (profileData.status !== 'ACTIVE_PENDING_PROFILE_SETUP' && profileData.status !== 'PENDING_PAYMENT') ) {
        console.log(`[AuthModalManager] checkAndResume: Modal in register mode but user status (${profileData.status}) is unexpected for continuation. Resetting.`);
        resetToInitial(); 
      }
    } else if (!profileData && effectiveUserId) {
      console.warn(`[AuthModalManager] checkAndResume: Could not fetch profile data for ${effectiveUserId}.`);
    }
  }, [state.provisionalUserId, state.currentStep, state.isModalOpen, state.mode, state.email, state.tmpFaceUrl, setRegistrationInProgress, resetToInitial]);

  // useEffect for localStorage check (sets pending ID)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paymentCompletedForUserId = localStorage.getItem('paymentCompletedForUser');
      if (paymentCompletedForUserId && paymentCompletedForUserId !== 'unknown') {
        localStorage.removeItem('paymentCompletedForUser');
        localStorage.removeItem('paymentIntentId');
        
        console.log(`[AuthModalManager] localStorage: Detected payment completed for ${paymentCompletedForUserId}. Setting as pending.`);
        setRegistrationInProgress(true);
        // Do not open modal here, just set pending ID. Let the next effect handle it.
        setState(s => ({ 
          ...s, 
          pendingPaymentConfirmationUserId: paymentCompletedForUserId, 
          // If provisionalUserId is null or different, update it. This helps if context was lost.
          provisionalUserId: s.provisionalUserId && s.provisionalUserId !== paymentCompletedForUserId ? s.provisionalUserId : paymentCompletedForUserId,
          // Do NOT change currentStep or isModalOpen here, wait for Firebase ready state.
        }));
      }

      const paymentFailedForUserId = localStorage.getItem('paymentFailedForUser');
      if (paymentFailedForUserId && paymentFailedForUserId !== 'unknown') {
        localStorage.removeItem('paymentFailedForUser');
        console.log(`[AuthModalManager] localStorage: Detected payment failed for user ${paymentFailedForUserId}.`);
        setRegistrationInProgress(false); // Registration failed
        setState(s => ({
            ...s,
            provisionalUserId: paymentFailedForUserId,
            email: s.email || '',
            error: 'Payment failed or was cancelled. Please try again.',
            currentStep: AuthStep.InitialRegistration, // Revert to initial step
            mode: 'register', // Ensure mode is register
            isModalOpen: true, // Open modal to show error and allow retry
            isLoading: false,
            paymentClientSecret: null,
        }));
      }
    }
  }, [setRegistrationInProgress]); // Dependencies are minimal, only runs on mount/refresh essentially for localStorage check

  // New useEffect to process pending payment confirmation when Firebase user is ready
  useEffect(() => {
    console.log(`[AuthModalManager] Effect for pending payment check. PendingID: ${state.pendingPaymentConfirmationUserId}, FirebaseReady: ${firebaseReady}, FirebaseUser: ${firebaseUser?.uid}`);
    if (state.pendingPaymentConfirmationUserId && firebaseReady && firebaseUser) {
      if (firebaseUser.uid === state.pendingPaymentConfirmationUserId) {
        console.log(`[AuthModalManager] Firebase user ${firebaseUser.uid} is ready and matches pending payment ID. Calling handlePaymentSuccess.`);
        // Don't show any modal during payment confirmation processing to avoid pricing list popup
        // The handlePaymentSuccess will set the appropriate modal state (AvatarNicknameSetup) when done
        setState(s => ({...s, mode: 'register', isLoading: true, error: null, isModalOpen: false})); // Keep modal closed during payment confirmation processing
        handlePaymentSuccess(state.pendingPaymentConfirmationUserId);
      } else {
        console.warn(`[AuthModalManager] Firebase user ${firebaseUser.uid} is ready but DOES NOT match pending payment ID ${state.pendingPaymentConfirmationUserId}. This might indicate an issue or old pending ID.`);
        setState(s => ({ ...s, pendingPaymentConfirmationUserId: null, error: "User session mismatch during payment confirmation.", isLoading: false, isModalOpen: true, currentStep: AuthStep.Login }));
      }
    } else if (state.pendingPaymentConfirmationUserId && firebaseReady && !firebaseUser) {
        console.log(`[AuthModalManager] Payment confirmation for ${state.pendingPaymentConfirmationUserId} is pending, Firebase SDK ready, but Firebase user not yet available. User might need to log in or Firebase is still syncing.`);
        // If Firebase is ready but no user, it might mean they need to log in. 
        // Or, if we *expect* them to be logged in (e.g. after Firebase user creation in step 1),
        // this indicates a problem. For now, let user manually log in if this state is reached without auto-login.
        setState(s => ({...s, error: "Please log in to complete your registration.", isLoading: false, isModalOpen: true, mode: 'login', currentStep: AuthStep.Login, pendingPaymentConfirmationUserId: null})); 
    }
  }, [state.pendingPaymentConfirmationUserId, firebaseUser, firebaseReady, handlePaymentSuccess]); // handlePaymentSuccess is stable due to useCallback

  return {
    state, // Includes paymentClientSecret now
    openAuthModal,
    closeAuthModal,
    setMode,
    setEmail,
    setPaymentClientSecret, // Expose the new setter
    handleInitialRegistration,
    handlePaymentSuccess,
    handlePaymentModalClose,
    handleFinalProfileUpdate,
    handleLogin,
    resetToInitial,
    setCurrentStep,
    checkAndResumeIncompleteRegistration,
  };
} 