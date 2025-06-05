import React, { useState, useEffect } from "react";
import { useRouter, NextRouter } from "next/router";
import Image from "next/image";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// --- UI Components ---
import Input from '@/components/UI/input';
import MainButton from '@/components/UI/button';
import PricingToggle from '@/components/UI/PricingToggle';
import Passport from '@/components/Passport';
import FaceScanComponent from "@/components/faceScan/FaceScanComponent";
import Benefits from "@/components/UI/benefits";
import GridWithRays from "@/components/GridWithRays";

// --- Services & Config ---
import { registerClient } from '../lib/firebase-client';
import { checkFaceDuplicate } from '../lib/services/authApiService';
import { uploadFileToStorage } from '../lib/services/fileUploadService';
import { maleStyles, femaleStyles, StyleItem } from "@/lib/avatarStyles";

// --- Helper: Generate Avatar (with MOCKING) ---
async function generateAvatar(selfieB64: string, styleB64: string): Promise<string> {
    const MOCK_AVATAR_GEN = process.env.NEXT_PUBLIC_MOCK_AVATAR_GEN === 'true';

    if (MOCK_AVATAR_GEN) {
        console.log("--- MOCKING AVATAR GENERATION ---");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        const randomIndex = Math.floor(Math.random() * maleStyles.length);
        return maleStyles[randomIndex].src; 
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


// --- Other Helpers ---
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read file as base64'));
        reader.readAsDataURL(file);
    });
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read blob as base64'));
        reader.readAsDataURL(blob);
    });
}

// --- Stripe Promise ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setFaceFile: (file: File | null) => void;
    setPlan: (plan: 'monthly' | 'yearly') => void;
    setGender: (gender: 'male' | 'female') => void;
    setSelectedStyleId: (id: string | null) => void;
    setCurrentStep: (step: number) => void;
    setClientSecret: (secret: string | null) => void;
    setIsScanning: (isScanning: boolean) => void;
    handleProceedToPayment: () => Promise<void>;
    handleGeneratePassport: () => Promise<void>;
    setShowPopup: (show: boolean) => void;
    router: NextRouter;
}

interface CheckoutAndFinalizeProps extends RegistrationFlowProps {
    setErrorMessage: (message: string | null) => void;
    setIsLoading: (loading: boolean) => void;
    setProgressMessage: (message: string | null) => void;
    setFinalPassport: (passport: { nickname: string; avatarUrl: string } | null) => void;
    setIsGenerated: (generated: boolean) => void;
}

// --- The Main Registration Component (Now Dumb) ---
const RegistrationFlow = ({
    // State
    email, password, faceFile, plan, gender, selectedStyleId, currentStep, clientSecret, isScanning,
    isLoading, progressMessage, errorMessage, isGenerated, showPopup, finalPassport, stylesToShow,

    // Setters
    setEmail, setPassword, setFaceFile, setPlan, setGender, setSelectedStyleId, setCurrentStep,
    setClientSecret, setIsScanning,

    // Handlers
    handleProceedToPayment, handleGeneratePassport,
    
    // Final Passport Popup
    setShowPopup, router
}: RegistrationFlowProps) => {
    return (
     <main className="relative flex flex-col items-center gap-16 bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.1)_100%)] text-white p-4">
       <GridWithRays />
        <div className="h-full flex fixed justify-between bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
         <img src="/BurjKalifa.png" alt="background" className="hidden lg:block object-cover opacity-100 pointer-events-none" />
         <img src="/Building2.png" alt="background" className="hidden lg:block mr-[-300px] lg:mr-[-200px] object-cover opacity-100 pointer-events-none" />
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
           <h2 className="">Step 1: Email & face scan</h2>
           <img src="/step1.png" alt="Step 1 visual" className="mb-6" />
         </div>
         <div className="flex flex-col gap-4 min-w-80 ">
           <Input placeholder="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={isLoading || currentStep > 1} />
           <Input placeholder="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} disabled={isLoading || currentStep > 1} />
         </div>
         <div className="aspect-video min-w-80 w-80 border border-main rounded-2xl relative bg-black flex flex-col justify-center items-center">
              {isScanning ? (
                 <FaceScanComponent onCapture={(file) => { setFaceFile(file); setIsScanning(false); }} onCancel={() => setIsScanning(false)} />
             ) : faceFile ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                     <Image src={URL.createObjectURL(faceFile)} alt="Captured face" width={200} height={200} className="rounded-lg object-cover"/>
                     <p className="mt-2 text-green-400 font-semibold">Face Captured!</p>
                      <MainButton variant="outline" className="mt-4" onClick={() => setIsScanning(true)} disabled={isLoading}>Rescan</MainButton>
                  </div>
             ) : (
                  <>
                     <img src="/mask.png" alt="Face scan mask" className="absolute inset-0 m-auto object-contain max-w-[80%] max-h-[80%] pointer-events-none" />
                     <MainButton className="z-10" onClick={() => setIsScanning(true)} disabled={!email || !password || isLoading}>Scan Your Face</MainButton>
                 </>
             )}
         </div>
         {faceFile && currentStep === 1 && (
             <MainButton variant="solid" onClick={handleProceedToPayment} disabled={isLoading}>
                 Continue to Payment
             </MainButton>
         )}
       </div>

       <div className="w-[120px] h-0 border-t border-gray-700 my-4"></div>

       {/* step2 */}
       <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 2 ? "opacity-100" : "opacity-40"}`}>
         <div className="flex flex-col items-center">
           <h2 className="">Step 2: Payment</h2>
           <img src="/step2.png" alt="Step 2 visual" className="mb-6" />
         </div>
         <PricingToggle onPlanChange={setPlan} disabled={isLoading || currentStep > 2} />
         <div className="min-w-80 w-80 p-4 bg-gray-900 rounded-lg">
              {clientSecret ? <PaymentElement onReady={() => { if(currentStep === 2) setCurrentStep(3)} } /> : <p className="text-center text-gray-400">Initializing...</p>}
         </div>
       </div>

       <div className="w-[120px] h-0 border-t border-gray-700 my-4"></div>

       {/* step3 */}
       <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 3 ? "opacity-100" : "opacity-40"}`}>
         <div className="flex flex-col items-center">
           <h2 className="">Step 3: Passport Generation</h2>
           <img src="/step3.png" alt="Step 3 visual" className="mb-6" />
         </div>
         <div className="flex gap-2">
           <MainButton variant={gender === 'male' ? "solid" : "outline"} onClick={() => setGender("male")}>Male</MainButton>
           <MainButton variant={gender === 'female' ? "solid" : "outline"} onClick={() => setGender("female")}>Female</MainButton>
         </div>
         <div className="w-80 grid grid-cols-3 gap-2">
             {stylesToShow.map((item: StyleItem) => (
                 <div key={item.id} onClick={() => setSelectedStyleId(item.id)} className={`relative cursor-pointer rounded-lg overflow-hidden transition ${selectedStyleId === item.id ? "ring-4 ring-yellow-400" : "ring-2 ring-transparent hover:ring-gray-500"}`}>
                     <Image src={item.src} width={100} height={100} alt={item.alt} className="object-cover" />
                      {selectedStyleId === item.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">✓</div></div>}
                 </div>
             ))}
         </div>
         <MainButton variant="solid" onClick={handleGeneratePassport} disabled={!selectedStyleId || isLoading || currentStep !== 3}>
             {isLoading ? "Processing..." : "Generate Passport"}
         </MainButton>
       </div>

       {/* --- Final Passport Popup --- */}
       {isGenerated && finalPassport && (
         <div className="fixed inset-0 z-50 overflow-hidden">
           <div className="absolute inset-0 bg-black/70" />
           <div className={`absolute bottom-0 left-0 w-full h-full bg-black flex flex-col items-center justify-center transform transition-transform duration-500 gap-6 ${showPopup ? "translate-y-0" : "translate-y-full"}`}>
             <h1 className="text-3xl font-bold">Your Passport is Ready!</h1>
             <div className="relative flex items-center justify-center">
                <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
                <Passport className="z-1" nickname={finalPassport.nickname} gender={gender} avatarUrl={finalPassport.avatarUrl} />
             </div>
             <MainButton variant="solid" onClick={() => router.push("/")}>Enter the City</MainButton>
           </div>
         </div>
       )}
     </main>
    );
}

// This new component will be wrapped in <Elements> and can use Stripe hooks
const CheckoutAndFinalize = (props: CheckoutAndFinalizeProps) => {
    const {
        email, password, faceFile, selectedStyleId, stylesToShow, clientSecret,
        setErrorMessage, setIsLoading, setProgressMessage, setFinalPassport,
        setIsGenerated, setClientSecret, setCurrentStep, isGenerated, router
    } = props;

    const stripe = useStripe();
    const elements = useElements();

    const finalizeRegistration = React.useCallback(async (idToken: string, selfieB64: string, styleB64: string, nickname: string) => {
        try {
            setProgressMessage('Generating your unique avatar...');
            const avatarUrl = await generateAvatar(selfieB64, styleB64);

            setProgressMessage('Finalizing passport...');
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify({ nickname, avatarUrl }),
            });

            setFinalPassport({ nickname, avatarUrl });
            setIsGenerated(true);

        } catch (err: unknown) {
            if (err instanceof Error) setErrorMessage(err.message);
            else setErrorMessage("An unknown error occurred during finalization.");
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    }, [setErrorMessage, setIsLoading, setIsGenerated, setProgressMessage, setFinalPassport]);

    useEffect(() => {
        if (!stripe) return;

        const handleRedirect = async () => {
            const secret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
            const savedStateJSON = sessionStorage.getItem('registrationState');

            if (secret && savedStateJSON) {
                setIsLoading(true);
                const savedState = JSON.parse(savedStateJSON);

                const { paymentIntent } = await stripe.retrievePaymentIntent(secret);
                if (paymentIntent?.status === 'succeeded') {
                    setCurrentStep(3);
                    setClientSecret(secret);
                    router.replace('/register2', undefined, { shallow: true });
                    await finalizeRegistration(savedState.idToken, savedState.selfieB64, savedState.styleB64, savedState.nickname);
                } else {
                    setErrorMessage("Payment was not successful after returning. Please try again.");
                    setIsLoading(false);
                }
                sessionStorage.removeItem('registrationState');
            }
        };
        handleRedirect();
    }, [stripe, router, setClientSecret, setCurrentStep, setErrorMessage, setIsLoading, finalizeRegistration]);

    const handleGeneratePassport = async () => {
        if (!stripe || !elements || !clientSecret || !selectedStyleId || !faceFile) {
            setErrorMessage("Please complete all previous steps.");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            setProgressMessage('Creating user account...');
            const cred = await registerClient(email, password);
            const idToken = await cred.user.getIdToken();

            setProgressMessage('Uploading face...');
            const uploadedFaceUrl = await uploadFileToStorage(faceFile!);

            setProgressMessage('Verifying uniqueness...');
            await checkFaceDuplicate({ imageUrl: uploadedFaceUrl, email });

            const selfieB64 = await fileToBase64(faceFile);
            const styleImg = stylesToShow.find((s: StyleItem) => s.id === selectedStyleId)!;
            const styleBlob = await fetch(styleImg.src).then(r => r.blob());
            const styleB64 = await blobToBase64(styleBlob);
            const nickname = email.split('@')[0];

            const stateToSave = { idToken, uploadedFaceUrl, selfieB64, styleB64, nickname };
            sessionStorage.setItem('registrationState', JSON.stringify(stateToSave));

            setProgressMessage('Confirming payment...');
            const { error } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: { return_url: `${window.location.origin}/register2` },
                redirect: 'if_required',
            });

            if (error) {
                sessionStorage.removeItem('registrationState');
                throw new Error(error.message || "An unexpected payment error occurred.");
            }

            sessionStorage.removeItem('registrationState');
            await finalizeRegistration(idToken, selfieB64, styleB64, nickname);

        } catch (err: unknown) {
            if (err instanceof Error) setErrorMessage(err.message);
            else setErrorMessage("An unknown error occurred");
            setIsLoading(false);
            setProgressMessage(null);
        }
    };

    useEffect(() => {
        if (isGenerated) {
            setTimeout(() => props.setShowPopup(true), 10);
        }
    }, [isGenerated, props.setShowPopup]);

    return <RegistrationFlow {...props} handleGeneratePassport={handleGeneratePassport} />;
}

// This is the main stateful component for the page
const Register2Page = () => {
    const router = useRouter();

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

    // --- Final Passport State ---
    const [isGenerated, setIsGenerated] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [finalPassport, setFinalPassport] = useState<{ nickname: string, avatarUrl: string } | null>(null);

    const stylesToShow = gender === "male" ? maleStyles : femaleStyles;

    // This effect runs on initial load to check for a redirect from Stripe
    // It must be in the top-level component to correctly set the initial state
    useEffect(() => {
        const secret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
        if (secret) {
            setClientSecret(secret);
            setCurrentStep(2); // Or 3, depending on where the user should land
        }
    }, []);

    const handleProceedToPayment = async () => {
        if (!email || !password || !faceFile) {
            setErrorMessage("Please fill in all details and capture your face.");
            return;
        }
        setIsLoading(true);
        setErrorMessage(null);
        try {
            setProgressMessage('Initializing payment...');
            const res = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create payment intent');

            setClientSecret(data.clientSecret);
            setCurrentStep(2);

        } catch (err: unknown) {
            if (err instanceof Error) setErrorMessage(err.message);
            else setErrorMessage("An unknown error occurred");
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    };

    const props = {
        email, password, faceFile, plan, gender, selectedStyleId, currentStep, clientSecret, isScanning,
        isLoading, progressMessage, errorMessage, isGenerated, showPopup, finalPassport, stylesToShow,
        setEmail, setPassword, setFaceFile, setPlan, setGender, setSelectedStyleId, setCurrentStep,
        setClientSecret, setIsScanning, setIsLoading, setErrorMessage, setProgressMessage,
        setIsGenerated, setShowPopup, setFinalPassport,
        handleProceedToPayment,
        handleGeneratePassport: async () => { }, // Placeholder, real one is in CheckoutAndFinalize
        router
    };

    const appearance = {
        theme: 'night',
        variables: {
            colorPrimary: '#fcd34d',
            colorBackground: '#1f2937',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '6px',
            colorTextPlaceholder: '#9ca3af',
        },
    } as const;

    // Render Step 1 if we are not processing a payment yet
    if (currentStep < 2) {
        return <RegistrationFlow {...props} />;
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
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }} key={clientSecret}>
            <CheckoutAndFinalize {...props} />
        </Elements>
    );
}

export default Register2Page;
