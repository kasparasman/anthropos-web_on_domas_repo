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
  const [nickname, setNickname] = useState<string>('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  /* male/female + style selection */
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null); // index of selected style
  const maleStyles = [
  { img: "/avatars/male1.jpg", label: "Classic" },
  { img: "/avatars/male2.jpg", label: "Sporty" },
  { img: "/avatars/male3.jpg", label: "Casual" },
  { img: "/avatars/male4.jpg", label: "Hipster" },
  { img: "/avatars/male5.jpg", label: "Elegant" },
  { img: "/avatars/male6.jpg", label: "Adventurer" },
  { img: "/avatars/male7.jpg", label: "Artist" },
  { img: "/avatars/male8.jpg", label: "Techie" }]; // add your 8 objects
  const femaleStyles = [
  { img: "/avatars/female1.jpg", label: "Classic" },
  { img: "/avatars/female2.jpg", label: "Sporty" },
  { img: "/avatars/female3.jpg", label: "Casual" },
  { img: "/avatars/female4.jpg", label: "Hipster" },
  { img: "/avatars/female5.jpg", label: "Elegant" },
  { img: "/avatars/female6.jpg", label: "Adventurer" },
  { img: "/avatars/female7.jpg", label: "Artist" },
  { img: "/avatars/female8.jpg", label: "Techie" }];


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
        const cred    = await registerClient(email, password)
        const idToken = await cred.user.getIdToken()
    
        const result  = await signIn('credentials', {
          idToken,
          tmpUrl:   tmpAvatarUrl ?? '',
          nickname,
          redirect: false,
        })
    
        if (result?.error === 'AccountBanned' || result?.error === 'ACCOUNT_BANNED') {
          setError('This account has been permanently suspended.')
          return
        }
        if (result?.error) throw new Error(result.error)
    
      } else {                           // ────── LOGIN ──────
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
      }
    
      onClose()                                   // success
    } catch (e: any) {
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
                  <label
                    className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-lg border-2 border-dim_smoke bg-neutral-900 mb-3"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <span className="text-4xl text-dim_smoke">+</span>
                  </label>
                  <button
                    disabled={!file || loading}
                    onClick={handleGenerate}
                    className="w-full rounded bg-main py-2 font-semibold text-black disabled:opacity-60"
                  >
                    {loading ? 'Generating…' : 'Generate Avatar'}
                  </button>
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
                        <img
                          src={style.img}
                          alt={style.label}
                          className="h-30 w-30 rounded-lg object-cover mb-1"
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
              disabled={loading}
              onClick={submit}
              className="mb-2 w-full rounded-md bg-main py-2 font-semibold text-black transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)] "
            >
              {loading ? 'Processing…' : 'REGISTER'}
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
