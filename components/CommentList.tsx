import { Comment as CommentType, organizeCommentsIntoTree } from '../hooks/useComments'
import Comment from './Comment'

interface Props {
  comments: CommentType[]
  loading: boolean
  topicId: string
  onAddComment: (content: string, parentId?: string) => Promise<boolean>
  warn: any
  clearWarn: () => void
}

export default function CommentList({ 
  comments, 
  loading, 
  topicId, 
  onAddComment, 
  warn, 
  clearWarn 
}: Props) {
  if (loading) return <p>Loading comments…</p>
  if (!comments.length) return <p className="italic text-stone-400">No comments yet.</p>

  // Organize flat comments into nested tree structure
  const commentTree = organizeCommentsIntoTree(comments)

  return (
    <div className="space-y-4">
      {commentTree.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          depth={0}
          topicId={topicId}
          onAddComment={onAddComment}
          warn={warn}
          clearWarn={clearWarn}
        />
      ))}
    </div>
  )
}
