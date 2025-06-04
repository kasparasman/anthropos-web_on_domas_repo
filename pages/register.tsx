import { useEffect } from 'react'
import { useAuthModalManager } from '../contexts/AuthModalManagerContext'

export default function RegisterPage() {
  const { setMode } = useAuthModalManager()
  useEffect(() => {
    setMode('register')
  }, [setMode])

  return null
}
