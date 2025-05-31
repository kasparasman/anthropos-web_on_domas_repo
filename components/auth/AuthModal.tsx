'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog } from '@headlessui/react'
// import Image from 'next/image' // Not used, can be removed if not needed elsewhere
import PaymentModal from '../PaymentModal'
// import { StripeProvider } from '../StripeProvider'; // Assuming StripeProvider is <Elements> or similar. If it's just context, it's fine. If it's another Elements wrapper, it's redundant here. For now, I'll assume it's not an <Elements> wrapper.
import { useAuthModalManager, AuthStep } from '../../hooks/useAuthModalManager'
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
    { img: "https://your-r2-bucket.r2.dev/styles/female1.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female1-ref.jpg", label: "Classic" },
    { img: "https://your-r2-bucket.r2.dev/styles/female2.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female2-ref.jpg", label: "Sporty" },
    { img: "https://your-r2-bucket.r2.dev/styles/female3.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female3-ref.jpg", label: "Casual" },
    { img: "https://your-r2-bucket.r2.dev/styles/female4.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female4-ref.jpg", label: "Hipster" },
    { img: "https://your-r2-bucket.r2.dev/styles/female5.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female5-ref.jpg", label: "Elegant" },
    { img: "https://your-r2-bucket.r2.dev/styles/female6.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female6-ref.jpg", label: "Adventurer" },
    { img: "https://your-r2-bucket.r2.dev/styles/female7.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female7-ref.jpg", label: "Artist" },
    { img: "https://your-r2-bucket.r2.dev/styles/female8.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female8-ref.jpg", label: "Techie" }
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
      modalTitle = 'Register: Step 1 of 3 - Account & Face Scan'
    } else if (authState.currentStep === AuthStep.Payment) {
      modalTitle = 'Register: Step 2 of 3 - Payment'
    } else if (authState.currentStep === AuthStep.AvatarNicknameSetup) {
      modalTitle = 'Register: Step 3 of 3 - Avatar & Profile'
    }
  }
  
  const { isLoading, error: authError } = authState
  const currentStylesToDisplay = selectedGender === 'male' ? maleStyles : femaleStyles

  return (
    <StripeProvider>  
    <Dialog as={Fragment} open={open}
        onClose={isLoading && authState.currentStep !== AuthStep.Payment ? () => {} : onClose}
      initialFocus={cancelRef}>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 backdrop-blur" onClick={isLoading && authState.currentStep !== AuthStep.Payment ? () => {} : onClose} />
        <div
          onClick={e => e.stopPropagation()}
            className={`flex flex-col gap-4 relative z-10 rounded-xl bg-black py-8 px-12 border border-main ${authState.mode === 'register' ? 'w-[600px]' : 'w-[450px]'}`}
        >
            <h2 className="mb-4 text-center text-3xl font-semibold">
              {modalTitle}
          </h2>
            {authError && <p className="mb-2 text-sm text-red-500 text-center">Error: {authError}</p>}

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
            
            {/* Conditional rendering for PaymentModal with Elements provider */}
            {authState.mode === 'register' && authState.currentStep === AuthStep.Payment && (
              <PaymentModal
                email={authState.email} 
                open={true} 
                onClose={() => {
                  handlePaymentModalClose();
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onClientSecretFetched={setPaymentClientSecret}
                clientSecret={paymentClientSecret}
                stripePromise={stripePromise}
                provisionalUserId={authState.provisionalUserId}
              />
            )}
            
            {(authState.currentStep === AuthStep.InitialRegistration || authState.mode === 'login') && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setMode(authState.mode === 'login' ? 'register' : 'login')}
                className="w-full mt-2 text-sm text-main disabled:opacity-60 hover:underline">
                {authState.mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign In'}
              </button>
            )}

            <button
              type="button"
              ref={cancelRef} 
              onClick={onClose} 
              className="mt-3 w-full rounded-md border border-gray-600 py-2.5 text-base font-semibold text-gray-400 transition hover:border-gray-500 hover:text-gray-300 disabled:opacity-50"
              disabled={isLoading && authState.currentStep !== AuthStep.Payment}
            >
              Cancel
            </button>
        </div>
      </div>
    </Dialog>
     </StripeProvider> 
  )
}
