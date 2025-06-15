// types/topic.ts
export interface Topic {
  id: string           // Changed: now UUID string instead of number
  title: string
  body: string
  videoUrl: string
  createdAt: Date | string  // Accept both Date object and ISO string
  likes: number       // Added: to match how we use it
  likedByUser: boolean // Added: to match how we use it
  comments?: number    // New: comment count for batching (optional)
  imageUrl?: string | null // Optional image url for topic
}
