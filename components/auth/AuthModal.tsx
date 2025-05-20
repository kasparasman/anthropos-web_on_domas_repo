// components/auth/AuthModal.tsx
'use client'

import { useState } from 'react'
import { signInClient, registerClient } from '../../lib/firebase-client'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSignInSuccess?: () => void
  onSignUpSuccess?: () => void
}

export default function AuthModal({
  open,
  onClose,
  onSignInSuccess,
  onSignUpSuccess
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl mb-4">
          {mode === 'login' ? 'Sign In' : 'Register'}
        </h2>
        
        {error && (
          <p className="mb-2 text-red-500 text-sm">{error}</p>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-2 px-2 py-1 border rounded"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-2 py-1 border rounded"
        />
        
        <button
          onClick={async () => {
            setError(null)
            try {
              if (mode === 'register') {
                await registerClient(email, password)
                onSignUpSuccess?.()
              } else {
                await signInClient(email, password)
                onSignInSuccess?.()
              }
              onClose()
            } catch (err: any) {
              setError(err.message)
            }
          }}
          className="w-full mb-2 px-2 py-1 bg-blue-600 text-white rounded"
        >
          {mode === 'login' ? 'Sign In' : 'Register'}
        </button>
        
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-sm text-blue-600"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign In'}
        </button>
        
        <button
          onClick={onClose}
          className="w-full mt-2 px-2 py-1 text-center text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}