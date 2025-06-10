import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAvatarGeneration } from '@/lib/hooks/useAvatarGeneration'; // Adjusted path

interface AvatarNicknameStepProps {
  initialFaceUrl: string | null; // From useAuthModalManager.state.tmpFaceUrl
  currentStyles: Array<{ img: string; styleRef: string; label: string }>; // Male or Female styles
  onGenderChange: (gender: 'male' | 'female') => void;
  selectedGender: 'male' | 'female';
  onSubmitFinalProfile: (avatarCdnUrl: string, nickname: string) => Promise<void>; // Calls handleFinalProfileUpdate from useAuthModalManager
  isLoadingFromParent: boolean; // Overall loading state from useAuthModalManager
}

export default function AvatarNicknameStep({
  initialFaceUrl,
  currentStyles,
  onGenderChange,
  selectedGender,
  onSubmitFinalProfile,
  isLoadingFromParent,
}: AvatarNicknameStepProps) {
  const {
    state: avatarState,
    generateAvatarAndNickname,
    resetAvatarGenerationState,
  } = useAvatarGeneration();

  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number | null>(null);
  const [customNickname, setCustomNickname] = useState('');
  const [avatarSourceFile, setAvatarSourceFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // If the parent provided an initial face URL and no new file is selected for avatar,
    // and the avatar state doesn't have a generated URL yet, set it as the preview.
    // This is mostly for displaying the *source* if user wants to use the initial face scan.
    if (initialFaceUrl && !avatarSourceFile && !avatarState.generatedAvatarUrl) {
      // setAvatarPreviewUrl(initialFaceUrl); // Potentially show the initial scan as preview
    }
    // Cleanup for avatarPreviewUrl if it's an object URL
    return () => {
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [initialFaceUrl, avatarSourceFile, avatarState.generatedAvatarUrl, avatarPreviewUrl]);

  useEffect(() => {
    // When avatar generation provides a nickname, pre-fill the input
    if (avatarState.nickname) {
      setCustomNickname(avatarState.nickname);
    }
  }, [avatarState.nickname]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarSourceFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreviewUrl(url);
      resetAvatarGenerationState(); // Reset if a new file is chosen
    }
  };

  const handleGenerateClick = () => {
    if (selectedStyleIndex === null) {
      alert('Please select a style.');
      return;
    }
    const styleRefUrl = currentStyles[selectedStyleIndex]?.styleRef;
    if (!styleRefUrl) {
      alert('Selected style is invalid.');
      return;
    }
    // Use avatarSourceFile if provided, otherwise fall back to initialFaceUrl from props
    // Pass selectedGender to the hook
    generateAvatarAndNickname(avatarSourceFile, initialFaceUrl, styleRefUrl, selectedGender);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarState.finalCdnUrl || !customNickname) {
      alert('Avatar must be generated and nickname provided.');
      return;
    }
    await onSubmitFinalProfile(avatarState.finalCdnUrl, customNickname);
  };
  
  const displayAvatarUrl = avatarState.generatedAvatarUrl || avatarPreviewUrl || initialFaceUrl;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-center text-white mb-0">Payment Successful! Now, let&apos;s set up your avatar and nickname.</p>
      
      {/* Gender Selection (example) */}
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => onGenderChange('male')} className={`px-4 py-2 rounded ${selectedGender === 'male' ? 'bg-main text-black' : 'bg-neutral-700 text-white'}`}>Male Styles</button>
        <button type="button" onClick={() => onGenderChange('female')} className={`px-4 py-2 rounded ${selectedGender === 'female' ? 'bg-main text-black' : 'bg-neutral-700 text-white'}`}>Female Styles</button>
      </div>

      {/* Avatar Source & Generation */}
      <div className="flex flex-col items-center gap-4 p-4 border border-gray-700 rounded-lg">
        <div className="text-lg font-semibold text-white">1. Choose Your Avatar Style</div>

        {/* Image Preview Area */}
        <div className="w-40 h-40 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden mb-2">
          {displayAvatarUrl ? (
            <Image src={displayAvatarUrl} alt="Avatar Preview" width={160} height={160} className="object-cover w-full h-full" />
          ) : (
            <span className="text-neutral-500 text-sm">Style Preview</span>
          )}
        </div>

        {/* Optional: New File for Avatar (if different from initial scan) */}
        <label className="text-sm text-gray-400">
          Or upload a new photo for the avatar (optional):
          <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main file:text-black hover:file:bg-yellow-400" />
        </label>

        {/* Style Selection Grid */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-md">
          {currentStyles.map((style, index) => (
            <button 
              type="button" 
              key={index} 
              onClick={() => setSelectedStyleIndex(index)} 
              className={`aspect-square rounded-md overflow-hidden border-2 ${selectedStyleIndex === index ? 'border-main ring-2 ring-main' : 'border-transparent hover:border-gray-500'}`}
            >
              <Image src={style.img} alt={style.label} width={80} height={80} className="object-cover w-full h-full" title={style.label}/>
            </button>
          ))}
        </div>

        <button 
          type="button"
          onClick={handleGenerateClick}
          disabled={avatarState.isLoading || isLoadingFromParent || selectedStyleIndex === null || (!avatarSourceFile && !initialFaceUrl)}
          className="w-full md:w-auto rounded-md bg-blue-600 py-2 px-6 text-base font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {avatarState.isLoading ? avatarState.streamingProgress || 'Generating…' : 'Generate Avatar with Selected Style'}
        </button>
        {avatarState.error && <p className="text-sm text-red-500">Error: {avatarState.error}</p>}
      </div>

      {/* Nickname Input */}
      <div className="flex flex-col items-center gap-2 p-4 border border-gray-700 rounded-lg">
        <label htmlFor="nickname" className="text-lg font-semibold text-white">2. Your Generated Nickname</label>
        <input 
          id="nickname"
          type="text" 
          placeholder="Nickname will appear here..." 
          value={customNickname} // This will be updated from avatarState.nickname
          readOnly // Make the input read-only
          className="w-full max-w-xs rounded-md bg-neutral-700 px-4 py-3 text-lg text-white placeholder-gray-500 focus:border-main focus:ring-main cursor-default"
          disabled={avatarState.isLoading || isLoadingFromParent} // Keep disabled logic for consistency
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={avatarState.isLoading || isLoadingFromParent || !avatarState.finalCdnUrl || !customNickname}
        className="w-full rounded-md bg-main py-3 text-lg font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-50"
      >
        {isLoadingFromParent || avatarState.isLoading ? 'Processing…' : 'Complete Profile Setup'}
      </button>
    </form>
  );
} 