'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface Props {
  topicId: number
  onAdd: (content: string) => Promise<void>
}

export default function CommentForm({ topicId, onAdd }: Props) {
  const { data: session } = useSession()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  if (!session?.user)
    return <p className="text-sm text-zinc-500">Log in to leave a comment.</p>

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      setLoading(true)
      await onAdd(text.trim())
      setText('')
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        className="w-full h-24 rounded bg-stone-800 p-2"
        placeholder="Write your comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        className="self-end px-4 py-1 rounded bg-main text-background disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Posting…' : 'Post'}
      </button>
    </form>
  )
}
