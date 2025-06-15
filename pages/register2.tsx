import React, { useState, useEffect, useCallback } from "react";
import { useRouter, NextRouter } from "next/router";
import Image from "next/image";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from "@/lib/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useRegistrationStatus } from '@/lib/hooks/useRegistrationStatus';
import dynamic from 'next/dynamic';

// --- UI Components ---
import Input from '@/components/UI/input';
import MainButton from '@/components/UI/button';
import PricingToggle from '@/components/UI/PricingToggle';
import Passport from '@/components/Passport';
import Benefits from "@/components/UI/benefits";
import GridWithRays from "@/components/GridWithRays";
import benefitsStyles from "@/components/UI/benefits.module.css";
import { Lock } from "@/components/UI/lock";
import ProgressBarWithTimer from "@/components/UI/ProgressBarWithTimer";

// --- Services & Config ---
import { registerClient } from '../lib/firebase-client';
import { checkFaceDuplicate } from '../lib/services/authApiService';
import { uploadFileToStorage } from '../lib/services/fileUploadService';
import { maleStyles, femaleStyles, StyleItem } from "@/lib/avatarStyles";
import { blobToBase64, fileToBase64 } from "@/lib/base64";
import Link from "next/link";

// Dynamically generate displayAvatars from all maleStyles and femaleStyles
const displayAvatars = [
  ...maleStyles.map(style => ({
    nickname: style.archetype,
    gender: "male" as const,
    avatarUrl: style.src,
  })),
  ...femaleStyles.map(style => ({
    nickname: style.archetype,
    gender: "female" as const,
    avatarUrl: style.src,
  })),
];

// --- Stripe Promise ---
let stripePromise: ReturnType<typeof loadStripe> | null = null;

// Initialize Stripe only on client side
const getStripe = () => {
  if (!stripePromise && typeof window !== 'undefined') {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

interface RegistrationFlowProps {
  email: string;
  password: string;
  faceFile: File | null;
  plan: 'monthly' | 'yearly';
  gender: 'male' | 'female';
  selectedStyleId: string | null;
  currentStep: number;
  clientSecret: string | null;
  isScanning: boolean;
  isLoading: boolean;
  progressMessage: string | null;
  errorMessage: string | null;
  isGenerated: boolean;
  showPopup: boolean;
  finalPassport: { nickname: string; avatarUrl: string; citizenId: number } | null;
  stylesToShow: StyleItem[];
  isFaceChecking: boolean;
  isFaceUnique: boolean | null;
  faceCheckError: string | null;
  rotatingMessages: string[];
  currentMessageIndex: number;
  messageOpacity: number;
  isPaymentDetailsComplete: boolean;
  activePassportTab: number;
  setActivePassportTab: (tab: number) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setFaceFile: (file: File | null) => void;
  setPlan: (plan: 'monthly' | 'yearly') => void;
  setGender: (gender: 'male' | 'female') => void;
  setSelectedStyleId: (id: string | null) => void;
  setCurrentStep: (step: number) => void;
  setClientSecret: (secret: string | null) => void;
  setIsScanning: (isScanning: boolean) => void;
  handleGeneratePassport: () => Promise<void>;
  setShowPopup: (show: boolean) => void;
  router: NextRouter;
  handleRescan: () => void;
  scanKey: number;
  webcamAspectRatio: number | null;
  setWebcamAspectRatio: (ratio: number | null) => void;
  videoAspectRatio: number | null;
  setVideoAspectRatio: (ratio: number | null) => void;
  toast: (options: {
    title?: React.ReactNode;
    description?: React.ReactNode;
    duration?: number;
  }) => void;
  setIsPaymentDetailsComplete: (complete: boolean) => void;
}

interface CheckoutAndFinalizeProps extends RegistrationFlowProps {
  uploadedFaceUrl: string | null;
  setIsLoading: (loading: boolean) => void;
  setProgressMessage: (message: string | null) => void;
  setFinalPassport: (passport: { nickname: string; avatarUrl: string; citizenId: number } | null) => void;
  setIsGenerated: (generated: boolean) => void;
  setRegistrationInProgress: (inProgress: boolean) => void;
  toast: (options: {
    title?: React.ReactNode;
    description?: React.ReactNode;
    duration?: number;
  }) => void;
}

const FaceScanComponent = dynamic(() => import('@/components/faceScan/FaceScanComponent'), { ssr: false });

// --- The Main Registration Component (Now Dumb) ---
const RegistrationFlow = ({
  // State
  email, password, faceFile, plan, gender, selectedStyleId, currentStep, clientSecret, isScanning,
  isLoading, progressMessage, errorMessage, isGenerated, showPopup, finalPassport, stylesToShow,
  isFaceChecking, isFaceUnique, faceCheckError, rotatingMessages, currentMessageIndex, messageOpacity,
  isPaymentDetailsComplete,

  // Setters
  setEmail, setPassword, setFaceFile, setPlan, setGender, setSelectedStyleId, setCurrentStep,
  setClientSecret, setIsScanning,

  // Handlers
  handleGeneratePassport, handleRescan,

  // Final Passport Popup
  setShowPopup, router,

  // Key for remounting
  scanKey,

  // Webcam Aspect Ratio
  webcamAspectRatio,
  setWebcamAspectRatio,
  videoAspectRatio,
  setVideoAspectRatio,
  toast,
  setIsPaymentDetailsComplete,
  activePassportTab,
  setActivePassportTab,
}: RegistrationFlowProps) => {
  // Combine male and female styles for preview cycling
  const previewAvatars: Array<{ style: StyleItem; gender: 'male' | 'female' }> = [
    ...maleStyles.map(style => ({ style, gender: 'male' as const })),
    ...femaleStyles.map(style => ({ style, gender: 'female' as const })),
  ];
  const [currentDisplayAvatarIndex, setCurrentDisplayAvatarIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDisplayAvatarIndex(
        (prevIndex) => (prevIndex + 1) % previewAvatars.length
      );
    }, 2000); // Change avatar every 2 seconds

    return () => clearInterval(interval);
  }, [previewAvatars.length]);

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoHeight > 0) {
      setVideoAspectRatio(video.videoWidth / video.videoHeight);
    }
  };

  const handleStartScan = () => {
    setVideoAspectRatio(null);
    setIsScanning(true);
  };

  return (
    <main className="relative flex flex-col items-center gap-16 bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.1)_100%)] text-white">

      <Link href="/" className="fixed top-4 left-4 w-auto flex items-center text-white gap-2  px-2 py-1 bg-foreground mr-auto border border-gray rounded-md hover:border-dim_smoke transition-all duration-300">
        <Image src="/arrow-white.png" alt="Back" height={18} width={8} className="opacity-70 -rotate-90" />
        <span className="self-center text-sm font-regular whitespace-nowrap opacity-70 leading-none">
          Back
        </span>
      </Link>

      <div className="flex flex-col items-center mt-10 gap-6">
        <h1 className="text-center mb-6">Become Anthropos Citizen!</h1>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
          <Benefits className="absolute z-2 top-[-16px] right-[-50px]" text="Participation in Chat" delay="0s" />
          <Benefits className="absolute z-2 top-[40px] left-[-50px]" text="Anthropos Avatar" delay="0.3s" />
          <Benefits className="absolute z-2 top-[200px] right-[-40px]" text="Limitless knowledge" delay="0.6s" />
          {previewAvatars.map((avatar, index) => (
            <Passport
              key={avatar.style.id}
              className={`z-1 transition-opacity duration-1000 ${currentDisplayAvatarIndex === index ? "opacity-100" : "opacity-0 absolute"}`}
              nickname={avatar.style.archetype}
              gender={avatar.gender}
              avatarUrl={avatar.style.src}
            />
          ))}
        </div>
      </div>

      {isLoading && progressMessage && <div className="text-yellow-400 my-4">{progressMessage}</div>}
      {errorMessage && <div className="text-red-500 bg-red-900/50 p-3 rounded-lg max-w-md text-center my-4">{errorMessage}</div>}

      {/* step1 */}
      <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 1 ? "opacity-100" : "opacity-40"}`}>
        <div className="flex flex-col items-center">
          <h2 className="">Step 1: Face Scan</h2>
          <Image src="/Step1.png" alt="Step 1 visual" width={120} height={32} className="mb-6" />
        </div>
        <div
          className="w-full max-w-md h-auto border border-main rounded-2xl relative bg-black flex flex-col justify-center items-center overflow-hidden transition-all duration-300"
          style={{
            aspectRatio: webcamAspectRatio || videoAspectRatio || '4/3',
            minWidth: '320px'
          }}
        >
          {(isScanning || faceFile) ? (
            <FaceScanComponent
              key={scanKey}
              onCapture={(file) => { setFaceFile(file); setIsScanning(false); }}
              onRescan={handleRescan}
              capturedImage={faceFile}
              isFaceChecking={isFaceChecking}
              isFaceUnique={isFaceUnique}
              faceCheckError={faceCheckError}
              isLoading={isLoading}
              onVideoReady={setWebcamAspectRatio}
            />
          ) : (
            <>
              <video
                src="https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/facescancropped.mp4"
                autoPlay
                loop
                muted
                playsInline
                onLoadedMetadata={handleVideoMetadata}
                className="absolute inset-0 object-contain pointer-events-none aspect-auto"
              />
              <MainButton className="z-10" onClick={handleStartScan} disabled={isLoading}>Scan Your Face</MainButton>
            </>
          )}
        </div>
      </div>

      {/* Lock between Step 1 and Step 2 */}
      <Lock imgSrc={currentStep >= 2 ? '/Unlock.png' : '/Lock.png'} hideLines={currentStep >= 2} />

      {/* step2 – Avatar style selection now comes immediately after face scan */}
      <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 2 ? "opacity-100" : "opacity-40"}`}>
        <div className="flex flex-col items-center">
          <h2 className="">Step 2: Avatar Style</h2>
          <Image src="/Step2.png" alt="Step 2 visual" width={120} height={32} className="mb-6" />
        </div>
        <div className="flex gap-2">
          <MainButton variant={gender === 'male' ? "solid" : "outline"} onClick={() => setGender("male")}>Male</MainButton>
          <MainButton variant={gender === 'female' ? "solid" : "outline"} onClick={() => setGender("female")}>Female</MainButton>
        </div>
        <div className="w-80 grid grid-cols-3 gap-2">
          {stylesToShow.map((item: StyleItem) => (
            <div key={item.id} onClick={() => setSelectedStyleId(item.id)} className={`relative cursor-pointer rounded-lg overflow-hidden transition ${selectedStyleId === item.id ? "ring-2 ring-main" : "ring-2 ring-transparent hover:ring-gray-500"}`}>
              <Image src={item.src} width={100} height={100} alt={item.archetype} className="object-cover" loading="eager" />
              {selectedStyleId === item.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-main text-black flex items-center justify-center font-bold">✓</div></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Lock */}
      <Lock imgSrc={currentStep >= 3 ? '/Unlock.png' : '/Lock.png'} hideLines={currentStep >= 3} />

      {/* step3 – Payment comes *after* avatar style selection */}
      <div className={`flex mb-16 flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 3 ? "opacity-100" : "opacity-40"}`}>
        <div className="flex flex-col items-center">
          <h2 className="">Step 3: Payment & Account</h2>
          <Image src="/Step3.png" alt="Step 3 visual" width={120} height={32} className="mb-6" />
        </div>

        {/* Email and Password inputs */}
        <div className="flex flex-col gap-4 min-w-80">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={isLoading || isFaceUnique === false}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={isLoading || isFaceUnique === false}
          />
        </div>

        <PricingToggle plan={plan} onPlanChange={setPlan} disabled={isLoading || isFaceUnique === false} />
        <div className="min-w-80 w-80 ">
          {currentStep === 3 && clientSecret ? (
            <PaymentElement onChange={(e) => setIsPaymentDetailsComplete(e.complete)} />
          ) : (
            <p className="text-center text-gray-400">Initializing payment...</p>
          )}
        </div>

        {/* Generate button because payment is now Step 3 */}
        <MainButton
          variant="solid"
          onClick={handleGeneratePassport}
          disabled={
            isLoading ||
            currentStep !== 3 ||
            !email ||
            !password ||
            !selectedStyleId ||
            !isPaymentDetailsComplete
          }
        >
          {isLoading ? "Processing..." : "Generate Passport"}
        </MainButton>
      </div>

      {/* --- Final Passport Popup --- */}
      {isGenerated && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/70" />
          <div className={`absolute bottom-0 left-0 w-full h-full bg-black flex flex-col items-center justify-center transform transition-transform duration-500 gap-6 ${showPopup ? "translate-y-0" : "translate-y-full"}`}>
            {finalPassport ? (
              <>
                <GridWithRays />
                <h1 className="text-3xl font-bold">Your Passport is Ready!</h1>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
                  <Passport
                    className="z-1"
                    nickname={finalPassport.nickname}
                    gender={gender}
                    avatarUrl={finalPassport.avatarUrl}
                    citizenId={finalPassport.citizenId}
                  />
                </div>
                <MainButton variant="solid" onClick={() => router.push("/")}>Enter the City</MainButton>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">Forging Your Passport...</h1>

                {/* Progress Bar and Time Remaining */}
                <ProgressBarWithTimer />

                <div className="relative flex items-center justify-center">
                  {/* Blurred glow behind the passport */}
                  <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[100px] opacity-80 animate-pulse" />

                  {/* Passport placeholder that will update automatically once finalPassport is ready */}
                  {(() => {
                    const selectedStyle = stylesToShow.find((s) => s.id === selectedStyleId);
                    const placeholderAvatar = selectedStyle?.src || '/default-avatar.svg';
                    return (
                      <div className="flex flex-col items-center relative">
                        <Passport
                          className="z-10 animate-pulse"
                          nickname={progressMessage ? '...' : 'Forging'}
                          gender={gender}
                          avatarUrl={placeholderAvatar}
                        />

                        {/* Overlay shimmer to indicate forging */}
                        {/*
                        <div className="absolute inset-0 -top-50 flex flex-col items-center justify-center rounded-[16px] max-w-60 mx-auto">
                          <p className="text-white text-center px- animate-pulse">
                            {progressMessage || 'Generating avatar & citizen name...'}
                          </p>
                        </div>
                        */}
                        <div className="relative inset-0  flex flex-col items-center justify-center rounded-[16px] max-w-80 mx-auto mt-8">
                          <p className="text-smoke text-center px-4 transition-opacity duration-1000 h-16" style={{ opacity: messageOpacity }}>
                            {rotatingMessages[currentMessageIndex]}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// This new component will be wrapped in <Elements> and can use Stripe hooks
const CheckoutAndFinalize = (props: CheckoutAndFinalizeProps) => {
  const {
    email, password, faceFile, selectedStyleId, stylesToShow, clientSecret, uploadedFaceUrl,
    setIsLoading, setProgressMessage, setFinalPassport,
    setIsGenerated, setRegistrationInProgress, toast
  } = props;

  const stripe = useStripe();
  const elements = useElements();
  const submissionGuard = React.useRef(false);
  // Ref to store polling interval ID so we can clear it on unmount
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  // --- New Polling Logic ---
  const startPollingForStatus = (userId: string, idToken: string) => {
    // Store interval so it can be cleared later
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/auth/check-status?userId=${userId}`);

        if (statusResponse.status === 404) {
          clearInterval(pollInterval);
          toast({
            title: 'Payment Failed',
            description: 'Your payment could not be completed. No money was taken. Please try again.',
            duration: 8000,
          });
          // Reset front-end state
          setIsLoading(false);
          setProgressMessage(null);
          setIsGenerated(false);
          props.setShowPopup(false);
          props.setRegistrationInProgress(false);
          props.setClientSecret(null); // Reset the secret to unmount PaymentElement
          props.setCurrentStep(1);
          return;
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'ACTIVE') {
          clearInterval(pollInterval);
          setProgressMessage('Logging you in...');
          const signInResult = await signIn('credentials', { idToken, redirect: false });

          if (signInResult?.error) {
            throw new Error(`Login failed after registration: ${signInResult.error}`);
          }

          setFinalPassport({ nickname: statusData.nickname, avatarUrl: statusData.avatarUrl, citizenId: statusData.citizenId });
          setProgressMessage(null);
          setIsLoading(false);
        }
      } catch (pollError) {
        clearInterval(pollInterval);
        pollingRef.current = null;
        throw new Error('Failed to check registration status. Please try logging in later.');
      }
    }, 3000);

    pollingRef.current = pollInterval;
  };

  const handleGeneratePassport = async () => {
    // Synchronous guard against double-clicks
    if (submissionGuard.current) {
      toast({ title: 'Processing...', description: 'Your passport generation is already in progress.', duration: 3000 });
      return;
    }

    if (!stripe || !elements || !clientSecret || !selectedStyleId || !faceFile || !email || !password || !uploadedFaceUrl || !props.plan) {
      toast({ title: "Incomplete Form", description: "Please complete all steps, including email, password, and style selection.", duration: 5000 });
      return;
    }

    submissionGuard.current = true;
    setIsLoading(true);
    setProgressMessage('Initializing...');
    props.setIsGenerated(true);
    setTimeout(() => props.setShowPopup(true), 10);

    let idToken = '';

    try {
      // 1. VALIDATE + LOCK
      setProgressMessage('Validating payment details...');
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        throw new Error(submitErr.message || 'Failed to validate payment form.');
      }

      // 2. CREATE PAYMENT METHOD
      setProgressMessage('Securing payment method...');
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(PaymentElement) as any, // PaymentElement used in manual creation
        billing_details: { email },
      } as any);

      if (pmError) {
        throw new Error(pmError.message || 'Could not create payment method.');
      }
      if (!paymentMethod) {
        throw new Error('Failed to create payment method. Please try again.');
      }

      // After this point, other async actions are safe
      setProgressMessage('Creating your citizen account...');
      const cred = await registerClient(email, password);
      idToken = await cred.user.getIdToken();

      // 3. BACKEND ROUND-TRIP
      setProgressMessage('Submitting registration...');
      const setupResponse = await fetch('/api/auth/setup-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan: props.plan,
          paymentMethodId: paymentMethod.id,
          idToken,
          faceUrl: uploadedFaceUrl,
          styleId: selectedStyleId,
          gender: props.gender,
        }),
      });

      if (!setupResponse.ok) {
        const errorData = await setupResponse.json();
        throw new Error(errorData.message || "An error occurred during registration setup.");
      }

      const setupData = await setupResponse.json();
      if (!setupData.clientSecret) {
        throw new Error("Backend did not return a client secret for payment confirmation.");
      }

      // 4. CONFIRM THE INVOICE PAYMENTINTENT
      setProgressMessage('Awaiting payment confirmation...');
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: setupData.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        // This can happen if the user closes the 3DS modal, etc.
        throw new Error(confirmError.message || 'Payment confirmation failed. Please try again.');
      }

      if (paymentIntent?.status !== 'succeeded') {
        // This case might be hit if `if_required` doesn't redirect but payment is not successful.
        throw new Error(`Payment not successful (status: ${paymentIntent?.status}). Please try again.`);
      }

      // 5. SUCCESS - START POLLING
      setProgressMessage('Payment successful! Forging your passport...');
      startPollingForStatus(setupData.userId, idToken);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      submissionGuard.current = false; // Reset guard on failure

      // On error, hide the popup and show a toast
      props.setShowPopup(false);
      setTimeout(() => {
        props.setIsGenerated(false);
      }, 500); // Animation duration

      toast({ title: 'Registration Failed', description: message, duration: 9000 });
      setIsLoading(false);
      setProgressMessage(null);
      props.setRegistrationInProgress(false);
    }
  };

  // Cleanup polling interval when component unmounts
  React.useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return <RegistrationFlow {...props} handleGeneratePassport={handleGeneratePassport} />;
}

// This is the main stateful component for the page
const Register2Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { setRegistrationInProgress } = useRegistrationStatus();

  // --- Core Data State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // --- Flow & UI State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanKey, setScanKey] = useState(0);

  // --- New State for Webcam Aspect Ratio ---
  const [webcamAspectRatio, setWebcamAspectRatio] = useState<number | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);

  // --- New State for Early Face Validation ---
  const [isFaceChecking, setIsFaceChecking] = useState(false);
  const [isFaceUnique, setIsFaceUnique] = useState<boolean | null>(null);
  const [faceCheckError, setFaceCheckError] = useState<string | null>(null);
  const [uploadedFaceUrl, setUploadedFaceUrl] = useState<string | null>(null);
  const [isPaymentDetailsComplete, setIsPaymentDetailsComplete] = useState(false);

  // --- Final Passport State ---
  const [isGenerated, setIsGenerated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [finalPassport, setFinalPassport] = useState<{ nickname: string, avatarUrl: string, citizenId: number } | null>(null);

  // --- Rotating messages state ---
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(1);
  const rotatingMessages = [
    "Did you know that Anthropos City crypto currency is designed to always go up in price?",
    "You can buy Anthropos City Token on our home page by pressing \"BUY NOW\" button.",
    "Tired of not acomplishing your goals? Try our AI productivity system."
  ];

  const stylesToShow = gender === "male" ? maleStyles : femaleStyles;

  // Replace the current zoom effect with this:
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      // Target the content container instead of body
      const contentElement = document.getElementById('app-content');
      if (contentElement) {
        contentElement.style.zoom = "125%";
      }
    }

    // Cleanup: reset zoom when unmounting
    return () => {
      if (typeof window !== "undefined") {
        const contentElement = document.getElementById('app-content');
        if (contentElement) {
          contentElement.style.zoom = "100%";
        }
      }
    };
  }, []);

  // Use client-side only features
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    // Signal that registration is in progress as soon as the page loads
    setRegistrationInProgress(true);

    return () => {
      // Signal that registration is no longer in progress when leaving the page
      setRegistrationInProgress(false);
    };
  }, [setRegistrationInProgress]);

  // This effect runs on initial load to check for a redirect from Stripe
  // It must be in the top-level component to correctly set the initial state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const secret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
      if (secret) {
        setClientSecret(secret);
        setCurrentStep(3); // Redirect lands on the payment step now
      }
    }
  }, []);

  const handleRescan = () => {
    setFaceFile(null);
    setIsScanning(true);
    setScanKey(prev => prev + 1);
    setWebcamAspectRatio(null); // Reset aspect ratio
    setVideoAspectRatio(null);
    setClientSecret(null); // Critical: Reset client secret
    setCurrentStep(1); // Go back to step 1
  };

  const createSetupIntent = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/stripe/create-setup-intent', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize payment form');

      setClientSecret(data.clientSecret);
      setCurrentStep(2);

    } catch (err: unknown) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage("An unknown error occurred");
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, []);

  // Effect 1: Check face uniqueness when a new face is scanned
  useEffect(() => {
    if (!faceFile || uploadedFaceUrl) return; // Only run on new face scan

    const checkFaceUniqueness = async () => {
      setIsFaceChecking(true);
      setFaceCheckError(null);
      setIsFaceUnique(null);
      setErrorMessage(null);

      try {
        // Step 1: Upload the file to get a persistent URL.
        const faceUrl = await uploadFileToStorage(faceFile, 'userfaceimage');
        setUploadedFaceUrl(faceUrl);

        // Step 2: Call our API endpoint to check for uniqueness
        const response = await fetch('/api/auth/check-face-uniqueness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: faceUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle non-2xx responses
          if (response.status === 409) { // 409 Conflict for duplicate
            setIsFaceUnique(false);
            const errorMsg = data.message || 'This face is already registered.';
            setFaceCheckError(errorMsg);
            const errorToast = { title: 'Registration Blocked', description: errorMsg, duration: 10000 };
            toast(errorToast);
          } else {
            throw new Error(data.error || `Server responded with ${response.status}`);
          }
        } else {
          // Handle successful response
          if (data.isDuplicate) {
            setIsFaceUnique(false);
            const errorMsg = data.message || 'This face is already registered.';
            setFaceCheckError(errorMsg);
            const errorToast = { title: 'Registration Blocked', description: errorMsg, duration: 10000 };
            toast(errorToast);
          } else {
            setIsFaceUnique(true);
            const successToast = { title: 'Face Verified', description: 'Your face is unique! Proceeding to the next step.' };
            toast(successToast);
          }
        }

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred during face check.';
        setFaceCheckError(message);
        setIsFaceUnique(false); // Assume failure means not unique or error
        const errorToast = { title: 'Verification Error', description: message };
        toast(errorToast);
      } finally {
        setIsFaceChecking(false);
      }
    };

    checkFaceUniqueness();
  }, [faceFile, uploadedFaceUrl, toast]);

  // Effect 2: Create setup intent after face is confirmed unique
  useEffect(() => {
    if (isBrowser && isFaceUnique === true && currentStep === 1 && !clientSecret && !isLoading) {
      createSetupIntent();
    }
  }, [isBrowser, isFaceUnique, currentStep, clientSecret, isLoading, createSetupIntent]);

  // Effect to advance from avatar style (Step 2) to payment (Step 3)
  useEffect(() => {
    if (isBrowser && currentStep === 2 && selectedStyleId) {
      setCurrentStep(3);
    }
  }, [isBrowser, currentStep, selectedStyleId]);

  useEffect(() => {
    if (!faceFile) {
      setUploadedFaceUrl(null);
      setIsFaceUnique(null);
      setFaceCheckError(null);
      setClientSecret(null);
      if (currentStep !== 1) {
        setCurrentStep(1);
      }
    }
  }, [faceFile, currentStep]);

  // --- Effect for rotating messages ---
  useEffect(() => {
    const messageInterval = setInterval(() => {
      // Fade out
      setMessageOpacity(0);

      // After fade out completes, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % rotatingMessages.length);
        setMessageOpacity(1);
      }, 1000); // Wait for fade out transition to complete
    }, 15000); // 15 seconds

    return () => clearInterval(messageInterval);
  }, [rotatingMessages.length]);

  const props = {
    email, password, faceFile, plan, gender, selectedStyleId, currentStep, clientSecret, isScanning,
    isLoading, progressMessage, errorMessage, isGenerated, showPopup, finalPassport, stylesToShow,
    isFaceChecking, isFaceUnique, faceCheckError, rotatingMessages, currentMessageIndex, messageOpacity,
    isPaymentDetailsComplete,
    setEmail, setPassword, setFaceFile, setPlan, setGender, setSelectedStyleId, setCurrentStep,
    setClientSecret, setIsScanning, setIsLoading, setErrorMessage, setProgressMessage,
    setIsGenerated, setShowPopup, setFinalPassport,
    handleGeneratePassport: async () => { }, // Placeholder, will be overridden
    router,
    handleRescan,
    scanKey,
    webcamAspectRatio,
    setWebcamAspectRatio,
    videoAspectRatio,
    setVideoAspectRatio,
    toast,
    setIsPaymentDetailsComplete,
    activePassportTab: 1,
    setActivePassportTab: () => { },
  };

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#ffffff',
      colorBackground: '#262626',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '6px',
      colorTextPlaceholder: '#9ca3af',
    },
    rules: {
      '.Block': {
        border: 'none',
        boxShadow: 'none',
        backgroundColor: '#262626',
        fontFamily: 'inherit',
      },
      '.Input': {
        border: '1px solid gray',
        backgroundColor: '#26262626',
        color: '#fff',
        fontFamily: 'inherit',
      },
      '.Label': {
        color: '#B3B3B3',
        fontFamily: 'inherit',
      },
      '.Tab, .Tab--selected': {
        color: '#E6E6E6',
        fontFamily: 'inherit',
      },
    },
  } as const;

  // Server-side rendering safe version - avoids hydration errors
  if (!isBrowser) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-yellow-400 my-4 z-10">Loading...</p>
      </main>
    );
  }

  // Decide what to render based on clientSecret availability

  // 1️⃣ Still waiting for backend to create SetupIntent
  if (!clientSecret) {
    return <RegistrationFlow {...props} setIsPaymentDetailsComplete={setIsPaymentDetailsComplete} />;
  }

  // 2️⃣ We have a clientSecret – mount Stripe Elements early so PaymentElement can preload.
  return (
    <Elements stripe={getStripe()} options={{ clientSecret, appearance, paymentMethodCreation: 'manual' }} key={clientSecret}>
      {currentStep < 3 ? (
        <RegistrationFlow {...props} setIsPaymentDetailsComplete={setIsPaymentDetailsComplete} />
      ) : (
        <CheckoutAndFinalize {...props} uploadedFaceUrl={uploadedFaceUrl} setRegistrationInProgress={setRegistrationInProgress} />
      )}
    </Elements>
  );
}

export default Register2Page;
