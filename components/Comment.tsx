'use client'

import React, { useState } from 'react'
import { Comment as CommentType } from '@/lib/hooks/useComments'
import CommentForm from './CommentForm'

const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}d ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears}y ago`
}

interface CommentProps {
  comment: CommentType
  depth?: number
  topicId: string
  onAddComment: (content: string, parentId?: string) => Promise<boolean>
  warn: any
  clearWarn: () => void
  replyingToCommentId: string | null
  setReplyingToCommentId: (id: string | null) => void
}

export default function Comment({
  comment,
  depth = 0,
  topicId,
  onAddComment,
  warn,
  clearWarn,
  replyingToCommentId,
  setReplyingToCommentId
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  // This component's reply form is open if its ID matches the active one
  const showReplyForm = replyingToCommentId === comment.id

  // Count total replies including nested ones
  const countTotalReplies = (comment: CommentType): number => {
    if (!comment.replies) return 0
    return comment.replies.reduce((total, reply) => {
      return total + 1 + countTotalReplies(reply)
    }, 0)
  }

  const totalReplies = countTotalReplies(comment)
  const hasMultipleReplies = totalReplies > 2

  // Initialize showReplies based on reply count
  React.useEffect(() => {
    setShowReplies(!hasMultipleReplies)
  }, [hasMultipleReplies])

  const handleReply = async (content: string): Promise<boolean> => {
    setIsReplying(true)
    try {
      const success = await onAddComment(content, comment.id)
      if (success) {
        setReplyingToCommentId(null)
      }
      return success
    } finally {
      setIsReplying(false)
    }
  }

  // Limit nesting depth for UI purposes
  const maxDepth = 4
  const isMaxDepth = depth >= maxDepth

  // Calculate indentation based on depth
  const indentationClass = depth > 0 ? 'ml-4 md:ml-8' : ''

  // Ref for the reply form textarea
  const replyFormRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Focus the textarea when the reply form opens
  React.useEffect(() => {
    if (showReplyForm && replyFormRef.current) {
      replyFormRef.current.focus()
    }
  }, [showReplyForm])

  return (
    <div className={`${indentationClass} ${depth > 0 ? 'border-l-2 border-gray pl-4' : ''}`}>
      {/* Comment Content */}
      <div className=" p-3 ">
        {/* Author and timestamp */}
        <div className="flex items-center gap-3 mb-2">
          {comment.author?.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt={comment.author.nickname || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center">
              <span className="text-xs font-medium text-dim_smoke">
                {comment.author?.nickname?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm font-medium text-smoke">
              {comment.author?.nickname || 'Anonymous'}
            </span>
            <span className="text-xs text-dim_smoke">
              {getRelativeTime(new Date(comment.createdAt))}
            </span>
          </div>
        </div>

        {/* Comment body */}
        <p className="text-smoke mb-1 leading-relaxed whitespace-pre-wrap ml-10">
          {comment.body}
        </p>

        {/* Reply button */}
        {!isMaxDepth && (
          <button
            onClick={() => setReplyingToCommentId(showReplyForm ? null : comment.id)}
            className="text-sm ml-7 text-dim_smoke hover:text-smoke hover:bg-white/10 transition-colors p-1 px-3 rounded-full"
            disabled={isReplying}
          >
            {showReplyForm ? 'Cancel Reply' : 'Reply'}
          </button>
        )}
        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="">
            {/* Show button if there are any replies */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-sm text-main hover:text-smoke hover:bg-white/10 transition-colors p-1 px-3 rounded-full mb-2 ml-7"
            >
              <span> {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}</span>
              <svg
                className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showReplies && comment.replies.map(reply => (
              <Comment
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                topicId={topicId}
                onAddComment={onAddComment}
                warn={warn}
                clearWarn={clearWarn}
                replyingToCommentId={replyingToCommentId}
                setReplyingToCommentId={setReplyingToCommentId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mb-4">
          <CommentForm
            topicId={topicId}
            onAdd={handleReply}
            warn={warn}
            clearWarn={clearWarn}
            placeholder={`Reply to ${comment.author?.nickname || 'comment'}...`}
            submitButtonText={<img src="/act.png" alt="Submit" className="w-8 aspect-square" />}
            textareaRef={replyFormRef}
          />
        </div>
      )}
    </div>
  )
} 