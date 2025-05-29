// components/CommentForm.tsx
'use client'

import { useState } from 'react'
import BanWarnDialog  from '@/components/BanWarnDialog'
import { useSession } from 'next-auth/react'

interface Props {
  topicId: string
  onAdd:    (content: string) => Promise<boolean>
  warn:     any
  clearWarn: () => void
}

export default function CommentForm({ topicId, onAdd, warn, clearWarn }: Props) {
  const { data: session } = useSession()
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  if (!session?.user)
    return <p className="text-sm text-zinc-500">Log in to leave a comment.</p>

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Clear input immediately for better UX
      setText('')
      
      const ok = await onAdd(trimmedText)
      if (!ok && !warn) { // Only restore if not warned/banned
        setText(trimmedText)
      }
    } catch (err: any) {
      setText(trimmedText) // Restore text on error
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <textarea
          className="w-full h-24 rounded bg-stone-800 p-2"
          placeholder="Write your comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          className="self-end px-4 py-1 rounded bg-main text-background disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Posting…' : 'Post'}
        </button>
      </form>

      {/* Warn/Ban dialog */}
      {warn && (
        <BanWarnDialog
          banned={warn.banned}
          warnings={warn.warnings}
          reason={warn.reason}
          onClose={clearWarn}
        />
      )}
    </>
  )
}
