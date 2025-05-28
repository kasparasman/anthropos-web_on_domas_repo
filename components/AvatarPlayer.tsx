// components/AvatarPlayer.tsx
import React, { useRef, useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

interface AvatarPlayerProps {
  videoUrl: string | null
}

export default function AvatarPlayer({ videoUrl }: AvatarPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ended, setEnded] = useState(false)

  // Reset ended state when videoUrl changes
  useEffect(() => {
    setEnded(false)
  }, [videoUrl])

  return (
    <div className="w-full lg:w-[40%] h-96 bg-black rounded-xl overflow-hidden mx-auto flex items-center justify-center relative">
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            onEnded={() => setEnded(true)}
            className="w-full h-full object-cover"
            preload="none"
            playsInline
          />
          {ended && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
              <button
                className="flex flex-col items-center justify-center gap-2 bg-main text-black rounded-full px-8 py-5 shadow-[0_0_24px_0_rgba(254,212,138,0.5)] hover:shadow-[0_0_32px_4px_rgba(254,212,138,0.7)] hover:scale-105 transition-all duration-200 border-2 border-main focus:outline-none focus:ring-2 focus:ring-main"
                onClick={() => {
                  setEnded(false)
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0
                    videoRef.current.play()
                  }
                }}
                aria-label="Replay video"
              >
                <RotateCcw size={32} className="mb-1" />
                <span className="font-bold text-lg tracking-wide">Replay</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <span className="text-dim_smoke">No video</span>
      )}
    </div>
  )
}
