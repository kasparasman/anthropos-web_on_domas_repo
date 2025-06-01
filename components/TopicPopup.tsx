'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useState } from 'react'
import { TopicWithBody } from '../types/topic-popup'
import useComments from '../hooks/useComments'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import TopicBody from './TopicBody'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TopicPopupProps {
  topic: TopicWithBody        // supplied by parent (RightPanel)
  open: boolean
  onOpenChange: (o: boolean) => void
}

export default function TopicPopup({ topic, open, onOpenChange }: TopicPopupProps) {
  const {
    comments, addComment,
    warn, clearWarn,
    loading, error
  } = useComments(topic.id)
  const router = useRouter();
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)

  const handleClose = async () => {
    if (warn) {
      await signOut({ redirect: false });
      window.location.reload();
      return; // Don't call onClose, just redirect
    }
    onOpenChange(false);
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    const success = await addComment(content, parentId)
    if (success && parentId) {
      setReplyingToCommentId(null) // Close reply form after successful reply
    }
    return success
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-11/12 max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black border border-main p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto no-scrollbar z-50">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="text-2xl sm:text-3xl font-bold text-smoke">{topic.title}</h2>
            <Dialog.Close asChild>
              <button>
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <TopicBody body={topic.body} />
          <img
            src={topic.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
            alt={topic.title}
            className="w-full max-h-50 object-cover rounded-lg"
          />

          {/* Comments */}
          <div>
            <h3 className="text-xl text-smoke font-semibold">Comments</h3>
            <CommentList
              comments={comments}
              loading={loading}
              topicId={topic.id}
              onAddComment={handleAddComment}
              warn={warn}
              clearWarn={clearWarn}
              replyingToCommentId={replyingToCommentId}
              setReplyingToCommentId={setReplyingToCommentId}
            />
            {!replyingToCommentId && (
              <CommentForm
                topicId={topic.id}
                onAdd={handleAddComment}
                warn={warn}
                clearWarn={clearWarn}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

