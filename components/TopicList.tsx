// components/TopicList.tsx
import React from 'react'
import TopicItem from './TopicItem'
import { Topic } from '../types/topic'

interface TopicListProps {
  topics: Topic[]
  selectedId: string
  onSelect: (id: string) => void
  onOpenTopic: (t: Topic) => void          // <- receive from parent
}

export default function TopicList({ topics, selectedId, onSelect, onOpenTopic }: TopicListProps) {
  return (
    <div className=" lg:h-120 h-80 gap-4 overflow-y-auto scrollbar-custom ">
      {topics.map((t) => (
        <TopicItem
          key={t.id}
          topic={t}
          isSelected={t.id === selectedId}
          onSelect={onSelect}
          onOpenTopic={onOpenTopic}       // open modal with this topic
        />
      ))}
    </div>
  )
}