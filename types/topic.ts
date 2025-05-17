// types/topic.ts
export interface Topic {
  id: number
  title: string
  videoUrl: string | null   // ← allow null
  likes: { user_id: string }[]   // array again
  likedByUser: boolean
}
