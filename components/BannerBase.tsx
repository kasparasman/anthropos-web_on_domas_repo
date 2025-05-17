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
    <section className="w-full max-w-[1120px] flex flex-col items-center gap-6">
      {/* Visitor count row */}
      <div className="flex items-center gap-3">
        <span className="text-[#E6E6E6] text-lg font-sans font-medium">
          Visitors since launch:
        </span>
        <span className="text-main text-lg font-sans font-semibold">
          {visitorCount}
        </span>
      </div>

      {/* Title + logo row */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <h1 className="text-[#E6E6E6] text-5xl md:text-[64px] font-mono font-extrabold tracking-[1.92px]">
          {title}
        </h1>
        <Image src={logoUrl} width={72} height={72} alt={`${title} logo`} />
      </div>
    </section>
  )
}
