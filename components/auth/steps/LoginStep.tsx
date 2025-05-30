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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        value={localPassword} // Use local password for controlled input
        onChange={handlePasswordChange} 
        className="w-full rounded-md bg-neutral-800 px-4 py-3 text-lg text-white placeholder-gray-500 focus:border-main focus:ring-main"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-main py-3 text-lg font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-60"
      >
        {isLoading ? 'Processing…' : 'LOGIN'}
      </button>
    </form>
  );
} 