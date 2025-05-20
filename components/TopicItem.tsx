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
        relative flex flex-row p-3 rounded-xl transition-colors h-[150px] gap-3 overflow-hidden mb-4
        ${isSelected
          ? ' bg-secondary border border-main text-smoke'
          : ' border border-gray bg-stone-800 text-dim_smoke '}
      `}
    >
      <div className="aspect-square h-full">
        <img
          src={topic.imageUrl}
          alt={topic.title}
          className="aspect-square h-full rounded-lg object-cover"
        />

      </div>
      {/* Content */}
      <div className=" relative flex flex-col items-start h-full overflow-hidden">
        <div className={`absolute bottom-0 left-0 h-[50px] w-full
        ${isSelected
          ? ' bg-gradient-to-t from-secondary to-transparent'
          : ' bg-gradient-to-t from-stone-800 to-transparent '}`} />
        <h3 className="text-xl font-semibold">{topic.title}</h3>
        {/* Paragraph */}
        <p className="mt-2 leading-relaxed">
          {topic.paragraph}
        </p>
      </div>
      {/* Absolute likes + open chat button */}
      <div className="absolute bottom-[-1px] right-[-1px] flex items-center gap-2 pl-5">
            {/* 
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
                ? ' stroke-smoke'
                : 'stroke-foreground hover:stroke-main'
              }
            />
            {count}
            </button>
            */}
            <button
            onClick={e => {
              e.stopPropagation()
              onOpenTopic(topic)
            }}
            className="px-4 py-1 uppercase text-sm font-semibold rounded-tl-[32px] rounded-br-xl bg-main text-black transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]"
            >
            open topic
            </button>

        </div>
    </div>
  )
}
