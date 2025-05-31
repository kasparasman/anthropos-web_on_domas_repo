import React from 'react';

interface LoginStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => Promise<void>; // Or Promise<boolean> if it indicates success/failure for UI
  isLoading: boolean;
  // error: string | null; // Error display can be handled by AuthModal or here
}

export default function LoginStep({
  email,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isLoading,
}: LoginStepProps) {
  // Local password state if not lifted higher and only used for this form submission
  const [localPassword, setLocalPassword] = React.useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPassword(e.target.value);
    onPasswordChange(e.target.value); // Also update parent/hook if needed elsewhere
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
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
        value={localPassword} // Use local password for controlled input
        onChange={handlePasswordChange} 
        className="mb-3 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mb-2 w-full rounded-md bg-main py-2 font-semibold text-black transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]"
      >
        {isLoading ? 'Processing…' : 'LOGIN'}
      </button>
    </form>
  );
} 