// types/topic-popup.ts
import { Topic } from './topic'
export interface TopicWithBody extends Topic {
  body: string  // full markdown / html text, must be string to match Topic
  imageUrl?: string | null  // optional image url for topic popup
}
