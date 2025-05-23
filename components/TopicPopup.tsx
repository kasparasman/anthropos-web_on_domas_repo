'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useState } from 'react'
import { TopicWithBody } from '../types/topic-popup'
import useComments from '../hooks/useComments'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import TopicBody from './TopicBody'

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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-11/12 max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-foreground border border-main p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-main">{topic.title}</h2>
            <Dialog.Close asChild>
              <button>
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <TopicBody body={topic.body} />

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            <CommentList comments={comments} loading={loading} />
            <CommentForm
        topicId={topic.id}
        onAdd={addComment}
        warn={warn}
        clearWarn={clearWarn}
      />          
      </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
