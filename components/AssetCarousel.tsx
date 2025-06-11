// components/AssetCarousel.tsx
'use client'

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import AssetCard from './AssetCard'
import { Asset } from '../types/asset'

export interface AssetCarouselProps {
  assets: Asset[]            // list to render
  loop?: boolean             // enable/disable infinite loop
  autoplay?: boolean         // start auto-scrolling
  speed?: number             // scroll speed (pixels per frame) when autoplay
  onSelectAsset?: (id: string) => void  // click callback
}

export default function AssetCarousel({
  assets,
  loop = true,
  autoplay = false,
  speed = 2, // pixels per frame for smooth scrolling
  onSelectAsset,
}: AssetCarouselProps) {
  /* Embla setup with Auto Scroll plugin */
  const [emblaRef] = useEmblaCarousel(
    {
      loop,
      align: 'start',
      dragFree: true
    },
    autoplay ? [AutoScroll({
      speed,
      direction: 'forward',
      stopOnInteraction: false, // Continue scrolling after user interaction
      stopOnMouseEnter: true,   // Pause when hovering
      stopOnFocusIn: true      // Pause when focused
    })] : []
  )

  // Create array of assets, filling with placeholder assets if needed
  const displayAssets = [...assets]

  // Only add placeholder if there are no real assets
  if (displayAssets.length === 0) {
    // Add placeholders if no assets exist
    for (let i = 0; i < 5; i++) {
      displayAssets.push({
        id: `placeholder-${i}`,
        logoUrl: '/assets/logos/placeholder.svg',
        name: 'Coming Soon',
        totalInvestment: 0,
        tokenCount: 0
      });
    }
  }

  return (
    <div className="w-full overflow-x-hidden" ref={emblaRef}>
      <div className="flex">
        {/* duplicate for seamless loop */}
        {[...displayAssets, ...displayAssets].map((a, i) => (
          <div key={`${a.id}-${i}`} onClick={() => onSelectAsset?.(a.id)}>
            <AssetCard
              asset={a}
              isActive={!a.id.startsWith('placeholder')}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
