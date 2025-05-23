import { Comment } from '../hooks/useComments'

interface Props {
  comments: Comment[]
  loading: boolean
}

export default function CommentList({ comments, loading }: Props) {
  if (loading) return <p>Loading comments…</p>
  if (!comments.length) return <p className="italic">No comments yet.</p>

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id} className="border border-stone-800 rounded p-3">
          <p className="text-sm text-zinc-400">{new Date(c.createdAt).toLocaleString()}</p>
          <p>{c.body}</p>
        </li>
      ))}
    </ul>
  )
}
