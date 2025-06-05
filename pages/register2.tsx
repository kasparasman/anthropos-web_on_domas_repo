import React, { useState, useRef, useEffect } from "react";
import Input from '@/components/UI/input';
import MainButton from '@/components/UI/button';
import PricingToggle from '@/components/UI/PricingToggle';
import Passport from '@/components/Passport';
import Image from "next/image";
import { useRouter } from "next/router";
import Benefits from "@/components/UI/benefits";
import GridWithRays from "@/components/GridWithRays";

type StyleItem = {
  id: string;
  src: string;
  alt: string;
};

const maleStyles: StyleItem[] = [
  { id: "m1", src: "/images/male1.jpg", alt: "Male Style 1" },
  { id: "m2", src: "/images/male2.jpg", alt: "Male Style 2" },
  { id: "m3", src: "/images/male3.jpg", alt: "Male Style 3" },
  { id: "m4", src: "/images/male4.jpg", alt: "Male Style 4" },
  { id: "m5", src: "/images/male5.jpg", alt: "Male Style 5" },
  { id: "m6", src: "/images/male6.jpg", alt: "Male Style 6" },
  { id: "m7", src: "/images/male7.jpg", alt: "Male Style 7" },
  { id: "m8", src: "/images/male8.jpg", alt: "Male Style 8" },
  { id: "m9", src: "/images/male9.jpg", alt: "Male Style 9" },
];

const femaleStyles: StyleItem[] = [
  { id: "f1", src: "/images/female1.jpg", alt: "Female Style 1" },
  { id: "f2", src: "/images/female2.jpg", alt: "Female Style 2" },
  { id: "f3", src: "/images/female3.jpg", alt: "Female Style 3" },
  { id: "f4", src: "/images/female4.jpg", alt: "Female Style 4" },
  { id: "f5", src: "/images/female5.jpg", alt: "Female Style 5" },
  { id: "f6", src: "/images/female6.jpg", alt: "Female Style 6" },
  { id: "f7", src: "/images/female7.jpg", alt: "Female Style 7" },
  { id: "f8", src: "/images/female8.jpg", alt: "Female Style 8" },
  { id: "f9", src: "/images/female9.jpg", alt: "Female Style 9" },
];

const Register2 = () => {
  const router = useRouter();

  // Track current registration step:
  const [currentStep, setCurrentStep] = useState(1);

  // Track "male" vs "female" tab:
  const [gender, setGender] = useState<"male" | "female">("male");

  // Track which specific style/image is selected (by id):
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Decide which styles array to render:
  const stylesToShow = gender === "male" ? maleStyles : femaleStyles;

  // Generating / generated states:
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Local state to trigger the slide-up animation:
  const [showPopup, setShowPopup] = useState(false);

  // Find the selected style's image metadata (if any)
  const selectedStyle =
    stylesToShow.find((item) => item.id === selectedId) || null;

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

  // 2) When generation completes, mount the popup (which will slide up)
  useEffect(() => {
    if (isGenerated) {
      // small timeout ensures that the popup div is in the DOM before we animate:
      setTimeout(() => setShowPopup(true), 10);
    }
  }, [isGenerated]);

  // Handler when "Generate Passport" is clicked
  const onGenerateClick = () => {
    if (!selectedId) {
      alert("Please select a style before generating your passport.");
      return;
    }

    // Enter "generating" state
    setIsGenerating(true);

    // Simulate a 2-second generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  return (
    <main className="relative flex flex-col items-center gap-16 bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.1)_100%)]">
      <GridWithRays />

      <div className="h-full flex fixed justify-between bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
        <img
          src="/BurjKalifa.png"
          alt="background"
          className="hidden lg:block object-cover opacity-100 pointer-events-none"
        />
        <img
          src="/Building2.png"
          alt="background"
          className="hidden lg:block mr-[-300px] object-cover opacity-100 pointer-events-none"
        />
      </div>

      <div className="flex flex-col items-center mt-10 gap-6">
        <h1>Become Anthropos Citizen!</h1>
        <div className="relative flex items-center justify-center">
          {/* Blurred circle (behind Passport) */}
          <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
          <Benefits
            className="absolute z-2 top-[-16px] right-[-50px]"
            text="Participation in Chat"
            delay="0s"
          />
          <Benefits
            className="absolute z-2 top-[40px] left-[-50px]"
            text="Anthropos Avatar"
            delay="0.3s"
          />
          <Benefits
            className="absolute z-2 top-[200px] right-[-40px]"
            text="Limitless knowledge"
            delay="0.6s"
          />

          {/* The Passport component */}
          <Passport
            className="z-1"
            nickname="John Doe"
            gender="male"
            avatarUrl="/default-avatar.svg"
          />
        </div>
      </div>

      {/* step1 */}
      <div
        className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${
          currentStep >= 1 ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="flex flex-col items-center">
          <h2 className="">Step 1: Email & face scan</h2>
          <img src="/step1.png" alt="Step 1 visual" className="mb-6" />
        </div>
        <div className="flex flex-col gap-4 min-w-80 ">
          <Input placeholder="Email" />
          <Input placeholder="Password" />
        </div>
        {/* face scan */}
        <div className="aspect-square min-w-80 border border-main rounded-2xl p-10 relative bg-black flex flex-col justify-center items-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-8 w-10 h-10 border-t-1 border-l-1 border-main rounded-tl-xl"></div>
            <div className="absolute top-8 right-8 w-10 h-10 border-t-1 border-r-1 border-main rounded-tr-xl"></div>
            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-1 border-l-1 border-main rounded-bl-xl"></div>
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-1 border-r-1 border-main rounded-br-xl"></div>
          </div>
          <img
            src="/mask.png" // Placeholder path, adjust as needed
            alt="Face scan mask"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain max-w-[80%] max-h-[80%] pointer-events-none"
          />
          <MainButton className="z-1" onClick={() => setCurrentStep(2)}>
            Scan your face
          </MainButton>
        </div>
      </div>

      <div className="flex flex-row justify-center items-center gap-3">
        {/* Line 1 */}
        <div className="w-[120px] h-0 border-t border-smoke border-solid"></div>
        {/* Lock_alt_light (Component Instance) - Placeholder */}
        <div className="flex flex-row justify-center items-center w-10.5 h-10.5 p-0.5 rounded-[100px] bg-[rgba(255,255,255,0.2)]">
          <img src="/lock.png" alt="Lock icon" className="w-full h-full object-contain" />
        </div>
        {/* Line 2 */}
        <div className="w-[120px] h-0 border-t border-smoke border-solid"></div>
      </div>

      {/* step2 */}
      <div
        className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${
          currentStep >= 2 ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="flex flex-col items-center">
          <h2 className="">Step 2: Payment</h2>
          <img src="/step2.png" alt="Step 2 visual" className="mb-6" />
        </div>
        <PricingToggle />
        {/* default payment ELEMENT from stripe */}
        <MainButton variant="solid" className="" onClick={() => setCurrentStep(3)}>
          Pay
        </MainButton>
      </div>

      <div className="flex flex-row justify-center items-center gap-3">
        {/* Line 1 */}
        <div className="w-[120px] h-0 border-t border-smoke border-solid"></div>
        {/* Lock_alt_light (Component Instance) - Placeholder */}
        <div className="flex flex-row justify-center items-center w-10.5 h-10.5 p-0.5 rounded-[100px] bg-[rgba(255,255,255,0.2)]">
          <img src="/lock.png" alt="Lock icon" className="w-full h-full object-contain" />
        </div>
        {/* Line 2 */}
        <div className="w-[120px] h-0 border-t border-smoke border-solid"></div>
      </div>

      {/* step3 */}
      <div
        className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${
          currentStep >= 3 ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="flex flex-col items-center">
          <h2 className="">Step 3: Passport Generation</h2>
          <img src="/step3.png" alt="Step 3 visual" className="mb-6" />
        </div>

        {/* 2) Pill-style toggle */}
        <div className="flex gap-2">
          {/* Male Button */}
          <MainButton
            variant="outline"
            onClick={() => {
              setGender("male");
              setSelectedId(null); // reset selection when switching
            }}
            className={
              gender === "male"
                ? "border-main text-main"
                : "border-white text-white hover:bg-white/10"
            }
          >
            Male
          </MainButton>

          {/* Female Button */}
          <MainButton
            variant="outline"
            onClick={() => {
              setGender("female");
              setSelectedId(null);
            }}
            className={
              gender === "female"
                ? "border-main text-main"
                : "border-white text-white hover:bg-white/10"
            }
          >
            Female
          </MainButton>
        </div>

        <div className="flex justify-center max-w-80">
          <div className="grid grid-cols-3 gap-3">
            {stylesToShow.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`relative w-full h-full cursor-pointer overflow-hidden rounded-lg transition ${
                    isSelected
                      ? "ring-4 ring-[#FFD789]"
                      : "ring-2 ring-transparent hover:ring-gray-300/50"
                  }`}
                >
                  <Image
                    src={item.src}
                    width={320}
                    height={320}
                    alt={item.alt}
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-[#FFD789]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <MainButton
          variant="solid"
          className="mb-10"
          onClick={onGenerateClick}
          disabled={currentStep < 3}
        >
          Generate Passport
        </MainButton>
      </div>

      {/**
       * 7) FULL-SCREEN SLIDE-UP POPUP
       *    Mounts once isGenerated===true, initially off-screen (translate-y-full),
       *    then slides up (translate-y-0).
       */}
      {isGenerated && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* slide-up container */}
          <div
            className={`absolute bottom-0 left-0 w-full h-full bg-black flex flex-col items-center justify-center transform transition-transform duration-500 gap-4 ${
              showPopup ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <h1 className="">Your Passport</h1>

            {selectedStyle && (
              <div className="flex flex-col items-center w-auto h-auto overflow-hidden ">
                <div className="relative flex items-center justify-center">
                  {/* Blurred circle (behind Passport) */}
                  <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
                  {/* The Passport component */}
                  <Passport
                    className="z-1"
                    nickname="John Doe"
                    gender="male"
                    avatarUrl="/default-avatar.svg"
                  />
                </div>
              </div>
            )}

            <MainButton
              variant="solid"
              className=""
              onClick={() => {
                router.push("/");
              }}
            >
              Enter City
            </MainButton>
          </div>
        </div>
      )}
    </main>
  );
};

export default Register2;
