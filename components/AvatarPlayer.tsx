// components/AvatarPlayer.tsx
import React, { useRef, useState, useEffect } from 'react'

interface AvatarPlayerProps {
  videoUrl: string | null
  isIdle: boolean
  onVideoEnd?: () => void
}

const IDLE_VIDEO_URL = "https://storage.googleapis.com/anthropos-442507_cloudbuild/source/idle"

export default function AvatarPlayer({ videoUrl, isIdle, onVideoEnd }: AvatarPlayerProps) {
  const idleVideoRef = useRef<HTMLVideoElement | null>(null)
  const topicVideoRef = useRef<HTMLVideoElement | null>(null)
  const [topicVideoStarted, setTopicVideoStarted] = useState(false)

  // Reset states when videoUrl changes
  useEffect(() => {
    setTopicVideoStarted(false)
  }, [videoUrl])

  // Handle video opacity using complementary system
  const updateVideoOpacity = () => {
    if (idleVideoRef.current && topicVideoRef.current) {
      // Determine topic video opacity (1 if playing, 0 if not)
      const topicOpacity = (!isIdle && topicVideoStarted) ? 1 : 0
      
      // Complementary opacity system - always sums to 1
      topicVideoRef.current.style.opacity = topicOpacity.toString()
      idleVideoRef.current.style.opacity = (1 - topicOpacity).toString()
      
      console.log('Video opacity update:', { topicOpacity, idleOpacity: 1 - topicOpacity })
    }
  }

  // Always keep idle video loaded and ready
  useEffect(() => {
    if (idleVideoRef.current) {
      const setupIdleVideo = async () => {
        try {
          if (isIdle) {
            console.log('Playing idle video')
            idleVideoRef.current!.currentTime = 0
            await idleVideoRef.current!.play()
          } else {
            console.log('Pausing idle video')
            idleVideoRef.current!.pause()
          }
          updateVideoOpacity()
        } catch (error) {
          console.error('Error with idle video:', error)
        }
      }
      setupIdleVideo()
    }
  }, [isIdle])

  // Handle topic video
  useEffect(() => {
    if (topicVideoRef.current && videoUrl && !isIdle) {
      console.log('Setting up topic video:', videoUrl)
      
      const setupTopicVideo = async () => {
        try {
          topicVideoRef.current!.currentTime = 0
          setTopicVideoStarted(true)
          console.log('Playing topic video')
          await topicVideoRef.current!.play()
          updateVideoOpacity()
        } catch (error) {
          console.error('Error playing topic video:', error)
          setTopicVideoStarted(true) // Still show video even if autoplay fails
          updateVideoOpacity()
        }
      }

      // Set up event listeners
      const handleCanPlay = () => {
        if (!topicVideoStarted) {
          setupTopicVideo()
        }
      }

      topicVideoRef.current.addEventListener('canplaythrough', handleCanPlay)
      
      // Try to play immediately if already loaded
      if (topicVideoRef.current.readyState >= 4) { // HAVE_ENOUGH_DATA
        setupTopicVideo()
      }
      
      return () => {
        if (topicVideoRef.current) {
          topicVideoRef.current.removeEventListener('canplaythrough', handleCanPlay)
        }
      }
    } else if (topicVideoRef.current && (isIdle || !videoUrl)) {
      // Pause topic video when switching to idle
      topicVideoRef.current.pause()
      setTopicVideoStarted(false)
      updateVideoOpacity()
    }
  }, [videoUrl, isIdle, topicVideoStarted])

  // Update opacity whenever topicVideoStarted changes
  useEffect(() => {
    updateVideoOpacity()
  }, [topicVideoStarted, isIdle])

  const handleTopicVideoEnd = () => {
    console.log('Topic video ended')
    
    // Immediately switch to idle
    if (onVideoEnd) {
      onVideoEnd()
    }
    
    setTopicVideoStarted(false)
  }

  console.log('AvatarPlayer render:', { isIdle, videoUrl, topicVideoStarted })

  return (
    <div className="w-full lg:w-[40%] h-96 bg-black rounded-xl overflow-hidden mx-auto flex items-center justify-center relative">
      {/* Idle Video - always rendered with complementary opacity */}
      <video
        ref={idleVideoRef}
        src={IDLE_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 1 }} // Initial opacity, will be controlled by updateVideoOpacity
        preload="auto"
        playsInline
        muted
        loop
        onLoadedData={() => console.log('Idle video loaded data')}
        onCanPlay={() => console.log('Idle video can play')}
        onPlay={() => console.log('Idle video started playing')}
        onError={(e) => console.error('Idle video error:', e)}
      />
      
      {/* Topic Video - always rendered when videoUrl exists with complementary opacity */}
      {videoUrl && (
        <video
          ref={topicVideoRef}
          src={videoUrl}
          onEnded={handleTopicVideoEnd}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0 }} // Initial opacity, will be controlled by updateVideoOpacity
          preload="auto"
          playsInline
          onLoadedData={() => console.log('Topic video loaded data')}
          onCanPlay={() => console.log('Topic video can play')}
          onPlay={() => console.log('Topic video started playing')}
          onError={(e) => console.error('Topic video error:', e)}
        />
      )}
    </div>
  )
}
