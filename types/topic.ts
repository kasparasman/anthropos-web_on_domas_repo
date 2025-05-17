// types/topic.ts
export interface Topic {
  id: number
  title: string
  videoUrl: string   // URL to the avatar video (mp4/webm)
  likes: { user_id: string }[]   // array again
  likedByUser: boolean
}
