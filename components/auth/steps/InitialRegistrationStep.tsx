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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-row gap-3">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => onEmailChange(e.target.value)} 
          className="w-full rounded-md bg-neutral-800 px-4 py-3 text-lg text-white placeholder-gray-500 focus:border-main focus:ring-main"
          disabled={isLoading}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={localPassword}
          onChange={handlePasswordChange} 
          className="w-full rounded-md bg-neutral-800 px-4 py-3 text-lg text-white placeholder-gray-500 focus:border-main focus:ring-main"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col items-center">
        <label className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-lg border-2 border-dim_smoke bg-neutral-900 mb-3 overflow-hidden">
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
        <p className="text-xs text-dim_smoke mb-3">Upload a clear selfie for face verification.</p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !selectedFile}
        className="w-full rounded-md bg-main py-3 text-lg font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-60"
      >
        {isLoading ? 'Processing…' : 'REGISTER & PROCEED TO PAYMENT'}
      </button>
    </form>
  );
} 