'use client'

import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { useAuthModalManager } from '../../contexts/AuthModalManagerContext'
import LoginStep from './steps/LoginStep'

interface AuthModalProps { open: boolean; onClose: () => void }

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const {
    state: authState,
    setEmail: setAuthEmail,
    handleLogin,
  } = useAuthModalManager();

  const [password, setPassword] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);

  /* body scroll lock */
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  /* ------- submit action (delegated to hook) ---------------- */
  const handleSubmitLogin = async () => {
    const success = await handleLogin(authState.email, password);
    if (success) onClose();
  };

  const { isLoading, error: authError } = authState;
  const allowModalClose = !isLoading;

  const explicitClose = () => {
    if (allowModalClose) onClose();
  };

  return (
    <Dialog as={Fragment} open={open} onClose={allowModalClose ? explicitClose : () => {}} initialFocus={cancelRef}>
      <div className="fixed inset-0 z-[60] flex items-top justify-center p-4 h-auto overflow-y-scroll">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur h-full" aria-hidden="true" />
        <div
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="flex flex-col relative z-10 rounded-xl my-auto bg-black border border-main h-auto overflow-y-auto no-scrollbar py-8 px-12 w-[450px]"
        >
          {/* X Close Button */}
          <button
            type="button"
            onClick={explicitClose}
            disabled={!allowModalClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 disabled:opacity-50 z-20"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="mb-4 text-center text-3xl font-semibold">Log in to your account</h2>
          {authError && <p className="mb-2 text-sm text-red-500 text-center">Error: {authError}</p>}

          <LoginStep
            email={authState.email}
            onEmailChange={setAuthEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmitLogin}
            isLoading={isLoading}
          />

          {/* Sign-up redirect */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => { window.location.href = '/register'; }}
            className="w-full mt-2 text-sm text-main disabled:opacity-60 hover:underline"
          >
            Need an account? Sign up
          </button>
        </div>
      </div>
    </Dialog>
  );
}
