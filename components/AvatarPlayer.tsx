// components/AvatarPlayer.tsx
import React from 'react'

interface AvatarPlayerProps {
  videoUrl: string
}

export default function AvatarPlayer({ videoUrl }: { videoUrl: string | null }) {
    const src = videoUrl ?? ''   // empty string = nothing to play

    return (
    <div className="w-[40%] h-96 bg-black rounded-xl overflow-hidden">
      <video
        key={src}                 // reset player on change
        src={src}
        autoPlay
        muted
        loop
        className="w-full h-full object-cover"
      />
    </div>
  )
}
