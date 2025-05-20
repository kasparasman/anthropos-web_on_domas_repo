// types/topic-popup.ts
import { Topic } from './topic'
export interface TopicWithBody extends Topic {
  body: string | null       // full markdown / html text
}
