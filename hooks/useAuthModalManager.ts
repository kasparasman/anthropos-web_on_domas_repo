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
  const openAuthModal = useCallback(() => {
    setState(s => ({ ...s, isModalOpen: true }));
  }, []);

  const closeAuthModal = useCallback(() => {
    // Potentially add logic here: if profile is incomplete, prevent closing or reset further?
    // For now, just closes.
    setState(s => ({ ...s, isModalOpen: false }));
    // Reset to initial login mode when modal is explicitly closed by user, 
    // unless we are in a state where closing should not reset (e.g. mid-flow forced by system)
    // This needs careful consideration based on desired UX.
    // For now, let's assume closing via this function means user wants to exit the flow.
    // If checkAndResumeIncompleteRegistration reopens it, it will set the correct state.
    // setState(initialState); // Or a more nuanced reset
  }, []);
  
  const setMode = useCallback((mode: 'login' | 'register') => {
    setState(s => ({
      ...initialState, // Resets steps, errors, etc.
      email: s.email, // Keep current email if any
      mode,
      currentStep: mode === 'login' ? AuthStep.Login : AuthStep.InitialRegistration,
      isModalOpen: true, // Always open modal when mode is set explicitly
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
        // isModalOpen should already be true if this is called via setMode('register')
      }));
      let firebaseUserUid: string | null = null;
      let idToken: string | null = null;
      let uploadedFaceUrl: string | null = null;

      try {
        console.log('[useAuthModalManager] Uploading face image...');
        uploadedFaceUrl = await uploadFileToStorage(faceFile);
        console.log('[useAuthModalManager] Face image uploaded:', uploadedFaceUrl);

        console.log('[useAuthModalManager] Checking face duplicate (client-side pre-check)...');
        await authApiService.checkFaceDuplicate({ imageUrl: uploadedFaceUrl, email: email_val });
        console.log('[useAuthModalManager] Client-side face check passed.');

        console.log('[useAuthModalManager] Creating Firebase user...');
        const cred = await registerClient(email_val, password_in);
        firebaseUserUid = cred.user.uid;
        idToken = await cred.user.getIdToken();
        console.log('[useAuthModalManager] Firebase user created:', firebaseUserUid);

        console.log('[useAuthModalManager] Calling backend /api/auth/provisional-register...');
        const provisionalResponse = await fetch('/api/auth/provisional-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, tmpFaceUrl: uploadedFaceUrl }),
        });

        const provisionalData = await provisionalResponse.json();
        console.log('[useAuthModalManager] Provisional registration API response:', provisionalData);

        if (!provisionalResponse.ok || !provisionalData.success) {
          // Cleanup Firebase user if provisional reg fails
          if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid === firebaseUserUid) {
            console.warn(`[useAuthModalManager] Provisional registration failed (${provisionalData.message || 'Unknown API error'}). Attempting to delete Firebase user: ${firebaseUserUid}`);
            try { await firebaseAuth.currentUser.delete(); console.log('[useAuthModalManager] Successfully deleted Firebase user after provisional reg failure.'); }
            catch (deleteError: any) { console.error('[useAuthModalManager] Failed to delete Firebase user after provisional reg failure:', deleteError.message); }
          }
          throw new Error(provisionalData.message || 'Provisional registration failed after Firebase user creation.');
        }
        
        // Provisional registration successful, now proceed to payment step in UI.
        // PaymentModal will handle fetching the client secret based on price selection.
        console.log('[useAuthModalManager] Provisional registration successful. Proceeding to payment step for price selection.');
        setState(s => ({
          ...s,
          isLoading: false,
          currentStep: AuthStep.Payment, // Proceed to payment step UI
          tmpFaceUrl: uploadedFaceUrl,
          provisionalUserId: provisionalData.userId,
          provisionalNickname: provisionalData.tempNickname,
          email: provisionalData.email || email_val,
          // paymentClientSecret will be set by PaymentModal via setPaymentClientSecret callback
        }));

        // Ensure localStorage flags are cleared at the start of a new registration attempt for this user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('paymentCompletedForUser');
          localStorage.removeItem('paymentIntentId');
          localStorage.removeItem('paymentFailedForUser');
        }

      } catch (err: any) {
        console.error('[useAuthModalManager] Initial registration failed catch block:', err.message);
        // General cleanup for Firebase user if created before any error
        if (firebaseUserUid && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === firebaseUserUid && 
            (!(err.message?.includes('Provisional registration failed')) && !(err.message?.includes('Failed to set up payment'))) ) {
          console.warn(`[useAuthModalManager] Error occurred after Firebase user creation (${firebaseUserUid}). Attempting cleanup.`);
          try { await firebaseAuth.currentUser.delete(); console.log('[useAuthModalManager] Successfully deleted Firebase user during general error catch.'); }
          catch (deleteError: any) { console.error('[useAuthModalManager] Failed to delete Firebase user during general error catch:', deleteError.message); }
        }
        setState(s => ({ ...s, isLoading: false, error: err.message || 'Initial registration failed.', tmpFaceUrl: null, provisionalUserId: null, provisionalNickname: null, paymentClientSecret: null }));
      }
    },
    [] 
  );

  const handlePaymentSuccess = useCallback(async (userIdToProcess?: string | null) => {
    const currentProvisionalUserId = userIdToProcess || state.provisionalUserId;

    if (!currentProvisionalUserId) {
      console.error("[useAuthModalManager] handlePaymentSuccess: provisionalUserId is missing. Aborting.");
      setState(s => ({ ...s, isLoading: false, error: "User context lost. Cannot complete session.", isModalOpen: true, pendingPaymentConfirmationUserId: null }));
      setRegistrationInProgress(false);
      return;
    }

    // Ensure Firebase user is ready and matches the ID we are processing
    if (!firebaseUser || firebaseUser.uid !== currentProvisionalUserId) {
      console.error(`[useAuthModalManager] handlePaymentSuccess: Firebase user not ready or mismatch. Firebase UID: ${firebaseUser?.uid}, Expected: ${currentProvisionalUserId}. Aborting.`);
      setState(s => ({ ...s, isLoading: false, error: "Firebase session issue. Please wait a moment and try again.", isModalOpen: true, pendingPaymentConfirmationUserId: currentProvisionalUserId /* Keep it pending */ }));
      // Do not set setRegistrationInProgress(false) here, as we want to retry if possible.
      return;
    }

    console.log(`[useAuthModalManager] handlePaymentSuccess: Proceeding for user ${currentProvisionalUserId}`);
    // If userIdToProcess was provided, ensure state.provisionalUserId is aligned.
    if (userIdToProcess && userIdToProcess !== state.provisionalUserId) {
        setState(s => ({ ...s, provisionalUserId: userIdToProcess, isLoading: true, error: null, isModalOpen: true }));
    } else {
        setState(s => ({ ...s, isLoading: true, error: null, isModalOpen: true }));
    }

    try {
      const idToken = await firebaseUser.getIdToken(true); // Now using firebaseUser from useAuthSync
      console.log(`[useAuthModalManager] handlePaymentSuccess: Confirming payment for user ${currentProvisionalUserId}`);
      const confirmPaymentResponse = await fetch('/api/user/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }), // idToken should implicitly be for currentProvisionalUserId if Firebase auth is synced
      });
      const confirmPaymentData = await confirmPaymentResponse.json();
      if (!confirmPaymentResponse.ok || !confirmPaymentData.success) {
        throw new Error(confirmPaymentData.message || 'Failed to confirm payment with backend.');
      }
      console.log('[useAuthModalManager] Profile status confirmed by backend:', confirmPaymentData.status);

      console.log('[useAuthModalManager] Calling NextAuth signIn to complete registration session...');
      const result = await signIn('credentials', {
        idToken, // This idToken MUST be for the user whose status was just updated
        redirect: false,
      });
      if (result?.error) {
        console.error("[useAuthModalManager] Error from NextAuth signIn during session completion:", result.error);
        // Specific handling if PAYMENT_PENDING is still returned, though it shouldn't be.
        if (result.error === 'PAYMENT_PENDING') {
            console.error("[useAuthModalManager] CRITICAL: signIn returned PAYMENT_PENDING after confirm-payment call. Status update might have failed or NextAuth is using stale data.");
            // Fallback or specific error message
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
        pendingPaymentConfirmationUserId: null, // Clear pending ID on success
      }));
      console.log('[useAuthModalManager] Payment successful & session created. Proceeding to avatar/nickname setup.');

    } catch (err: any) {
      console.error('[useAuthModalManager] Error during payment success handling:', err.message);
      setState(s => ({ ...s, provisionalUserId: currentProvisionalUserId, isLoading: false, error: err.message, isModalOpen: true, pendingPaymentConfirmationUserId: null /* Clear on error too, to prevent loops if error is persistent */ }));
      // Potentially setRegistrationInProgress(false) if error is terminal for this attempt
    }
  }, [state.provisionalUserId, state.pendingPaymentConfirmationUserId, firebaseUser, setRegistrationInProgress]);

  const handlePaymentModalClose = useCallback(() => {
    console.log('[useAuthModalManager] Payment modal closed/cancelled by user.');
    // Transition back to initial registration if payment is cancelled
    // Also clear the client secret as it might be invalid or single-use
    setState(s => ({
        ...s,
        currentStep: AuthStep.InitialRegistration,
        paymentClientSecret: null,
        error: 'Payment was cancelled.' // Optionally set an info/error message
    }));
  }, []);

  const handleFinalProfileUpdate = useCallback(async (avatarUrl: string, nickname_in: string) => {
    setState(s => ({ ...s, isLoading: true, error: null, isModalOpen: true }));
    try {
      await authApiService.updateProfile({ avatarUrl, nickname: nickname_in });
      setRegistrationInProgress(false);
      setState(s => ({ ...s, isLoading: false, error: null, isModalOpen: false })); // Close modal on final success
      console.log('[useAuthModalManager] Registration completed successfully. Modal closed.');
      return true; 
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message, isModalOpen: true }));
      return false; 
    }
  }, [setRegistrationInProgress]);

  const handleLogin = useCallback(async (email_in: string, password_in: string) => {
    setState(s => ({ ...s, isLoading: true, error: null, email: email_in, paymentClientSecret: null, isModalOpen: true }));
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
          console.warn('[useAuthModalManager] Login attempt for user with PENDING_PAYMENT status.');
          // TODO: Potentially fetch a new clientSecret here and redirect to payment?
          // For now, just showing an error.
          throw new Error('Your account is pending payment. Please complete the registration process or contact support.');
        } else if (result.error === 'PROFILE_NOT_FOUND'){
           throw new Error('Profile not found. Please register first.');
        } else if (result.error === 'INVALID_USER_STATUS_FOR_LOGIN') {
          throw new Error('Your account status is not valid for login. Please contact support.');
        } else if (result.error === 'ACCOUNT_BANNED') {
            throw new Error('This account has been banned.');
        }
        console.error("[useAuthModalManager] Login NextAuth signIn error:", result.error);
        throw new Error(result.error);
      }
      console.log('[useAuthModalManager] Login successful.');
      setState(s => ({ 
          ...initialState, 
          mode: 'login',
          currentStep: AuthStep.Login, 
          email: email_in,
          isModalOpen: false, // Close modal on successful login
      }));
      return true; 
    } catch (err: any) {
      console.error('[useAuthModalManager] Login failed catch block:', err.message);
      if (firebaseIdToken && firebaseAuth.currentUser) {
        console.log('[useAuthModalManager] Signing out Firebase user due to NextAuth login failure.');
        await firebaseAuth.signOut();
      }
      setState(s => ({ ...s, isLoading: false, error: err.message, isModalOpen: true }));
      return false;
    }
  }, []);

  const resetToInitial = useCallback(() => {
    console.log('[useAuthModalManager] resetToInitial CALLED. Stack trace:', new Error().stack);
    setState({...initialState, isModalOpen: false });
    setRegistrationInProgress(false);
  }, [setRegistrationInProgress]);

  const setCurrentStep = useCallback((step: AuthStep) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  const checkAndResumeIncompleteRegistration = useCallback(async (currentAuthUserId?: string | null) => {
    const effectiveUserId = currentAuthUserId || state.provisionalUserId;
    if (!effectiveUserId) {
      console.log('[useAuthModalManager] checkAndResume: No user ID to check.');
      return;
    }
    console.log(`[useAuthModalManager] checkAndResume: Checking profile status for ${effectiveUserId}...`);
    const profileData = await authApiService.getCurrentUserProfileStatus();

    if (profileData && profileData.id === effectiveUserId && profileData.status === 'ACTIVE_PENDING_PROFILE_SETUP') {
      console.log('[useAuthModalManager] checkAndResume: Found ACTIVE_PENDING_PROFILE_SETUP for user:', profileData.id);
      
      if (state.currentStep !== AuthStep.AvatarNicknameSetup || !state.isModalOpen || state.mode !== 'register') {
        console.log('[useAuthModalManager] checkAndResume: Modal state needs update for AvatarNicknameSetup. Current state:', 
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
        console.log('[useAuthModalManager] checkAndResume: Modal already in correct state for AvatarNicknameSetup. Ensuring registration is marked as in progress.');
        setRegistrationInProgress(true); // Ensure the flag is set if we are in this state.
      }
    } else if (profileData && profileData.id === effectiveUserId && profileData.status === 'ACTIVE_COMPLETE') {
      console.log('[useAuthModalManager] checkAndResume: User status is ACTIVE_COMPLETE.');
      if (state.isModalOpen && state.currentStep === AuthStep.AvatarNicknameSetup && state.mode === 'register') {
        console.log('[useAuthModalManager] checkAndResume: Profile is complete. Closing modal if it was for setup.');
        setState(s => ({...s, isModalOpen: false}));
        setRegistrationInProgress(false);
      } else if (state.mode === 'register') {
        console.log('[useAuthModalManager] checkAndResume: Profile complete but modal in register mode. Resetting/closing.');
        resetToInitial();
      }
    } else if (profileData) {
      console.log(`[useAuthModalManager] checkAndResume: User status is ${profileData.status}. Current modal state: step=${state.currentStep}, mode=${state.mode}, open=${state.isModalOpen}. No specific action taken.`);
      if (state.mode === 'register' && state.isModalOpen && 
          (profileData.status !== 'ACTIVE_PENDING_PROFILE_SETUP' && profileData.status !== 'PENDING_PAYMENT') ) {
        console.log(`[useAuthModalManager] checkAndResume: Modal in register mode but user status (${profileData.status}) is unexpected for continuation. Resetting.`);
        resetToInitial(); 
      }
    } else if (!profileData && effectiveUserId) {
      console.warn(`[useAuthModalManager] checkAndResume: Could not fetch profile data for ${effectiveUserId}.`);
    }
  }, [state.provisionalUserId, state.currentStep, state.isModalOpen, state.mode, state.email, state.tmpFaceUrl, setRegistrationInProgress, resetToInitial]);

  // useEffect for localStorage check (sets pending ID)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paymentCompletedForUserId = localStorage.getItem('paymentCompletedForUser');
      if (paymentCompletedForUserId && paymentCompletedForUserId !== 'unknown') {
        localStorage.removeItem('paymentCompletedForUser');
        localStorage.removeItem('paymentIntentId');
        
        console.log(`[useAuthModalManager] localStorage: Detected payment completed for ${paymentCompletedForUserId}. Setting as pending.`);
        setRegistrationInProgress(true);
        setState(s => ({ ...s, pendingPaymentConfirmationUserId: paymentCompletedForUserId, provisionalUserId: s.provisionalUserId || paymentCompletedForUserId }));
        // DO NOT call handlePaymentSuccess directly here anymore.
      }

      const paymentFailedForUserId = localStorage.getItem('paymentFailedForUser');
      if (paymentFailedForUserId && paymentFailedForUserId !== 'unknown') {
        localStorage.removeItem('paymentFailedForUser');
        console.log(`[useAuthModalManager] localStorage: Detected payment failed for user ${paymentFailedForUserId}.`);
        setRegistrationInProgress(false);
        setState(s => ({
            ...s,
            provisionalUserId: paymentFailedForUserId,
            email: s.email || '',
            error: 'Payment failed or was cancelled. Please try again.',
            currentStep: AuthStep.InitialRegistration, 
            isModalOpen: true,
            isLoading: false,
            paymentClientSecret: null,
        }));
      }
    }
  }, [setRegistrationInProgress]); // Removed handlePaymentSuccess from here

  // New useEffect to process pending payment confirmation when Firebase user is ready
  useEffect(() => {
    if (state.pendingPaymentConfirmationUserId && firebaseReady && firebaseUser) {
      if (firebaseUser.uid === state.pendingPaymentConfirmationUserId) {
        console.log(`[useAuthModalManager] Firebase user ${firebaseUser.uid} is ready and matches pending payment ID. Calling handlePaymentSuccess.`);
        handlePaymentSuccess(state.pendingPaymentConfirmationUserId);
        // handlePaymentSuccess will clear pendingPaymentConfirmationUserId from state on success/final error.
      } else {
        // This case should be rare if provisional_user_id in URL was correct Firebase UID
        console.warn(`[useAuthModalManager] Firebase user ${firebaseUser.uid} is ready but DOES NOT match pending payment ID ${state.pendingPaymentConfirmationUserId}. This might indicate an issue or old pending ID.`);
        // setState(s => ({ ...s, pendingPaymentConfirmationUserId: null, error: "User session mismatch during payment confirmation."})); // Optionally clear or error out
      }
    } else if (state.pendingPaymentConfirmationUserId && firebaseReady && !firebaseUser) {
        console.log(`[useAuthModalManager] Payment confirmation for ${state.pendingPaymentConfirmationUserId} is pending, Firebase SDK ready, but Firebase user not yet available. Waiting...`);
    }
  }, [state.pendingPaymentConfirmationUserId, firebaseUser, firebaseReady, handlePaymentSuccess]);

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