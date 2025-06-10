'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface RegistrationStatusState {
  isRegistrationInProgress: boolean
  setRegistrationInProgress: (inProgress: boolean) => void
}

const RegistrationStatusContext = createContext<RegistrationStatusState | null>(null)

export function RegistrationStatusProvider({ children }: { children: ReactNode }) {
  const [isRegistrationInProgress, setIsRegistrationInProgress] = useState(false)

  const setRegistrationInProgress = (inProgress: boolean) => {
    console.log('[RegistrationStatus] Setting registration in progress:', inProgress)
    setIsRegistrationInProgress(inProgress)
  }

  return (
    <RegistrationStatusContext.Provider 
      value={{ isRegistrationInProgress, setRegistrationInProgress }}
    >
      {children}
    </RegistrationStatusContext.Provider>
  )
}

export function useRegistrationStatus() {
  const context = useContext(RegistrationStatusContext)
  if (!context) {
    throw new Error('useRegistrationStatus must be used within RegistrationStatusProvider')
  }
  return context
} 