// components/AvatarPlayer.tsx
import React from 'react'

interface AvatarPlayerProps {
  videoUrl: string
}

export default function AvatarPlayer({ videoUrl }: AvatarPlayerProps) {
  return (
    <div className="w-full h-96 bg-black rounded-xl overflow-hidden">
      <video
        key={videoUrl}                 // reset player on change
        src={videoUrl}
        autoPlay
        muted
        loop
        className="w-full h-full object-cover"
      />
    </div>
  )
}
