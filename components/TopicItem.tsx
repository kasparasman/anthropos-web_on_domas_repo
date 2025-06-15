// components/TopicItem.tsx
import React from 'react'
import { Heart } from 'lucide-react'
import { Topic } from '../types/topic'
import { useToast } from '@/lib/hooks/use-toast'

interface TopicItemProps {
  topic: Topic
  isSelected: boolean
  onSelect: (id: string) => void
  onOpenTopic: (t: Topic) => void
  hasPlayedVideo: boolean  // Whether this topic's video has played (for dimmed highlight)
}

export default function TopicItem({
  topic,
  isSelected,
  onSelect,
  onOpenTopic,
  hasPlayedVideo,
}: TopicItemProps) {
  /* -------------------------------------------------------------- */
  /*  Local likes state – seeded from API payload                   */
  /* -------------------------------------------------------------- */
  const [likesCount, setLikesCount] = React.useState<number>(topic.likes)
  const [likedByMe, setLikedByMe]   = React.useState<boolean>(topic.likedByUser)
  const [loading, setLoading]       = React.useState<boolean>(false)

  const { toast } = useToast()

  const toggleLike = React.useCallback(async () => {
    if (loading) return
    setLoading(true)
    // optimistic update
    const optimisticLiked = !likedByMe
    setLikedByMe(optimisticLiked)
    setLikesCount(prev => prev + (optimisticLiked ? 1 : -1))

    try {
      const res = await fetch(`/api/topics/${topic.id}/likes`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Network error')
      }
      const json = await res.json() as { count: number; likedByMe: boolean }
      setLikesCount(json.count)
      setLikedByMe(json.likedByMe)
    } catch (err: any) {
      console.error('Like toggle failed', err)
      // revert optimistic
      setLikedByMe(prev => !prev)
      setLikesCount(prev => prev + (likedByMe ? 1 : -1))

      if (err instanceof Error && err.message === 'Not authenticated') {
        toast({ title: 'Login required', description: 'You must be logged in to like topics.' })
      } else {
        toast({ title: 'Error', description: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }, [loading, likedByMe, toast, topic.id])

  /* -------------------------------------------------------------- */
  /*  Render                                                        */
  /* -------------------------------------------------------------- */
  // Determine the styling based on selection and video played state
  const getSelectionClass = () => {
    if (!isSelected) {
      // Default unselected state
      return 'border border-gray bg-stone-800 text-dim_smoke hover:border-main/30 transition-colors'
    }
    
    if (hasPlayedVideo) {
      // Dimmed selected state (video has played)
      return 'bg-secondary border border-main/60 text-smoke opacity-75'
    } else {
      // Bright selected state (video hasn't played yet)  
      return 'bg-secondary border border-main text-smoke'
    }
  }

  return (
    <div
      onClick={() => onSelect(topic.id)}
      className={`
        relative flex flex-row p-3 rounded-xl transition-colors h-[150px] gap-3 overflow-hidden mb-4 cursor-pointer
        ${getSelectionClass()}
      `}
    >
      <div className="aspect-square h-full">
        <img
          src={topic.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
          alt={topic.title}
          className="aspect-square h-full rounded-lg object-cover"
          loading="lazy"
          decoding="async"
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
          {topic.body}
        </p>
      </div>
      {/* Absolute likes + open chat button */}
      <div className="absolute bottom-[-1px] right-[-1px] flex items-center gap-2 pl-5">
            
            <button
            onClick={async e => {
              e.stopPropagation()
              try {
                await toggleLike()
              } catch (err) {
                // errors handled in toggleLike
              }
            }}
            disabled={loading}
            className="flex items-center gap-1 text-sm disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
            <Heart
              size={18}
              className={
                likedByMe
                  ? 'fill-smoke stroke-smoke' // Filled when liked
                  : 'fill-none stroke-smoke hover:stroke-smoke hover:stroke-3' // Outline when not liked, with hover effect
              }
            />
            {likesCount}
            </button>
            
            <button
              onClick={e => {
                e.stopPropagation()
                onOpenTopic(topic)
              }}
              className={`
                px-4 py-1 uppercase text-sm font-semibold rounded-tl-[32px] rounded-br-xl transition-all duration-200
                ${isSelected 
                  ? hasPlayedVideo 
                    ? 'bg-main/70 text-black' // Dimmed when video played
                    : 'bg-main text-black hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]' // Bright when not played
                  : 'bg-dim_smoke text-black hover:bg-main/80'
                }
              `}
            >
              open topic
            </button>

        </div>
    </div>
  )
}