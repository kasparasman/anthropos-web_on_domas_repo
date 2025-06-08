// components/RightPanel.tsx
import React, { useState } from 'react'
import AvatarPlayer from './AvatarPlayer'
import TopicList from './TopicList'
import { Topic } from '../types/topic'
import { TopicWithBody } from '../types/topic-popup'
import TopicPopup from './TopicPopup'
interface RightPanelProps {
  topics: Topic[]
}

export default function RightPanel({ topics }: RightPanelProps) {
  const [selectedId, setSelectedId] = useState<string>('') // No topic selected by default
  const [popupTopic, setPopupTopic] = useState<TopicWithBody | null>(null)
  const [isIdle, setIsIdle] = useState(true) // Start in idle state
  const [hasPlayedVideo, setHasPlayedVideo] = useState(false) // Track if topic video has played

  const current = topics.find((t) => t.id === selectedId)

  // Handle topic selection with basic guardrails
  const handleTopicSelect = (id: string) => {
    setSelectedId(id)
    setIsIdle(false) // Switch to topic video
    setHasPlayedVideo(false) // Reset played state
  }

  // Handle video start
  const handleVideoStart = () => {
    // Video has started playing
  }

  // Handle video end - return to idle immediately
  const handleVideoEnd = () => {
    setIsIdle(true)
    setHasPlayedVideo(true) // Mark that topic video has played
  }

  return (
    <section className="w-full bg-black flex flex-col lg:flex-row gap-4 rounded-2xl border border-main px-3 sm:p-4 ">
      {/* Left side: avatar video */}
      <AvatarPlayer 
        videoUrl={current?.videoUrl ?? ''} 
        isIdle={isIdle}
        onVideoStart={handleVideoStart}
        onVideoEnd={handleVideoEnd}
      />

      {/* Right side: topic list */}
      <div className="w-full lg:max-w-[60%]">
        <TopicList
          topics={topics}
          selectedId={selectedId}
          onSelect={handleTopicSelect}
          onOpenTopic={(topic) => setPopupTopic(topic)}
          hasPlayedVideo={hasPlayedVideo} // Pass to control highlight intensity
        />
      </div>
      {popupTopic && (
        <TopicPopup
          topic={popupTopic}
          open={!!popupTopic}
          onOpenChange={(o) => !o && setPopupTopic(null)}
        />
      )}
    </section>
  )
}
