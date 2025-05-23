// hooks/useComments.ts
import useSWR            from 'swr'
import { useCallback, useState } from 'react'
import { useSession, signOut }   from 'next-auth/react'

export interface Comment {
  id: string
  topicId: string
  authorId: string
  body: string
  createdAt: string
}


export interface WarnBanPayload {
  blocked:   boolean
  reason:    string
  warnings:  number
  banned:    boolean
}

type UseCommentsResult = {
  comments:   Comment[]
  loading:    boolean
  error:      any
  warn:       WarnBanPayload | null
  clearWarn:  () => void
  addComment: (content: string) => Promise<boolean>  // returns true if posted
}

export default function useComments(topicId: string): UseCommentsResult {
  const { data: session } = useSession()
  const [warn, setWarn]   = useState<WarnBanPayload | null>(null)

  const {
    data,
    error,
    mutate
  } = useSWR<Comment[]>(
    `/api/topics/${topicId}/comments`,
    (url) => fetch(url, { credentials: 'include' }).then(r => r.json()),
    { refreshInterval: 5000 }
  )

  const addComment = useCallback(
    async (content: string): Promise<boolean> => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      const previous = data ?? []
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        topicId,
        authorId: session.user.id,
        body: content,
        createdAt: new Date().toISOString()
      }

      // Immediately update UI with optimistic comment
      await mutate([...previous, optimistic], false)

      try {
        const res = await fetch(`/api/topics/${topicId}/comments`, {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ content })
        })

        const responseData = await res.json()

        /* -------------------- SUCCESS -------------------- */
        if (res.status === 201) {
          // Update with real data but don't revalidate to avoid flicker
          await mutate(
            previous.concat({
              ...responseData,
              createdAt: new Date(responseData.createdAt).toISOString()
            }),
            false
          )
          return true
        }

        /* ---------------- WARN / BAN --------------------- */
        if (res.status === 403) {
          // Remove optimistic draft first
          await mutate(previous, false)
          
          // Then show the warning/ban dialog
          setWarn(responseData)

          // If banned, sign out after a short delay to allow dialog to be seen
          return false
        }

        /* ---------------- OTHER ERRORS ------------------ */
        // Remove optimistic update on error
        await mutate(previous, false)
        throw new Error(responseData.error || 'Failed to post comment')

      } catch (err) {
        console.error('addComment failed, rolling back:', err)
        // Remove optimistic update on error
        await mutate(previous, false)
        throw err
      }
    },
    [data, session, topicId, mutate]
  )

  return {
    comments: data ?? [],
    loading:  !error && !data,
    error,
    warn,
    clearWarn: () => setWarn(null),
    addComment
  }
}
