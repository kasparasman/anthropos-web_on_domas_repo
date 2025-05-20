// types/topic.ts
export interface Topic {
  id: number
  title: string
  videoUrl: string | null   // Changed from video_url to videoUrl
  likes: number            // Changed from array to number
  likedByUser: boolean
}
