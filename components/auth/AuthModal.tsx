'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { signIn } from 'next-auth/react'
import { signInClient, registerClient } from '../../lib/firebase-client'
import { uploadAvatar } from '../../lib/uploadAvatar'

interface AuthModalProps { open: boolean; onClose: () => void }

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  /* basic fields */
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  /* avatar flow */
  const [file, setFile] = useState<File | null>(null)
  const [origUrl, setOrigUrl] = useState<string | null>(null)
  const [tmpAvatarUrl, setTmpAvatarUrl] = useState<string | null>(null)
  const [tmpFaceUrl, setTmpFaceUrl] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  /* body scroll lock */
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  if (!open) return null

  /* ------- avatar + nickname generation handler ------- */
  async function handleGenerate() {
    if (!file) return
    setLoading(true); setError(null)
    try {
      /* 1.  direct PUT to R2 /tmp/original */
      const orig = await uploadAvatar(file)
      setOrigUrl(orig)
      setTmpFaceUrl(orig)

      // 🚀 DEV BYPASS: Skip expensive LightX calls during rekognition development
      const isDev = process.env.NODE_ENV === 'development'
      const skipAvatarGen = process.env.NEXT_PUBLIC_SKIP_AVATAR_GEN === 'true'
      
      if (isDev && skipAvatarGen) {
        console.log('[AuthModal] 🚀 DEV MODE: Skipping avatar generation and nickname API calls')
        
        // Use original image as "generated" avatar for dev
        setTmpAvatarUrl(orig)
        
        // Use a simple dev nickname
        const devNickname = `dev_${email.split('@')[0]}_${Date.now().toString().slice(-4)}`
        setNickname(devNickname)
        
        console.log('[AuthModal] 🚀 DEV MODE: Using dev avatar and nickname:', { 
          avatar: orig, 
          nickname: devNickname 
        })
      } else {
        console.log('[AuthModal] Production mode: Running full avatar generation')
        
        /* 2.  call our avatar-gen route (LightX) */
        const { tmpAvatarUrl } = await fetch('/api/avatar-gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceUrl: orig }),
        }).then(r => r.json())
        setTmpAvatarUrl(tmpAvatarUrl)

        /* 3.  get nickname */
        const { nickname } = await fetch('/api/nickname', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: tmpAvatarUrl }),
        }).then(r => r.json())
        setNickname(nickname)
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed')
    } finally { setLoading(false) }
  }

  /* ------- submit (sign in / register) ---------------- */
  async function submit() {
    try {
      setLoading(true)
      setError(null)
    
      if (mode === 'register') {
        console.log('[AuthModal] Starting registration flow')
        
        // STEP 1: Check face duplicate BEFORE creating Firebase user
        if (tmpFaceUrl) {
          console.log('[AuthModal] Checking face duplicate before user creation')
          try {
            const faceCheckResponse = await fetch('/api/check-face-duplicate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                imageUrl: tmpFaceUrl,
                email: email 
              }),
            })
            
            const faceCheckResult = await faceCheckResponse.json()
            
            if (!faceCheckResponse.ok) {
              if (faceCheckResult.error === 'FACE_DUPLICATE') {
                setError('This face already exists in our system. If you believe this is an error, contact support.')
                return
              }
              throw new Error(faceCheckResult.error || 'Face check failed')
            }
            
            console.log('[AuthModal] Face check passed - no duplicates found')
          } catch (faceError: any) {
            console.error('[AuthModal] Face check failed:', faceError.message)
            setError(faceError.message || 'Face verification failed')
            return
          }
        }
        
        // STEP 2: Only now create Firebase user (face check passed)
        console.log('[AuthModal] Creating Firebase user (face check passed)')
        const cred = await registerClient(email, password)
        const firebaseUser = cred.user
        console.log('[AuthModal] Firebase user created:', firebaseUser.uid)
        
        const idToken = await firebaseUser.getIdToken()
        console.log('[AuthModal] Got Firebase ID token')

        // STEP 3: Create profile (we know face is unique)
        const result = await signIn('credentials', {
          idToken,
          tmpAvatarUrl: tmpAvatarUrl ?? '',
          tmpFaceUrl: tmpFaceUrl ?? '',  // Still pass this for final indexing
          nickname,
          redirect: false,
        })
        
        console.log('[AuthModal] signIn result:', result)
        
        // Handle other possible errors (not face duplicate)
        if (result?.error === 'AccountBanned' || result?.error === 'ACCOUNT_BANNED') {
          console.log('[AuthModal] Account banned')
          setError('This account has been permanently suspended.')
          return
        }
        if (result?.error === 'EMAIL_ALREADY_IN_USE') {
          console.log('[AuthModal] Email already in use')
          setError('This email is already registered. Please use a different email or try logging in.')
          return
        }
        if (result?.error === 'NICKNAME_ALREADY_IN_USE') {
          console.log('[AuthModal] Nickname already in use')
          setError('This nickname is already taken. Please choose a different one.')
          return
        }
        if (result?.error) {
          console.log('[AuthModal] Other error:', result.error)
          throw new Error(result.error)
        }
        
        // Success!
        if (!result?.error) {
          console.log('[AuthModal] Registration successful!')
          onClose()
        }
    
      } else {                           // ────── LOGIN ──────
        console.log('[AuthModal] Starting login flow')
        const cred    = await signInClient(email, password)   // firebase
        const idToken = await cred.user.getIdToken()
    
        const result  = await signIn('credentials', {
          idToken,
          redirect: false,
        })
    
        if (result?.error === 'AccountBanned' || result?.error === 'ACCOUNT_BANNED') {
          setError('This account has been permanently suspended.')
          return
        }
        if (result?.error) throw new Error(result.error)
        
        // Only close modal if no errors
        if (!result?.error) {
          onClose()
        }
      }
    
    } catch (e: any) {
      console.error('[AuthModal] Submit error:', e.message)
      setError(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }
  /* --------------------------- UI --------------------------- */
  return (
    <Dialog as={Fragment} open={open}
            onClose={loading ? () => {} : onClose}
            initialFocus={cancelRef}>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />
        <div onClick={e=>e.stopPropagation()}
             className="relative z-10 w-80 rounded bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-semibold">
            {mode === 'login' ? 'Sign In' : 'Register'}
          </h2>

          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

          {mode === 'register' && (
            <>
              <input type="file" accept="image/*"
                     onChange={(e)=>setFile(e.target.files?.[0]||null)}
                     className="mb-2 w-full text-sm"/>

              <button
                disabled={!file || loading}
                onClick={handleGenerate}
                className="mb-2 w-full rounded bg-amber-500 py-1 text-white disabled:opacity-60">
                {loading ? 'Generating…' : 'Generate Avatar & Nickname'}
              </button>

              {tmpAvatarUrl && (
                <img src={tmpAvatarUrl} alt="avatar"
                     className="mx-auto mb-2 h-24 w-24 rounded-full object-cover"/>
              )}

              <input readOnly
                     value={nickname}
                     placeholder="Nickname"
                     className="mb-4 w-full rounded border bg-gray-100 px-2 py-1"/>
            </>
          )}

          <input type="email" placeholder="Email" value={email}
                 onChange={e=>setEmail(e.target.value)}
                 className="mb-2 w-full rounded border px-2 py-1"/>
          <input type="password" placeholder="Password" value={password}
                 onChange={e=>setPassword(e.target.value)}
                 className="mb-4 w-full rounded border px-2 py-1"/>

          <button disabled={loading || (mode==='register' && !tmpAvatarUrl)}
                  onClick={submit}
                  className="mb-2 w-full rounded bg-blue-600 py-1 text-white disabled:opacity-60">
            {loading ? 'Processing…' : (mode==='login' ? 'Sign In' : 'Register')}
          </button>

          <button disabled={loading}
                  onClick={()=>setMode(m=>m==='login'?'register':'login')}
                  className="w-full text-sm text-blue-600 disabled:opacity-60">
            {mode==='login'?'Need an account? Register':'Have an account? Sign In'}
          </button>

          <button ref={cancelRef} onClick={onClose}
                  className="mt-2 w-full px-2 py-1 text-center text-gray-700">
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  )
}
