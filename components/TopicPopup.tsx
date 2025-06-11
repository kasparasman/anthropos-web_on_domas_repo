'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useState, useRef } from 'react'
import { TopicWithBody } from '../types/topic-popup'
import useComments from '@/lib/hooks/useComments'
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
  const scrollableRef = useRef<HTMLDivElement>(null)

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
        <Dialog.Content className="fixed left-1/2 top-1/2 w-11/12 max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black border border-main max-h-[85vh] z-50 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start p-6 pb-4 border-b border-gray/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-smoke">{topic.title}</h2>
            <Dialog.Close asChild>
              <button>
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable Content */}
          <div ref={scrollableRef} className="flex-1 overflow-y-auto no-scrollbar p-6 pt-4 pb-4">
            {/* Body */}
            <div className="mb-6">
              <TopicBody body={topic.body} />
            </div>

            <div className="mb-6">
              <img
                src={topic.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
                alt={topic.title}
                className="w-full max-h-50 object-cover rounded-lg"
              />
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-xl text-smoke font-semibold mb-4">Comments</h3>
              <CommentList
                comments={comments}
                loading={loading}
                topicId={topic.id}
                onAddComment={handleAddComment}
                warn={warn}
                clearWarn={clearWarn}
                replyingToCommentId={replyingToCommentId}
                setReplyingToCommentId={setReplyingToCommentId}
                scrollableRef={scrollableRef}
              />
            </div>
          </div>

          {/* Fixed Comment Form at Bottom */}
          <div className={`border-t border-gray/50 p-6 bg-black m-0.25 rounded-b-xl transition-all duration-300 ease-in-out ${!replyingToCommentId
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none h-0 p-0 border-0'
            }`}>
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

