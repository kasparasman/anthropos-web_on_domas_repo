// components/BannerBase.tsx
import React from 'react'
import Image from 'next/image'

export interface BannerBaseProps {
  visitorCount: number | string
  title?: string
  logoUrl?: string
}

export default function BannerBase({
  visitorCount,
  title = 'ANTHROPOS CITY',
  logoUrl = '',
}: BannerBaseProps) {
  return (
    <section className="w-full flex flex-col items-center sm: gap-2 md:gap-3">
      {/* Visitor count row */}
      <div className="flex items-center gap-1 md:gap-2">
        <span className="text-smoke sm:text-xl font-sans font-medium">
          Visitors since launch:
        </span>
        <span className="text-main sm:text-xl font-sans font-medium">
          {visitorCount}
        </span>
      </div>

      {/* Title + logo row */}
      <div className="flex flex-wrap items-center md:gap-3 gap-2 justify-center">
        <h1 className="text-smoke lg:text-6xl md:text-5xl text-3xl font-u font-extrabold tracking-wide">
          {title}
        </h1>
        <div className="relative lg:w-[72px] lg:h-[72px] md:w-14 md:h-14 w-9 h-9">
          <Image
          src={logoUrl}
          alt={`${title} logo`}
          fill
          className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
