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
  const [selectedId, setSelectedId] = useState<number>(topics[0]?.id ?? '')
  const [popupTopic, setPopupTopic] = useState<TopicWithBody | null>(null)

  const current = topics.find((t) => t.id === selectedId)

  return (
    <section className="flex flex-col lg:flex-row gap-4 rounded-2xl border border-main px-5 py-4 w-full">
      {/* Left side: avatar video */}
      <AvatarPlayer videoUrl={current?.videoUrl ?? ''} />

      {/* Right side: topic list */}
      <TopicList
        topics={topics}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onOpenTopic={(topic) => setPopupTopic(topic)}   // new

      />
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
