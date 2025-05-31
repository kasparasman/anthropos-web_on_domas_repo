// components/AvatarPlayer.tsx
import React, { useRef, useState, useEffect } from 'react'
import { Play } from 'lucide-react'

interface AvatarPlayerProps {
  videoUrl: string | null
  isIdle: boolean
  onVideoEnd?: () => void
}

const IDLE_VIDEO_URL = "https://storage.googleapis.com/anthropos-442507_cloudbuild/source/idle"

export default function AvatarPlayer({ videoUrl, isIdle, onVideoEnd }: AvatarPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ended, setEnded] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Reset states when videoUrl changes
  useEffect(() => {
    setEnded(false)
    setHasStarted(false)
  }, [videoUrl])

  // Auto-play idle video or topic video
  useEffect(() => {
    if (videoRef.current) {
      if (isIdle) {
        // Idle video plays automatically and muted
        setHasStarted(true)
        videoRef.current.play()
      } else if (videoUrl) {
        // Topic video plays automatically when selected
        setHasStarted(true) 
        videoRef.current.play()
      }
    }
  }, [videoUrl, isIdle])

  const handleVideoEnd = () => {
    setEnded(true)
    if (onVideoEnd) {
      onVideoEnd() // Notify parent that video ended
    }
  }

  // Determine which video to show
  const currentVideoUrl = isIdle ? IDLE_VIDEO_URL : videoUrl
  const shouldShowPlayButton = !isIdle && !hasStarted // Only show play button for topic videos that haven't started

  const handlePlayClick = () => {
    if (videoRef.current) {
      setHasStarted(true)
      videoRef.current.play()
    }
  }

  return (
    <div className="w-full lg:w-[40%] h-96 bg-black rounded-xl overflow-hidden mx-auto flex items-center justify-center relative">
      {currentVideoUrl ? (
        <>
          <video
            ref={videoRef}
            src={currentVideoUrl}
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
            preload="metadata"
            playsInline
            muted={isIdle} // Mute idle video, unmute topic videos
            loop={isIdle} // Loop idle video
          />
          
          {/* Initial play button overlay - only for topic videos */}
          {shouldShowPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
              <button
                className="flex flex-col items-center justify-center gap-2 bg-main text-black rounded-full p-6 shadow-[0_0_24px_0_rgba(254,212,138,0.5)] hover:shadow-[0_0_32px_4px_rgba(254,212,138,0.7)] hover:scale-105 transition-all duration-200 border-2 border-main focus:outline-none focus:ring-2 focus:ring-main"
                onClick={handlePlayClick}
                aria-label="Play video"
              >
                <Play size={40} className="h-10 w-10" fill="currentColor" />
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
