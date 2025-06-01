'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog } from '@headlessui/react'
// import Image from 'next/image' // Not used, can be removed if not needed elsewhere
import PaymentModal from '../PaymentModal'
// import { StripeProvider } from '../StripeProvider'; // Assuming StripeProvider is <Elements> or similar. If it's just context, it's fine. If it's another Elements wrapper, it's redundant here. For now, I'll assume it's not an <Elements> wrapper.
import { useAuthModalManager, AuthStep } from '../../contexts/AuthModalManagerContext'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'

// Import Step Components
import LoginStep from './steps/LoginStep'
import InitialRegistrationStep from './steps/InitialRegistrationStep'
import AvatarNicknameStep from './steps/AvatarNicknameStep'
import { StripeProvider } from '../StripeProvider'

interface AuthModalProps { open: boolean; onClose: () => void }

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const {
    state: authState,
    setMode,
    setEmail: setAuthEmail,
    setPaymentClientSecret,
    handleInitialRegistration,
    handlePaymentSuccess,
    handlePaymentModalClose,
    handleFinalProfileUpdate,
    handleLogin,
    setCurrentStep,
  } = useAuthModalManager();

  const { paymentClientSecret } = authState;

  const [password, setPassword] = useState('')
  const [fileForUpload, setFileForUpload] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male')

  const cancelRef = useRef<HTMLButtonElement>(null)

  const maleStyles = [
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/e1ffaf29-cde4-4500-a451-009e29c23e24.jpg", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/ChatGPT%20Image%20May%2024%2C%202025%2C%2010_39_50%20AM.png", label: "Classic" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2026%2C%202025%2C%2009_13_57%20PM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2026%2C%202025%2C%2009_13_57%20PM.png", label: "Creative" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_21_29%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_21_29%20AM.png", label: "Reader" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_02%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_02%20AM.png", label: "Sportsman" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_14%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_14%20AM.png", label: "CyberMan" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_31%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_31%20AM.png", label: "The Lead" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_27_58%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_27_58%20AM.png", label: "Socialist" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/e1ffaf29-cde4-4500-a451-009e29c23e24.jpg", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/ChatGPT%20Image%20May%2024%2C%202025%2C%2010_39_50%20AM.png", label: "Techie" }
  ];

  const femaleStyles = [
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_30%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_30%20AM.png", label: "Classic" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_36%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_36%20AM.png", label: "Sporty" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2012_37_15%20PM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2012_37_15%20PM.png", label: "Casual" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_44%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_44%20AM.png", label: "Hipster" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_48%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_48%20AM.png", label: "Elegant" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_51%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_51%20AM.png", label: "Adventurer" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_54%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_54%20AM.png", label: "Artist" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2012_36_58%20PM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2012_36_58%20PM.png", label: "Techie" }
  ];

  /* body scroll lock */
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  /* cleanup preview URL on unmount */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (!open) return null

  /* ------- file selection handler ------- */
  const handleFileSelectForInitialScan = (selectedFile: File) => {
    setFileForUpload(selectedFile)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  /* ------- submit action (delegated to hook) ---------------- */
  const handleSubmitLogin = async () => {
    const success = await handleLogin(authState.email, password)
    if (success) onClose()
  }

  const handleSubmitInitialRegistration = async () => {
    if (!fileForUpload) {
      alert('Please upload a profile picture for face verification.')
      return
    }
    await handleInitialRegistration(authState.email, password, fileForUpload)
  }

  const handleSubmitFinalProfile = async (avatarCdnUrl: string, nickname: string) => {
    const success = await handleFinalProfileUpdate(avatarCdnUrl, nickname)
    if (success) onClose()
  }

  let modalTitle = ''
  if (authState.mode === 'login') {
    modalTitle = 'Log in to your account'
  } else {
    if (authState.currentStep === AuthStep.InitialRegistration) {
      modalTitle = 'Step 1/3 - Account & Face Scan'
    } else if (authState.currentStep === AuthStep.Payment) {
      modalTitle = 'Step 2/3 Select a plan'
    } else if (authState.currentStep === AuthStep.AvatarNicknameSetup) {
      modalTitle = 'Step 3/3 - Avatar & Profile'
    }
  }

  const { isLoading, error: authError } = authState
  const currentStylesToDisplay = selectedGender === 'male' ? maleStyles : femaleStyles

  // Determine if modal should be closable - disabled during mandatory avatar setup
  const isAvatarSetupStep = authState.mode === 'register' && authState.currentStep === AuthStep.AvatarNicknameSetup;
  const allowModalClose = !isLoading && !isAvatarSetupStep; // No closing during avatar setup

  // Stricter: only explicit buttons should close, and only if not loading and not in avatar setup.
  const explicitClose = () => {
    if (allowModalClose) {
      onClose(); // This is the main onClose prop from parent (likely connected to useAuthModalManager.closeAuthModal)
    }
  };

  // When Payment step is active, AuthModal itself should provide minimal chrome or adapt.
  // The PaymentModal component brings its own modal-like UI (white box, its own close).
  const isPaymentStep = authState.mode === 'register' && authState.currentStep === AuthStep.Payment;

  return (
    <StripeProvider>
      <Dialog as={Fragment} open={open}
        onClose={allowModalClose ? explicitClose : () => { }} // Disable ESC key during avatar setup
        initialFocus={cancelRef}>
        <div className="fixed inset-0 z-[60] flex items-top justify-center p-4 h-auto overflow-y-scroll">
          {/* Backdrop: click disabled during avatar setup */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur h-full" onClick={() => { }} aria-hidden="true" />
          <div
            onClick={e => e.stopPropagation()} // Prevent clicks inside modal from bubbling to backdrop
            className={`flex flex-col relative z-10 rounded-xl bg-black border border-main h-full overflow-y-auto no-scrollbar
                        ${isPaymentStep ? 'p-0 w-auto bg-transparent border-none' : `py-8 px-12 ${authState.mode === 'register' ? 'w-[600px]' : 'w-[450px]'}`}`}
          >
            {/* Explicit X Close Button - Hidden during avatar setup */}
            {!isPaymentStep && !isAvatarSetupStep && (
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
            )}

            <h2 className="mb-4 text-center text-3xl font-semibold">
              {modalTitle}
            </h2>
            {authError && <p className="mb-2 text-sm text-red-500 text-center">Error: {authError}</p>}

            {/* Render steps only if not in Payment step, or specifically for that step */}
            {authState.currentStep !== AuthStep.Payment && (
              <>
                {authState.mode === 'login' && (
                  <LoginStep
                    email={authState.email}
                    onEmailChange={setAuthEmail}
                    onPasswordChange={setPassword}
                    onSubmit={handleSubmitLogin}
                    isLoading={isLoading}
                  />
                )}

                {authState.mode === 'register' && authState.currentStep === AuthStep.InitialRegistration && (
                  <InitialRegistrationStep
                    email={authState.email}
                    onEmailChange={setAuthEmail}
                    onPasswordChange={setPassword}
                    onFileSelect={handleFileSelectForInitialScan}
                    onSubmit={handleSubmitInitialRegistration}
                    isLoading={isLoading}
                    previewUrl={previewUrl}
                    selectedFile={fileForUpload}
                  />
                )}

                {authState.mode === 'register' && authState.currentStep === AuthStep.AvatarNicknameSetup && (
                  <AvatarNicknameStep
                    initialFaceUrl={authState.tmpFaceUrl}
                    currentStyles={currentStylesToDisplay}
                    onGenderChange={setSelectedGender}
                    selectedGender={selectedGender}
                    onSubmitFinalProfile={handleSubmitFinalProfile}
                    isLoadingFromParent={isLoading}
                  />
                )}
              </>
            )}

            {/* PaymentModal: Rendered when it is the current step */}
            {isPaymentStep && (
              <PaymentModal
                email={authState.email}
                open={true} // Controlled by currentStep now
                onClose={handlePaymentModalClose}
                onPaymentSuccess={handlePaymentSuccess}
                onClientSecretFetched={setPaymentClientSecret}
                clientSecret={paymentClientSecret}
                stripePromise={stripePromise}
                provisionalUserId={authState.provisionalUserId}
              />
            )}

            {/* Toggle between Login/Register, only if not in Payment or AvatarSetup step */}
            {(authState.currentStep === AuthStep.InitialRegistration || authState.currentStep === AuthStep.Login) && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setMode(authState.mode === 'login' ? 'register' : 'login')}
                className="w-full mt-2 text-sm text-main disabled:opacity-60 hover:underline">
                {authState.mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign In'}
              </button>
            )}

            {/* Cancel button - Hidden during avatar setup since it's mandatory 
            {!isAvatarSetupStep && (
              <button
                type="button"
                ref={cancelRef} 
                onClick={explicitClose}
                className="mt-3 w-full rounded-md border border-gray-600 py-2.5 text-base font-semibold text-gray-400 transition hover:border-gray-500 hover:text-gray-300 disabled:opacity-50"
                disabled={!allowModalClose}
              >
                Cancel
              </button>
            )}*/}
          </div>
        </div>
      </Dialog>
    </StripeProvider>
  )
}
