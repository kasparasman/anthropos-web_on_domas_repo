import React, { useState, useEffect, useCallback } from "react";
import { useRouter, NextRouter } from "next/router";
import Image from "next/image";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

// --- UI Components ---
import Input from '@/components/UI/input';
import MainButton from '@/components/UI/button';
import PricingToggle from '@/components/UI/PricingToggle';
import Passport from '@/components/Passport';
import FaceScanComponent from "@/components/faceScan/FaceScanComponent";
import Benefits from "@/components/UI/benefits";
import GridWithRays from "@/components/GridWithRays";
import benefitsStyles from "@/components/UI/benefits.module.css";
import { Lock } from "@/components/UI/lock";

// --- Services & Config ---
import { registerClient } from '../lib/firebase-client';
import { checkFaceDuplicate } from '../lib/services/authApiService';
import { uploadFileToStorage } from '../lib/services/fileUploadService';
import { maleStyles, femaleStyles, StyleItem } from "@/lib/avatarStyles";
import { blobToBase64, fileToBase64 } from "@/lib/base64";

// --- Helper: Generate Avatar (with MOCKING) ---
async function generateAvatar(selfieB64: string, styleB64: string): Promise<string> {
  const MOCK_AVATAR_GEN = process.env.NEXT_PUBLIC_MOCK_AVATAR_GEN === 'true';

  if (MOCK_AVATAR_GEN) {
    console.log("--- MOCKING AVATAR GENERATION ---");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    // Determine if we should use female or male styles based on the styleB64
    const isFemaleStyle = styleB64.includes("female");
    const stylesArray = isFemaleStyle ? femaleStyles : maleStyles;

    // Get a random style from the appropriate gender array
    const randomIndex = Math.floor(Math.random() * stylesArray.length);
    return stylesArray[randomIndex].src;
  }

  const res = await fetch('/api/avatar-gen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selfieBase64: selfieB64, styleBase64: styleB64 }),
  });
  if (!res.ok || !res.body) {
    const errorText = await res.text();
    throw new Error(`Avatar generation failed: ${errorText}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let url: string | null = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      if (part.includes('event: uploaded')) {
        const line = part.split('\n').find(l => l.startsWith('data:'));
        if (line) url = line.slice(6);
      }
    }
  }
  if (!url) throw new Error('Avatar generation stream did not yield a URL.');
  return url;
}

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
  finalPassport: { nickname: string; avatarUrl: string } | null;
  stylesToShow: StyleItem[];
  isFaceChecking: boolean;
  isFaceUnique: boolean | null;
  faceCheckError: string | null;
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
  setFinalPassport: (passport: { nickname: string; avatarUrl: string } | null) => void;
  setIsGenerated: (generated: boolean) => void;
  setRegistrationInProgress: (inProgress: boolean) => void;
  toast: (options: {
    title?: React.ReactNode;
    description?: React.ReactNode;
    duration?: number;
  }) => void;
}

// --- The Main Registration Component (Now Dumb) ---
const RegistrationFlow = ({
  // State
  email, password, faceFile, plan, gender, selectedStyleId, currentStep, clientSecret, isScanning,
  isLoading, progressMessage, errorMessage, isGenerated, showPopup, finalPassport, stylesToShow,
  isFaceChecking, isFaceUnique, faceCheckError,

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
  toast,
  setIsPaymentDetailsComplete,
}: RegistrationFlowProps) => {
  return (
    <main className="relative flex flex-col items-center gap-16 bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.1)_100%)] text-white">
      <GridWithRays />
      <div className="h-full flex fixed justify-between bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
      <img
          src="/BurjKalifa.png"
          alt="background"
          className="hidden lg:block ml-[-100px] opacity-100 pointer-events-none"
        />
        <img
          src="/Building2.png"
          alt="background"
          className="hidden lg:block mr-[-600px] opacity-100 pointer-events-none"
        />
      </div>

      <div className="flex flex-col items-center mt-10 gap-6">
        <h1>Become Anthropos Citizen!</h1>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
          <Benefits className="absolute z-2 top-[-16px] right-[-50px]" text="Participation in Chat" delay="0s" />
          <Benefits className="absolute z-2 top-[40px] left-[-50px]" text="Anthropos Avatar" delay="0.3s" />
          <Benefits className="absolute z-2 top-[200px] right-[-40px]" text="Limitless knowledge" delay="0.6s" />
          <Passport className="z-1" nickname="John Doe" gender="male" avatarUrl="/default-avatar.svg" />
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
          className="min-w-80 w-80 h-60 border border-main rounded-2xl relative bg-black flex flex-col justify-center items-center overflow-hidden transition-all duration-300"
          style={{ aspectRatio: webcamAspectRatio || '16/9' }}
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
              <Image src="/Mask.png" alt="Face scan mask" layout="fill" className="absolute inset-0 m-auto object-contain max-w-[80%] max-h-[80%] pointer-events-none" />
              <MainButton className="z-10" onClick={() => setIsScanning(true)} disabled={isLoading}>Scan Your Face</MainButton>
            </>
          )}
        </div>
      </div>

      <Lock imgSrc={currentStep >= 2 ? '/unlock.png' : '/lock.png'} hideLines={currentStep >= 2} />

      {/* step2 */}
      <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 2 ? "opacity-100" : "opacity-40"}`}>
        <div className="flex flex-col items-center">
          <h2 className="">Step 2: Payment & Account</h2>
          <Image src="/Step2.png" alt="Step 2 visual" width={120} height={32} className="mb-6" />
        </div>

        {/* Email and Password inputs - now in step 2 */}
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
          {clientSecret ? <PaymentElement onChange={(e) => setIsPaymentDetailsComplete(e.complete)} /> : <p className="text-center text-gray-400">Initializing payment...</p>}
        </div>
      </div>

      {/* Lock */}
      <Lock imgSrc={currentStep >= 3 ? '/unlock.png' : '/lock.png'} hideLines={currentStep >= 3} />

      {/* step3 */}
      <div className={`flex mb-16 flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 3 ? "opacity-100" : "opacity-40"}`}>
        <div className="flex flex-col items-center">
          <h2 className="">Step 3: Passport Generation</h2>
          <Image src="/Step3.png" alt="Step 3 visual" width={120} height={32} className="mb-6" />
        </div>
        <div className="flex gap-2">
          <MainButton variant={gender === 'male' ? "solid" : "outline"} onClick={() => setGender("male")}>Male</MainButton>
          <MainButton variant={gender === 'female' ? "solid" : "outline"} onClick={() => setGender("female")}>Female</MainButton>
        </div>
        <div className="w-80 grid grid-cols-3 gap-2">
          {stylesToShow.map((item: StyleItem) => (
            <div key={item.id} onClick={() => setSelectedStyleId(item.id)} className={`relative cursor-pointer rounded-lg overflow-hidden transition ${selectedStyleId === item.id ? "ring-2 ring-main" : "ring-2 ring-transparent hover:ring-gray-500"}`}>
              <Image src={item.src} width={100} height={100} alt={item.alt} className="object-cover" loading="eager" />
              {selectedStyleId === item.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-main text-black flex items-center justify-center font-bold">✓</div></div>}
            </div>
          ))}
        </div>
        <MainButton variant="solid" onClick={handleGeneratePassport} disabled={!selectedStyleId || isLoading || currentStep !== 3 || !email || !password}>
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
                <GridWithRays/>
                <h1 className="text-3xl font-bold">Your Passport is Ready!</h1>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
                  <Passport className="z-1" nickname={finalPassport.nickname} gender={gender} avatarUrl={finalPassport.avatarUrl} />
                </div>
                <MainButton variant="solid" onClick={() => router.push("/")}>Enter the City</MainButton>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">Forging Your Passport...</h1>
                <div className="relative w-64 h-96 flex items-center justify-center">
                  <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[100px] animate-pulse"></div>
                  <p className="z-10 text-white/80 max-w-xs text-center">{progressMessage || 'Please wait, this may take a moment.'}</p>
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

  const handleGeneratePassport = async () => {
    if (!stripe || !elements || !clientSecret || !selectedStyleId || !faceFile || !email || !password || !uploadedFaceUrl || !props.plan) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all steps, including email, password, and style selection.",
        duration: 5000
      });
      return;
    }

    setIsLoading(true);
    setProgressMessage('Initializing...');
    props.setIsGenerated(true);
    setTimeout(() => props.setShowPopup(true), 10);

    let idToken = ''; // Keep idToken in a wider scope

    try {
      // Step 1: Validate payment form
      setProgressMessage('Validating payment information...');
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message || "Payment form validation failed.");

      // Step 2: Confirm the card setup
      setProgressMessage('Securing payment method...');
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });
      if (setupError) throw new Error(setupError.message || "Failed to secure payment method.");
      if (setupIntent?.status !== 'succeeded' || !setupIntent.payment_method) throw new Error("Could not verify payment method.");

      // Step 3: Create Firebase user
      setProgressMessage('Creating your citizen account...');
      const cred = await registerClient(email, password);
      idToken = await cred.user.getIdToken(); // Assign to wider scope variable

      // Step 4: Call the backend to SETUP everything (but not finalize)
      setProgressMessage('Submitting registration...');
      const setupResponse = await fetch('/api/auth/setup-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan: props.plan,
          paymentMethodId: setupIntent.payment_method,
          idToken,
          faceUrl: uploadedFaceUrl,
          styleUrl: stylesToShow.find(s => s.id === selectedStyleId)?.src,
          nickname: email.split('@')[0],
          gender: props.gender,
        }),
      });

      const setupData = await setupResponse.json();
      if (!setupResponse.ok) throw new Error(setupData.message || "An error occurred during registration setup.");

      // Step 5: Start polling for activation status
      setProgressMessage('Awaiting payment confirmation...');
      const userId = setupData.userId;
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/auth/check-status?userId=${userId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === 'ACTIVE') {
            clearInterval(pollInterval);

            setProgressMessage('Logging you in...');
            const signInResult = await signIn('credentials', {
              idToken,
              redirect: false,
            });

            if (signInResult?.error) {
              throw new Error(`Login failed after registration: ${signInResult.error}`);
            }

            // Success!
            setFinalPassport({ nickname: statusData.nickname, avatarUrl: statusData.avatarUrl });
            setProgressMessage(null);
            setIsLoading(false);
          }
          // If status is still 'PENDING_PAYMENT', do nothing and let it poll again.

        } catch (pollError) {
          // Stop polling on error
          clearInterval(pollInterval);
          throw new Error("Failed to check registration status. Please try logging in later.");
        }
      }, 3000); // Poll every 3 seconds

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";

      // On error, hide the popup and show a toast
      props.setShowPopup(false);
      setTimeout(() => {
        props.setIsGenerated(false);
      }, 500); // Animation duration

      toast({ title: 'Registration Failed', description: message, duration: 9000 });
      setIsLoading(false);
      setProgressMessage(null);
      setRegistrationInProgress(false);
    }
  };

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

  // --- New State for Early Face Validation ---
  const [isFaceChecking, setIsFaceChecking] = useState(false);
  const [isFaceUnique, setIsFaceUnique] = useState<boolean | null>(null);
  const [faceCheckError, setFaceCheckError] = useState<string | null>(null);
  const [uploadedFaceUrl, setUploadedFaceUrl] = useState<string | null>(null);
  const [isPaymentDetailsComplete, setIsPaymentDetailsComplete] = useState(false);

  // --- Final Passport State ---
  const [isGenerated, setIsGenerated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [finalPassport, setFinalPassport] = useState<{ nickname: string, avatarUrl: string } | null>(null);

  const stylesToShow = gender === "male" ? maleStyles : femaleStyles;

  // 1) Zoom effect: apply 125% on mount, only if desktop (≥1024px)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      document.body.style.zoom = "125%";
    }

    // Cleanup: reset zoom when unmounting
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.zoom = "100%";
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
        setCurrentStep(2); // Or 3, depending on where the user should land
      }
    }
  }, []);

  const handleRescan = () => {
    setFaceFile(null);
    setIsScanning(true);
    setScanKey(prev => prev + 1);
    setWebcamAspectRatio(null); // Reset aspect ratio
    setClientSecret(null); // Critical: Reset client secret
    setCurrentStep(1); // Go back to step 1
  };

  const createSetupIntent = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setProgressMessage('Preparing payment form...');
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

      const MOCK_FACE_UNIQUE = process.env.NEXT_PUBLIC_MOCK_FACE_UNIQUE_CHECK === 'true';

      try {
        // Step 1: Upload the file to get a persistent URL. This is now
        // required for both mock and real flows so the webhook can access it.
        const faceUrl = await uploadFileToStorage(faceFile);
        setUploadedFaceUrl(faceUrl);

        if (MOCK_FACE_UNIQUE) {
          console.log("--- MOCKING FACE UNIQUENESS CHECK (SUCCESS) ---");
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsFaceUnique(true);
          toast({ title: 'Face Verified (Mock)', description: 'Your face is unique! Proceeding to the next step.' });
          setIsFaceChecking(false);
          return; // Exit mock flow here
        }

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

  // Effect to advance to step 3 once step 2 is complete
  useEffect(() => {
    const isEmailValid = email.trim().length > 5 && email.includes('@');
    const isPasswordValid = password.length >= 6;

    if (
      isBrowser &&
      isFaceUnique === true &&
      currentStep === 2 &&
      isEmailValid &&
      isPasswordValid &&
      isPaymentDetailsComplete
    ) {
      setCurrentStep(3);
    }
  }, [isBrowser, isFaceUnique, currentStep, email, password, isPaymentDetailsComplete]);

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

  const props = {
    email, password, faceFile, plan, gender, selectedStyleId, currentStep, clientSecret, isScanning,
    isLoading, progressMessage, errorMessage, isGenerated, showPopup, finalPassport, stylesToShow,
    isFaceChecking, isFaceUnique, faceCheckError,
    setEmail, setPassword, setFaceFile, setPlan, setGender, setSelectedStyleId, setCurrentStep,
    setClientSecret, setIsScanning, setIsLoading, setErrorMessage, setProgressMessage,
    setIsGenerated, setShowPopup, setFinalPassport,
    handleGeneratePassport: async () => { }, // Placeholder, will be overridden
    router,
    handleRescan,
    scanKey,
    webcamAspectRatio,
    setWebcamAspectRatio,
    toast,
    setIsPaymentDetailsComplete,
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
        <GridWithRays />
        <p className="text-yellow-400 my-4 z-10">Loading...</p>
      </main>
    );
  }

  // Render Step 1 if we are not processing a payment yet
  if (currentStep < 2) {
    return <RegistrationFlow {...props} setIsPaymentDetailsComplete={setIsPaymentDetailsComplete} />;
  }

  // If we are on step 2+, we need a client secret. If we don't have one, show a loading state.
  // This also covers the time between clicking "Proceed to Payment" and the API returning the secret.
  if (!clientSecret) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen text-white">
        <GridWithRays />
        <p className="text-yellow-400 my-4 z-10">Initializing Secure Payment...</p>
      </main>
    );
  }

  // Once we have a clientSecret, wrap the rest of the flow in the Elements provider
  return (
    <Elements stripe={getStripe()} options={{ clientSecret, appearance }} key={clientSecret}>
      <CheckoutAndFinalize {...props} uploadedFaceUrl={uploadedFaceUrl} setRegistrationInProgress={setRegistrationInProgress} />
    </Elements>
  );
}

export default Register2Page;
