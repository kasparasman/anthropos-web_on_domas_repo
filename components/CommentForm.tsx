// components/CommentForm.tsx
'use client'

import { useState, RefObject, useEffect, ReactNode } from 'react'
import BanWarnDialog from '@/components/BanWarnDialog'
import { useSession } from 'next-auth/react'

interface Props {
  topicId: string
  onAdd: (content: string) => Promise<boolean>
  warn: any
  clearWarn: () => void
  placeholder?: string
  submitButtonText?: ReactNode
  textareaRef?: RefObject<HTMLTextAreaElement | null>
}

export default function CommentForm({
  topicId,
  onAdd,
  warn,
  clearWarn,
  placeholder = "Write your comment…",
  submitButtonText = <img src="/act.png" alt="Submit" className="w-8  aspect-square" />,
  textareaRef
}: Props) {
  const { data: session } = useSession()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!session?.user)
    return <button className="italic text-smoke">Log in to leave a comment.</button>

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
        <div className="relative">
          <textarea
            className="w-full h-24 rounded-xl bg-gray px-3 py-2 pr-12 resize-none outline-none"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            ref={textareaRef}
          />
          <button
            type="submit"
            className="absolute bottom-3 right-2 rounded-full bg-main text-background disabled:opacity-60 text-sm"
            disabled={loading}
          >
            {submitButtonText}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
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
