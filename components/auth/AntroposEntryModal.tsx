import React, { useState, createContext, useContext, ReactNode } from 'react';
import IdentityProtocolStep from './antropos_entry_steps/IdentityProtocolStep';
// Future steps:
// import AllegianceStep from './antropos_entry_steps/AllegianceStep';
// import AvatarManifestationStep from './antropos_entry_steps/AvatarManifestationStep';

export type AntroposEntryStep = 'identity' | 'allegiance' | 'manifestation';

// Define the shape of the registration data
export interface AntroposEntryData {
  email?: string;
  password?: string;
  faceImageFile?: File; // For direct upload
  faceScanUrl?: string; // For camera scan result stored temporarily
  tmpFaceUrl?: string; // URL of face image in S3/temp storage, used for Rekognition & avatar source
  rekognitionFaceId?: string;
  selectedPlanId?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  avatarStyleRef?: string;
  finalAvatarCdnUrl?: string;
  nickname?: string;
}

// Define the shape of the context
interface AntroposEntryContextType {
  currentStep: AntroposEntryStep;
  entryData: AntroposEntryData;
  navigateToStep: (step: AntroposEntryStep) => void;
  updateEntryData: (data: Partial<AntroposEntryData>) => void;
  resetEntryProcess: () => void;
}

const AntroposEntryContext = createContext<AntroposEntryContextType | undefined>(
  undefined
);

export const useAntroposEntry = () => {
  const context = useContext(AntroposEntryContext);
  if (!context) {
    throw new Error(
      'useAntroposEntry must be used within an AntroposEntryProvider'
    );
  }
  return context;
};

interface AntroposEntryModalProps {
  isOpen: boolean;
  onClose: () => void; // Adheres to strict single-modal UI: closable only via X button
}

const STEP_SEQUENCE: AntroposEntryStep[] = ['identity', 'allegiance', 'manifestation'];

export default function AntroposEntryModal({
  isOpen,
  onClose,
}: AntroposEntryModalProps) {
  const [currentStep, setCurrentStep] = useState<AntroposEntryStep>('identity');
  const [entryData, setEntryData] = useState<AntroposEntryData>({});

  const navigateToStep = (step: AntroposEntryStep) => {
    setCurrentStep(step);
  };

  const updateEntryData = (data: Partial<AntroposEntryData>) => {
    setEntryData((prev) => ({ ...prev, ...data }));
  };

  const resetEntryProcess = () => {
    setCurrentStep('identity');
    setEntryData({});
    onClose(); // Close the modal on reset as well, or just reset data?
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'identity':
        return <IdentityProtocolStep />;
      // case 'allegiance':
      //   return <AllegianceStep />;
      // case 'manifestation':
      //   return <AvatarManifestationStep />;
      default:
        return <p className="text-center text-red-500">Invalid step.</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <AntroposEntryContext.Provider
      value={{
        currentStep,
        entryData,
        navigateToStep,
        updateEntryData,
        resetEntryProcess,
      }}
    >
      <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4">
        <div className="bg-black border-2 border-yellow-500/70 shadow-2xl shadow-yellow-500/40 rounded-xl p-6 md:p-8 w-full max-w-lg md:max-w-xl lg:max-w-2xl relative transform transition-all duration-300 ease-out scale-100 opacity-100">
          {/* Close Button - Adhering to strict single-modal UI */}
          <button
            onClick={onClose} // Directly use onClose, modal doesn't self-close other than this
            className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-main transition-colors z-10"
            aria-label="Close Entry Process"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center text-main mb-2">Enter Antropos City</h1>
          <p className="text-center text-neutral-400 mb-6 md:mb-8 text-sm md:text-base">Secure your identity and manifest your digital self.</p>

          {/* Stepper UI Placeholder - To be implemented */}
          <div className="mb-6 md:mb-8">
            {/* Example Stepper - Replace with actual component */}
            <div className="flex justify-between items-center max-w-md mx-auto px-2">
              {STEP_SEQUENCE.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = step === currentStep;
                const isCompleted = STEP_SEQUENCE.indexOf(currentStep) > index;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-main bg-main/20' : isCompleted ? 'border-green-500 bg-green-500/20' : 'border-neutral-700 bg-neutral-800'} transition-all duration-300`}
                      >
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className={`${isActive ? 'text-main font-semibold' : 'text-neutral-500'}`}>{stepNumber}</span>
                        )}
                      </div>
                      <span className={`mt-1 md:mt-2 text-xs md:text-sm capitalize ${isActive ? 'text-main font-semibold' : isCompleted? 'text-green-400' : 'text-neutral-500'}`}>
                        {step}
                      </span>
                    </div>
                    {index < STEP_SEQUENCE.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 md:mx-3 ${isCompleted ? 'bg-green-500' : 'bg-neutral-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="min-h-[300px]"> {/* Min height for content area to avoid layout jumps */}
            {renderStepContent()}
          </div>

        </div>
      </div>
    </AntroposEntryContext.Provider>
  );
} 