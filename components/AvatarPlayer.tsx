// components/AvatarPlayer.tsx
'use client'

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
  const previousVideoUrlRef = useRef<string | null>(null)

  // Reset states when videoUrl changes or when switching to idle
  useEffect(() => {
    if (videoUrl !== previousVideoUrlRef.current || isIdle) {
      setTopicVideoStarted(false)
      if (topicVideoRef.current) {
        topicVideoRef.current.pause()
        topicVideoRef.current.currentTime = 0
      }
      previousVideoUrlRef.current = videoUrl
    }
  }, [videoUrl, isIdle])

  // Handle video opacity using complementary system
  const updateVideoOpacity = () => {
    if (idleVideoRef.current && topicVideoRef.current) {
      // Determine topic video opacity (1 if playing, 0 if not)
      const topicOpacity = (!isIdle && topicVideoStarted) ? 1 : 0
      
      // Complementary opacity system - always sums to 1
      topicVideoRef.current.style.opacity = topicOpacity.toString()
      idleVideoRef.current.style.opacity = (1 - topicOpacity).toString()
    }
  }

  // Always keep idle video loaded and ready
  useEffect(() => {
    if (idleVideoRef.current) {
      const setupIdleVideo = async () => {
        try {
          if (isIdle) {
            await idleVideoRef.current!.play()
          } else {
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
    if (!topicVideoRef.current || !videoUrl || isIdle) {
      return
    }

    const videoElement = topicVideoRef.current

    const setupTopicVideo = async () => {
      try {
        // Reset video state
        videoElement.currentTime = 0
        videoElement.src = videoUrl
        
        await videoElement.load()
        setTopicVideoStarted(true)
        await videoElement.play()
        updateVideoOpacity()
      } catch (error) {
        console.error('Error playing topic video:', error)
        setTopicVideoStarted(false)
      }
    }

    // Set up event listeners
    const handleCanPlay = () => {
      if (!topicVideoStarted) {
        setupTopicVideo()
      }
    }

    videoElement.addEventListener('canplaythrough', handleCanPlay)
    
    // Try to play immediately if already loaded
    if (videoElement.readyState >= 4) {
      setupTopicVideo()
    }
    
    return () => {
      videoElement.removeEventListener('canplaythrough', handleCanPlay)
      videoElement.pause()
      videoElement.currentTime = 0
      setTopicVideoStarted(false)
    }
  }, [videoUrl, isIdle])

  // Update opacity whenever relevant states change
  useEffect(() => {
    updateVideoOpacity()
  }, [topicVideoStarted, isIdle])

  const handleTopicVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd()
    }
    setTopicVideoStarted(false)
  }

  return (
    <div className="w-full lg:w-[40%] h-96 max-w-50 bg-black rounded-xl overflow-hidden mx-auto my-auto flex items-center justify-center relative">
      {/* Idle Video - always rendered with complementary opacity */}
      <video
        ref={idleVideoRef}
        src={IDLE_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: 1 }}
        preload="auto"
        playsInline
        muted
        loop
      />
      
      {/* Topic Video - always rendered when videoUrl exists with complementary opacity */}
      {videoUrl && (
        <video
          ref={topicVideoRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: 0 }}
          preload="auto"
          playsInline
          onEnded={handleTopicVideoEnd}
        />
      )}
    </div>
  )
}
