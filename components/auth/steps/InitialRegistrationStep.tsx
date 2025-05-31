import React from 'react';

interface InitialRegistrationStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFileSelect: (file: File) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  previewUrl: string | null;
  selectedFile: File | null;
}

export default function InitialRegistrationStep({
  email,
  onEmailChange,
  onPasswordChange,
  onFileSelect,
  onSubmit,
  isLoading,
  previewUrl,
  selectedFile,
}: InitialRegistrationStepProps) {
  const [localPassword, setLocalPassword] = React.useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPassword(e.target.value);
    onPasswordChange(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please upload a profile picture for face verification.'); // Or use a more integrated error display
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className=" text-dim_smoke font-semibold text-center ">Upload a clear selfie for face verification.</p>
      <div className="flex flex-row gap-6 w-full">
        <div className="flex flex-col w-full mb-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => onEmailChange(e.target.value)} 
            className="mb-3 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={localPassword}
            onChange={handlePasswordChange}
            className="mb-3 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className=" w-full rounded-full bg-main py-2 font-semibold text-black transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]"
          >
            {isLoading ? 'Processing…' : 'REGISTER & PROCEED TO PAYMENT'}
          </button>
        </div>
        <div className="flex flex-col items-center h-36 w-36 order-first aspect-square ">
          <label className="flex cursor-pointer h-full w-full items-center justify-center rounded-lg border-1 border-dim_smoke bg-neutral-900 overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" 
              disabled={isLoading}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl text-dim_smoke">+</span>
            )}
          </label>
        </div>
      </div>
    
    </form>
  );
} 