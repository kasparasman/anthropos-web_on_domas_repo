// hooks/useComments.ts
import useSWR            from 'swr'
import { useCallback, useState } from 'react'
import { useSession, signOut }   from 'next-auth/react'

export interface Comment {
  id: string
  topicId: string
  authorId: string
  parentId?: string | null
  body: string
  createdAt: string
  author?: {
    id: string
    nickname: string | null
    avatarUrl: string | null
  }
  replies?: Comment[]  // For nested structure
}

// Utility function to organize flat comments into a tree structure
export function organizeCommentsIntoTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First, create a map of all comments and initialize replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Then, organize into tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!
    
    if (comment.parentId) {
      // This is a reply - add it to its parent's replies array
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentWithReplies)
      }
    } else {
      // This is a top-level comment
      rootComments.push(commentWithReplies)
    }
  })

  // Sort replies by creation date for consistent ordering
  const sortReplies = (comment: Comment) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      comment.replies.forEach(sortReplies)
    }
  }

  rootComments.forEach(sortReplies)
  
  // Sort root comments by creation date
  return rootComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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
  addComment: (content: string, parentId?: string) => Promise<boolean>  // Now supports replies
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
    async (content: string, parentId?: string): Promise<boolean> => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      const previous = data ?? []
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        topicId,
        authorId: session.user.id,
        parentId: parentId || null,
        body: content,
        createdAt: new Date().toISOString(),
        author: {
          id: session.user.id,
          nickname: session.user.nickname || null,
          avatarUrl: session.user.image || null
        }
      }

      // Immediately update UI with optimistic comment
      await mutate([...previous, optimistic], false)

      try {
        const res = await fetch(`/api/topics/${topicId}/comments`, {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ content, parentId })
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
