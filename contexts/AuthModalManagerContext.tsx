'use client'

import React, { createContext, useContext } from 'react';
import { useAuthModalManager as useAuthModalManagerHook, AuthStep } from '@/lib/hooks/useAuthModalManager'; // Adjust path as needed

// Define the shape of the context value
// This should mirror the return type of useAuthModalManagerHook
interface AuthModalManagerContextType extends ReturnType<typeof useAuthModalManagerHook> {}

const AuthModalManagerContext = createContext<AuthModalManagerContextType | null>(null);

export function AuthModalManagerProvider({ children }: { children: React.ReactNode }) {
  const authModalManager = useAuthModalManagerHook();
  return (
    <AuthModalManagerContext.Provider value={authModalManager}>
      {children}
    </AuthModalManagerContext.Provider>
  );
}

export function useAuthModalManager(): AuthModalManagerContextType {
  const context = useContext(AuthModalManagerContext);
  if (!context) {
    throw new Error('useAuthModalManager must be used within an AuthModalManagerProvider');
  }
  return context;
}

// Re-export AuthStep for convenience if needed by consumers of this context
export { AuthStep }; 