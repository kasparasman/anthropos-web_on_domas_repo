// components/AvatarPlayer.tsx
import React from 'react'

interface AvatarPlayerProps {
  videoUrl: string
}

export default function AvatarPlayer({ videoUrl }: { videoUrl: string | null }) {
  return (
    <div className="w-full lg:w-[40%] h-96 bg-black rounded-xl overflow-hidden mx-auto flex items-center justify-center">
      {videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-dim_smoke">No video</span>
      )}
    </div>
  )
}
