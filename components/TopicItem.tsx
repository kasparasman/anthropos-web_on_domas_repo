// components/TopicItem.tsx
import React from 'react'
import { Eye, Heart } from 'lucide-react'
import { Topic } from '../types/topic'
import useLikes from '../hooks/useLikes'
import { TopicWithBody } from '../types/topic-popup'

interface TopicItemProps {
  topic: Topic
  isSelected: boolean
  onSelect: (id: number) => void
  onOpenTopic: (t: Topic) => void

}



export default function TopicItem({
  topic,
  isSelected,
  onSelect,
  onOpenTopic,
}: TopicItemProps) {
  /* -------------------------------------------------------------- */
  /*  Likes hook – start with SSR data for instant paint            */
  /* -------------------------------------------------------------- */
  const { count, likedByMe, loading, toggleLike } = useLikes(topic.id)

  /* -------------------------------------------------------------- */
  /*  Render                                                        */
  /* -------------------------------------------------------------- */
  return (
    <div className="flex items-center gap-3">
      {/* Topic button ------------------------------------------------ */}
      
      <button
        onClick={() => onSelect(topic.id)}
        className={`flex-1 text-left p-3 rounded transition-colors ${
          isSelected
            ? 'bg-main text-background'
            : 'bg-stone-800 text-foreground hover:bg-stone-700'
        }`}
      >
        {topic.title}
      </button>
      <button
        onClick={() => onOpenTopic(topic)}
        className="p-2 rounded hover:bg-stone-700"
        title="Open topic"
      >
        <Eye size={18} />
      </button>

      {/* Like button ------------------------------------------------- */}
      <button
        onClick={toggleLike}
        disabled={loading || likedByMe}
        className="flex items-center gap-1 text-sm disabled:cursor-not-allowed"
      >
        <Heart
          size={18}
          className={
            likedByMe ? 'fill-main stroke-main' : 'stroke-foreground hover:stroke-main'
          }
        />
        {count}
      </button>
    </div>
  )
}
