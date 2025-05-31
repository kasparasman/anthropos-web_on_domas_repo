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
};

export function useAuthModalManager() {
  const [state, setState] = useState<AuthModalManagerState>(initialState);
  const { setRegistrationInProgress } = useRegistrationStatus();

  // Define all useCallback hooks first
  const setMode = useCallback((mode: 'login' | 'register') => {
    setState(s => ({
      ...initialState,
      email: s.email, // Keep current email
      mode,
      currentStep: mode === 'login' ? AuthStep.Login : AuthStep.InitialRegistration,
      paymentClientSecret: null, // Reset payment client secret on mode change
    }));
    
    // Set registration status based on mode
    if (mode === 'register') {
      setRegistrationInProgress(true);
    } else {
      setRegistrationInProgress(false);
    }
  }, [setRegistrationInProgress]);

  const setEmail = useCallback((newEmail: string) => {
    setState(s => ({ ...s, email: newEmail }));
  }, []);

  const setPaymentClientSecret = useCallback((secret: string | null) => {
    setState(s => ({ ...s, paymentClientSecret: secret }));
  }, []);

  const handleInitialRegistration = useCallback(
    async (email_val: string, password_in: string, faceFile: File) => {
      setState(s => ({ 
        ...s, 
        isLoading: true, 
        error: null, 
        email: email_val, 
        provisionalUserId: null, 
        provisionalNickname: null, 
        tmpFaceUrl: null, 
        paymentClientSecret: null 
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

  const handlePaymentSuccess = useCallback(async () => {
    // Check if provisionalUserId exists before proceeding
    if (!state.provisionalUserId) {
      console.error("[useAuthModalManager] Payment success called, but no provisionalUserId found in state. Aborting.", state);
      setState(s => ({ ...s, isLoading: false, error: "User registration context lost. Cannot complete session."}));
      return; // Exit if no provisionalUserId
    }
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const idToken = await authApiService.getCurrentUserIdToken(); 
      if (!idToken) {
        console.error("[useAuthModalManager] Could not get Firebase ID token for payment confirmation.", firebaseAuth.currentUser);
        throw new Error("Session token missing. Please try signing in again or contact support.");
      }

      // Call the new API endpoint to confirm payment and update profile status
      console.log('[useAuthModalManager] Calling API to confirm payment and update profile status...');
      const confirmPaymentResponse = await fetch('/api/user/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const confirmPaymentData = await confirmPaymentResponse.json();
      console.log('[useAuthModalManager] Confirm payment API response:', confirmPaymentData);

      if (!confirmPaymentResponse.ok || !confirmPaymentData.success) {
        throw new Error(confirmPaymentData.message || 'Failed to confirm payment with backend.');
      }
      console.log('[useAuthModalManager] Profile status confirmed by backend:', confirmPaymentData.status);

      // Now that backend status is updated, attempt to sign into NextAuth
      console.log('[useAuthModalManager] Calling NextAuth signIn to complete registration session...');
      const result = await signIn('credentials', {
        idToken,
        redirect: false,
      });

      console.log('[useAuthModalManager] Session completion signIn result:', result);

      if (result?.error) {
        console.error("[useAuthModalManager] Error from NextAuth signIn during session completion:", result.error);
        throw new Error(result.error); 
      }
      
      setState(s => ({
        ...s,
        isPaymentComplete: true,
        currentStep: AuthStep.AvatarNicknameSetup,
        isLoading: false,
        error: null,
        paymentClientSecret: null, 
      }));
      console.log('[useAuthModalManager] Payment successful & session created. Proceeding to avatar/nickname setup.');

    } catch (err: any) {
      console.error('[useAuthModalManager] Error during payment success handling (status update or session creation):', err.message);
      setState(s => ({ ...s, isLoading: false, error: err.message || 'Failed to finalize registration after payment.'}));
    }
  }, [state.provisionalUserId]);

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
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      await authApiService.updateProfile({ avatarUrl, nickname: nickname_in });
      console.log('[useAuthModalManager] Final profile update successful.');
      setState(s => ({ ...s, isLoading: false, error: null }));
      
      // Registration is now complete, clear the registration status
      setRegistrationInProgress(false);
      console.log('[useAuthModalManager] Registration completed successfully.');
      
      return true; 
    } catch (err: any) {
      console.error('[useAuthModalManager] Final profile update failed:', err.message);
      setState(s => ({ ...s, isLoading: false, error: err.message || 'Failed to update profile.' }));
      return false; 
    }
  }, [setRegistrationInProgress]);

  const handleLogin = useCallback(async (email_in: string, password_in: string) => {
    setState(s => ({ ...s, isLoading: true, error: null, email: email_in, paymentClientSecret: null }));
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
      }));
      return true; 
    } catch (err: any) {
      console.error('[useAuthModalManager] Login failed catch block:', err.message);
      if (firebaseIdToken && firebaseAuth.currentUser) {
        console.log('[useAuthModalManager] Signing out Firebase user due to NextAuth login failure.');
        await firebaseAuth.signOut();
      }
      setState(s => ({ ...s, isLoading: false, error: err.message || 'Login failed.' }));
      return false;
    }
  }, []);

  const resetToInitial = useCallback(() => {
    setState(initialState);
    setRegistrationInProgress(false);
  }, [setRegistrationInProgress]);

  const setCurrentStep = useCallback((step: AuthStep) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  // Now define the useEffect that uses some of these callbacks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paymentCompletedForUserId = localStorage.getItem('paymentCompletedForUser');
      const paymentIntentId = localStorage.getItem('paymentIntentId'); 

      if (paymentCompletedForUserId && paymentCompletedForUserId !== 'unknown') {
        if (state.provisionalUserId && state.provisionalUserId === paymentCompletedForUserId) {
          console.log(`[useAuthModalManager] Resuming completed payment for current user ${state.provisionalUserId} (Intent: ${paymentIntentId}).`);
          localStorage.removeItem('paymentCompletedForUser');
          localStorage.removeItem('paymentIntentId');
          handlePaymentSuccess(); 
        } else if (!state.provisionalUserId) {
          console.log(`[useAuthModalManager] Restoring provisionalUserId (${paymentCompletedForUserId}) from localStorage to resume payment flow.`);
          // Set state and then call handlePaymentSuccess directly if the IDs match
          // This avoids relying on an immediate re-trigger of useEffect if state update isn't batched as expected.
          setState(s => ({ ...s, provisionalUserId: paymentCompletedForUserId, email: s.email || '' }));
          // We expect this useEffect to run again with the updated provisionalUserId, and then the first `if` block will catch it.
          // Or, to be more direct, we could call handlePaymentSuccess here too, but that might lead to double calls
          // if the useEffect re-triggers very quickly. The current approach relies on the next tick of useEffect.
        }
      }
      
      const paymentFailedForUserId = localStorage.getItem('paymentFailedForUser');
      if (paymentFailedForUserId && paymentFailedForUserId !== 'unknown') {
        if (state.provisionalUserId && state.provisionalUserId === paymentFailedForUserId) {
          console.log(`[useAuthModalManager] Processing failed payment for current user ${state.provisionalUserId}.`);
          localStorage.removeItem('paymentFailedForUser');
          setState(s => ({ 
            ...s, 
            error: 'Payment failed or was cancelled. Please try again.', 
            currentStep: AuthStep.Payment, 
            isLoading: false,
            paymentClientSecret: null 
          }));
        } else if (!state.provisionalUserId) {
          console.log(`[useAuthModalManager] Restoring provisionalUserId (${paymentFailedForUserId}) from localStorage for failed payment.`);
          setState(s => ({ ...s, provisionalUserId: paymentFailedForUserId, email: s.email || '' }));
        }
      }
    }
  }, [state.provisionalUserId, handlePaymentSuccess]);

  return {
    state, // Includes paymentClientSecret now
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
  };
} 