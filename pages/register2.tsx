import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// --- UI Components ---
import Input from '@/components/UI/input';
import MainButton from '@/components/UI/button';
import PricingToggle from '@/components/UI/PricingToggle';
import Passport from '@/components/Passport';
import FaceScanComponent from "@/components/faceScan/FaceScanComponent";

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
        // Return a random male avatar as a placeholder
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

// --- The Main Registration Component ---
const RegistrationFlow = () => {
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();

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

    // --- Step 1 -> 2: Initialize Payment ---
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
    
    // --- Effect to handle Stripe redirect and continue the process ---
    useEffect(() => {
        const handleRedirect = async () => {
            if (!stripe) return;
            const secret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
            const savedStateJSON = sessionStorage.getItem('registrationState');

            if (secret && savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                
                // Restore state
                setEmail(savedState.email);
                setFaceFile(savedState.faceFile); // Note: This isn't a real File object, see handleGeneratePassport
                setSelectedStyleId(savedState.selectedStyleId);

                const { paymentIntent } = await stripe.retrievePaymentIntent(secret);
                if (paymentIntent?.status === 'succeeded') {
                    // Clean up session storage and URL
                    sessionStorage.removeItem('registrationState');
                    router.replace('/register2', undefined, { shallow: true });
                    // Re-trigger the finalization process
                    await finalizeRegistration(savedState.idToken, savedState.uploadedFaceUrl);
                } else {
                    setErrorMessage("Payment was not successful after returning. Please try again.");
                }
            }
        };
        handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stripe]);


    // --- Finalization Logic (can be called from two places) ---
    const finalizeRegistration = async (idToken: string, uploadedFaceUrl: string) => {
        try {
            setProgressMessage('Generating your unique avatar...');
            // We need to re-create the base64 from the file for avatar gen
            const selfieB64 = await fileToBase64(faceFile!);
            const styleImg = stylesToShow.find(s => s.id === selectedStyleId)!;
            const styleBlob = await fetch(styleImg.src).then(r => r.blob());
            const styleB64 = await blobToBase64(styleBlob);
            const avatarUrl = await generateAvatar(selfieB64, styleB64);
            
            const tempNickname = email.split('@')[0]; // Simple nickname generation

            setProgressMessage('Finalizing passport...');
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify({ nickname: tempNickname, avatarUrl }),
            });

            setFinalPassport({ nickname: tempNickname, avatarUrl });
            setIsGenerated(true);

        } catch (err: unknown) {
            if (err instanceof Error) setErrorMessage(err.message);
            else setErrorMessage("An unknown error occurred during finalization.");
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    }


    // --- Main "Generate Passport" Handler ---
    const handleGeneratePassport = async () => {
        if (!stripe || !elements || !clientSecret || !selectedStyleId) {
            setErrorMessage("Please select a style first.");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            // --- Phase 1: Pre-payment checks ---
            setProgressMessage('Creating user account...');
            const cred = await registerClient(email, password);
            const idToken = await cred.user.getIdToken();

            setProgressMessage('Uploading face...');
            const uploadedFaceUrl = await uploadFileToStorage(faceFile!);

            setProgressMessage('Verifying uniqueness...');
            await checkFaceDuplicate({ imageUrl: uploadedFaceUrl, email });

             // --- Phase 2: Payment Confirmation (with state saving for redirect) ---
            const stateToSave = {
                email,
                idToken,
                uploadedFaceUrl,
                selectedStyleId,
                // We can't save the File object directly, but we have it in state
            };
            sessionStorage.setItem('registrationState', JSON.stringify(stateToSave));

            setProgressMessage('Confirming payment...');
            const { error } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: { return_url: `${window.location.origin}/register2` },
                redirect: 'if_required',
            });

            if (error) {
                // This will only be triggered if the payment fails without a redirect
                throw new Error(error.message || "An unexpected payment error occurred.");
            }

            // --- Phase 3: Post-payment finalization (if no redirect happened) ---
            sessionStorage.removeItem('registrationState'); // Clean up state if we didn't redirect
            await finalizeRegistration(idToken, uploadedFaceUrl);

        } catch (err: unknown) {
            if (err instanceof Error) setErrorMessage(err.message);
            else setErrorMessage("An unknown error occurred");
            setIsLoading(false);
            setProgressMessage(null);
        }
    };
    
    useEffect(() => {
        if (isGenerated) {
            setTimeout(() => setShowPopup(true), 10);
        }
    }, [isGenerated]);

    return (
        <main className="relative flex flex-col items-center p-4 md:p-6 bg-black gap-12 text-white">
            <div className="flex flex-col items-center gap-6 text-center">
                <h1 className="text-3xl font-bold">Become Anthropos Citizen!</h1>
                <Passport nickname="John Doe" gender="male" avatarUrl="/default-avatar.svg" />
            </div>

            {isLoading && progressMessage && <div className="text-yellow-400">{progressMessage}</div>}
            {errorMessage && <div className="text-red-500 bg-red-900/50 p-3 rounded-lg max-w-md text-center">{errorMessage}</div>}

            {/* --- Step 1: Email & Face Scan --- */}
            <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-semibold">Step 1: Your Details</h2>
                     <img src="/step1.png" alt="Step 1 visual" className="mb-6 w-48" />
                </div>
                <div className="flex flex-col gap-4 min-w-80">
                    <Input placeholder="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={isLoading || currentStep > 1} />
                    <Input placeholder="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} disabled={isLoading || currentStep > 1} />
                </div>
                <div className="aspect-square min-w-80 w-80 h-80 border border-main rounded-2xl relative bg-black flex flex-col justify-center items-center">
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

            {/* --- Step 2: Payment --- */}
            <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-semibold">Step 2: Payment</h2>
                    <img src="/step2.png" alt="Step 2 visual" className="mb-6 w-48" />
                </div>
                <PricingToggle onPlanChange={setPlan} disabled={isLoading || currentStep !== 2} />
                <div className="min-w-80 w-80 p-4 bg-gray-900 rounded-lg">
                    {clientSecret ? <PaymentElement onReady={() => setCurrentStep(3)} /> : <p className="text-center text-gray-400">Initializing...</p>}
                </div>
            </div>

            <div className="w-[120px] h-0 border-t border-gray-700 my-4"></div>

            {/* --- Step 3: Passport Generation --- */}
            <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <div className="flex flex-col items-center">
                     <h2 className="text-xl font-semibold">Step 3: Choose Your Style</h2>
                    <img src="/step3.png" alt="Step 3 visual" className="mb-6 w-48" />
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
                        <Passport nickname={finalPassport.nickname} gender={gender} avatarUrl={finalPassport.avatarUrl} />
                        <MainButton variant="solid" onClick={() => router.push("/")}>Enter the City</MainButton>
                    </div>
                </div>
            )}
        </main>
    );
}

// Wrapper component to provide Stripe context
const Register2 = () => {
    return (
        <Elements stripe={stripePromise}>
            <RegistrationFlow />
        </Elements>
    );
}

export default Register2; 