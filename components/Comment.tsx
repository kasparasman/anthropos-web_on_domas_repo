'use client'

import React, { useState } from 'react'
import { Comment as CommentType } from '../hooks/useComments'
import CommentForm from './CommentForm'

interface CommentProps {
  comment: CommentType
  depth?: number
  topicId: string
  onAddComment: (content: string, parentId?: string) => Promise<boolean>
  warn: any
  clearWarn: () => void
}

export default function Comment({ 
  comment, 
  depth = 0, 
  topicId, 
  onAddComment, 
  warn, 
  clearWarn 
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const handleReply = async (content: string): Promise<boolean> => {
    setIsReplying(true)
    try {
      const success = await onAddComment(content, comment.id)
      if (success) {
        setShowReplyForm(false)
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
  
  return (
    <div className={`${indentationClass} ${depth > 0 ? 'border-l-2 border-stone-700 pl-4' : ''}`}>
      {/* Comment Content */}
      <div className="border border-stone-800 rounded-lg p-4 mb-3 bg-stone-900/50">
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
              <span className="text-xs font-medium text-stone-300">
                {comment.author?.nickname?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-stone-200">
              {comment.author?.nickname || 'Anonymous'}
            </span>
            <span className="text-xs text-stone-400">
              {new Date(comment.createdAt).toLocaleDateString()} at{' '}
              {new Date(comment.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
        
        {/* Comment body */}
        <p className="text-stone-100 mb-3 leading-relaxed whitespace-pre-wrap">
          {comment.body}
        </p>
        
        {/* Reply button */}
        {!isMaxDepth && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            disabled={isReplying}
          >
            {showReplyForm ? 'Cancel Reply' : 'Reply'}
          </button>
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
            submitButtonText="Post Reply"
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              topicId={topicId}
              onAddComment={onAddComment}
              warn={warn}
              clearWarn={clearWarn}
            />
          ))}
        </div>
      )}
    </div>
  )
} 