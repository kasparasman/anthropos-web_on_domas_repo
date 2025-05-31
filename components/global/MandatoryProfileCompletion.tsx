'use client'

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthModalManager } from '../../contexts/AuthModalManagerContext';
import { firebaseAuth } from '../../lib/firebase-client'; // Import firebaseAuth to check currentUser
import { useAuthSync } from '../../hooks/useFirebaseNextAuth'; // To use the ready state

export default function MandatoryProfileCompletion() {
  const { data: session, status: nextAuthStatus } = useSession();
  const { checkAndResumeIncompleteRegistration, state: authModalState } = useAuthModalManager();
  const { ready: firebaseReady } = useAuthSync(); // Get Firebase SDK ready status

  useEffect(() => {
    if (
      nextAuthStatus === 'authenticated' && 
      session?.user?.id &&
      firebaseReady && // Ensure Firebase SDK is loaded
      firebaseAuth.currentUser && // Crucially, ensure Firebase user object is available
      firebaseAuth.currentUser.uid === session.user.id // Double check IDs match if desired
    ) {
      if (!authModalState.isModalOpen || authModalState.mode !== 'register') {
        console.log('[MandatoryProfileCompletion] NextAuth & Firebase ready, user authenticated. Checking profile status for:', session.user.id);
        checkAndResumeIncompleteRegistration(session.user.id);
      }
    } else if (nextAuthStatus === 'authenticated' && firebaseReady && !firebaseAuth.currentUser) {
        console.log('[MandatoryProfileCompletion] NextAuth authenticated, Firebase SDK ready, but Firebase user not yet available. Waiting...');
    }
  }, [
    nextAuthStatus, 
    session, 
    firebaseReady, 
    firebaseAuth.currentUser, // Re-run if firebaseAuth.currentUser changes
    checkAndResumeIncompleteRegistration, 
    authModalState.isModalOpen, 
    authModalState.mode
  ]);

  // This component does not render anything itself, it's for side effects.
  return null;
} 