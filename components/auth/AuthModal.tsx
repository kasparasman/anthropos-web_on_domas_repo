'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { signIn, signOut } from 'next-auth/react'
import { signInClient, registerClient } from '../../lib/firebase-client'
import { uploadAvatar } from '../../lib/uploadAvatar'
import Image from 'next/image'

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

  /* male/female + style selection */
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null); // index of selected style
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // for file preview
  
  // Cloudflare R2 URLs for style references
  const maleStyles = [
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/e1ffaf29-cde4-4500-a451-009e29c23e24.jpg", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/ChatGPT%20Image%20May%2024%2C%202025%2C%2010_39_50%20AM.png", label: "Classic" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2026%2C%202025%2C%2009_13_57%20PM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2026%2C%202025%2C%2009_13_57%20PM.png", label: "Creative" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_21_29%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_21_29%20AM.png", label: "Reader" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_02%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_02%20AM.png", label: "Sportsman" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_14%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_14%20AM.png", label: "CyberMan" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_31%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_31%20AM.png", label: "The Lead" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_27_58%20AM.png", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_27_58%20AM.png", label: "Socialist" },
    { img: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/e1ffaf29-cde4-4500-a451-009e29c23e24.jpg", styleRef: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/ChatGPT%20Image%20May%2024%2C%202025%2C%2010_39_50%20AM.png", label: "Techie" }
  ];
  
  const femaleStyles = [
    { img: "https://your-r2-bucket.r2.dev/styles/female1.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female1-ref.jpg", label: "Classic" },
    { img: "https://your-r2-bucket.r2.dev/styles/female2.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female2-ref.jpg", label: "Sporty" },
    { img: "https://your-r2-bucket.r2.dev/styles/female3.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female3-ref.jpg", label: "Casual" },
    { img: "https://your-r2-bucket.r2.dev/styles/female4.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female4-ref.jpg", label: "Hipster" },
    { img: "https://your-r2-bucket.r2.dev/styles/female5.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female5-ref.jpg", label: "Elegant" },
    { img: "https://your-r2-bucket.r2.dev/styles/female6.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female6-ref.jpg", label: "Adventurer" },
    { img: "https://your-r2-bucket.r2.dev/styles/female7.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female7-ref.jpg", label: "Artist" },
    { img: "https://your-r2-bucket.r2.dev/styles/female8.jpg", styleRef: "https://your-r2-bucket.r2.dev/styles/female8-ref.jpg", label: "Techie" }
  ];


  /* body scroll lock */
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  /* cleanup preview URL on unmount */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (!open) return null

  /* ------- file selection handler ------- */
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    // Create preview URL
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    
    // Clean up previous preview URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

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
        const currentStyles = gender === 'male' ? maleStyles : femaleStyles
        const selectedStyleRef = selectedStyle !== null ? currentStyles[selectedStyle]?.styleRef : undefined
        
        const { tmpAvatarUrl } = await fetch('/api/avatar-gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sourceUrl: orig,
            styleRef: selectedStyleRef 
          }),
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
          
          // Force sign out to clear any session that might have been created
          try {
            await signOut({ redirect: false })
            console.log('[AuthModal] Forced sign out after email conflict')
          } catch (signOutError) {
            console.error('[AuthModal] Failed to sign out after email conflict:', signOutError)
          }
          
          return
        }
        if (result?.error === 'NICKNAME_ALREADY_IN_USE') {
          console.log('[AuthModal] Nickname already in use')
          setError('This nickname is already taken. Please choose a different one.')
          
          // Force sign out to clear any session that might have been created
          try {
            await signOut({ redirect: false })
            console.log('[AuthModal] Forced sign out after nickname conflict')
          } catch (signOutError) {
            console.error('[AuthModal] Failed to sign out after nickname conflict:', signOutError)
          }
          
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
      onClose={loading ? () => { } : onClose}
      initialFocus={cancelRef}>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/70 backdrop-blur" onClick={onClose} />
        <div
          onClick={e => e.stopPropagation()}
          className={`flex flex-col gap-4 relative z-10 rounded-xl bg-black py-8 px-12 border border-main gap ${
            mode === 'register' ? 'w-220 gap-10' : 'w-120'
          }`}
        >
          <h2 className="mb-6 text-center text-3xl font-semibold">
            {mode === 'login' ? 'Log in to your account' : 'Register to Anthropos City'}
          </h2>

          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        

          
          {/* switching code */}
          {mode === 'login' && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mb-4 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mb-4 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </>
          )}
          
          {/* avatar generation section */}

          {mode === 'register' && (
            <>
              <div className="flex flex-row gap-3">
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mb-4 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mb-4 w-full rounded-md bg-gray px-4 py-2 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>
              <div className="flex justify-between gap-8">
                {/* --- Upload + Gender --- */}
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex gap-2">
                    <button
                      className={`rounded-full px-5 py-1 font-semibold border-2 ${gender === 'male' ? 'bg-main text-black border-main' : 'bg-black border-white text-white'
                        }`}
                      onClick={() => setGender('male')}
                    >
                      Male
                    </button>
                    <button
                      className={`rounded-full px-5 py-1 font-semibold border-2 ${gender === 'female' ? 'bg-main text-black border-main' : 'bg-black border-white text-white'
                        }`}
                      onClick={() => setGender('female')}
                    >
                      Female
                    </button>
                  </div>
                  {!tmpAvatarUrl ? (
                    <label
                      className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-lg border-2 border-dim_smoke bg-neutral-900 mb-3 overflow-hidden"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const selectedFile = e.target.files?.[0]
                          if (selectedFile) {
                            handleFileSelect(selectedFile)
                          }
                        }}
                        className="hidden"
                      />
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-dim_smoke">+</span>
                      )}
                    </label>
                  ) : (
                    <div className="flex flex-col items-center mb-3">
                      <img 
                        src={tmpAvatarUrl} 
                        alt="Generated Avatar" 
                        className="h-36 w-36 rounded-lg object-cover mb-2"
                      />
                      <div className="text-sm text-white font-semibold">{nickname}</div>
                    </div>
                  )}
                  {!tmpAvatarUrl ? (
                    <button
                      disabled={!file || loading}
                      onClick={handleGenerate}
                      className="w-full rounded bg-main py-2 font-semibold text-black disabled:opacity-60"
                    >
                      {loading ? 'Generating…' : 'Generate Avatar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setTmpAvatarUrl(null)
                        setNickname('')
                        setPreviewUrl(null)
                        setFile(null)
                      }}
                      className="w-full rounded bg-gray py-2 font-semibold text-white border border-dim_smoke"
                    >
                      Try Again
                    </button>
                  )}
                </div>

                {/* --- Styles --- */}
                <div>
                  <div className="mb-2 text-lg font-semibold text-white">Choose your style</div>
                  <div className="grid grid-cols-4 gap-3">
                    {(gender === 'male' ? maleStyles : femaleStyles).map((style, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedStyle(i)}
                        className={`flex flex-col items-center cursor-pointer rounded-lg border-2 transition-all ${selectedStyle === i ? 'border-main' : 'border-transparent'
                          }`}
                      >
                        <Image
                          src={style.img}
                          alt={style.label}
                          width={480}
                          height={480}
                          className="rounded-lg mb-1 object-cover w-30 h-30"
                          style={{ objectFit: 'cover', width: 120, height: 120 }}
                          sizes="120px"
                          priority={selectedStyle === i}
                        />
                        <span className="text-xs text-white">{style.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          <div>
            <button
              disabled={loading || (mode === 'register' && !tmpAvatarUrl)}
              onClick={submit}
              className="mb-2 w-full rounded-md bg-main py-2 font-semibold text-black transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)] disabled:opacity-60"
            >
              {loading ? 'Processing…' : mode === 'register' ? 'REGISTER' : 'LOGIN'}
            </button>
            
            <button disabled={loading}
                    onClick={()=>setMode(m=>m==='login'?'register':'login')}
                    className="w-full text-sm text-main disabled:opacity-60 hover:underline">
              {mode==='login'?'Need an account? Register':'Have an account? Sign In'}
            </button>

            <button ref={cancelRef} onClick={onClose}
                    className="mt-2 w-full px-2 py-1 text-center text-dim_smoke">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
