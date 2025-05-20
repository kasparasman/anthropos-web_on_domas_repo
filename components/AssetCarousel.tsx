// components/AssetCarousel.tsx
'use client'

import React, { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import AssetCard from './AssetCard'
import { Asset } from '../types/asset'

export interface AssetCarouselProps {
  assets: Asset[]            // list to render
  loop?: boolean             // enable/disable infinite loop
  autoplay?: boolean         // start auto-scrolling
  speed?: number             // scroll speed (ms) when autoplay
  onSelectAsset?: (id: string) => void  // click callback
}

export default function AssetCarousel({
  assets,
  loop = true,
  autoplay = false,
  speed = 1000,
  onSelectAsset,
}: AssetCarouselProps) {
  /* Embla setup */
  const [emblaRef, embla] = useEmblaCarousel({ loop, align: 'start', dragFree: true })

  /* autoplay */
  useEffect(() => {
    if (!autoplay || !embla) return
    let raf: number
    const next = () => {
      embla.scrollTo((embla.selectedScrollSnap() + 1) % embla.scrollSnapList().length)
      raf = window.setTimeout(next, speed)
    }
    raf = window.setTimeout(next, speed)
    return () => window.clearTimeout(raf)
  }, [autoplay, embla, speed])

  return (
    <div className="w-full overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {/* duplicate for seamless loop */}
        {[...assets, ...assets].map((a, i) => (
          <div key={`${a.id}-${i}`} onClick={() => onSelectAsset?.(a.id)}>
            <AssetCard asset={a} />
          </div>
        ))}
      </div>
    </div>
  )
}
