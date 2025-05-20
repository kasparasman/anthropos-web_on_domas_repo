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
    <div
      onClick={() => onSelect(topic.id)}
      className={`
        relative flex flex-row p-3 rounded-xl transition-colors h-36 gap-3
        ${isSelected
          ? 'border-1 border-main bg-main text-black'
          : 'border border-stone-700 bg-stone-800 text-foreground hover:bg-stone-700'}
      `}
    >
      <div className="">
        <img
          src={topic.imageUrl}
          alt={topic.title}
          className="aspect-square h-full rounded-lg object-cover"
        />

      </div>
      {/* Top bar: title + actions */}
      <div className="flex flex-col items-start justify-between">
        <h3 className="text-lg font-semibold">{topic.title}</h3>
        {/* Paragraph */}
        <p className="mt-3 leading-relaxed">
          {topic.paragraph}
        </p>
      </div>
      {/* Absolute likes + open chat button */}
      <div className="absolute bottom-0 right-0 flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              toggleLike()
            }}
            disabled={loading || likedByMe}
            className="flex items-center gap-1 text-sm disabled:cursor-not-allowed"
          >
            <Heart
              size={18}
              className={
                likedByMe
                  ? 'fill-main stroke-black'
                  : 'stroke-foreground hover:stroke-main'
              }
            />
            {count}
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onOpenTopic(topic)
            }}
            className=" px-4 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-600"
          >
            open chat
          </button>

        </div>
    </div>
  )
}