// components/StatsSection.tsx
import React from 'react'
import StatsCard from './StatsCard'
import { DexToolsResponse } from '../types/dex-tools'

interface StatsSectionProps {
  data: DexToolsResponse
}

export default function StatsSection({ data }: StatsSectionProps) {
  const cards: { label: string; value: number | string }[] = [
    { label: 'Price', value: data.price },
    { label: 'Volume 24h', value: data.volume24h },
    { label: 'Variation 24h', value: data.variation24h },
    { label: 'Market Cap', value: data.mcap ?? 0 },
  ]

  return (
    <div className=" bg-[linear-gradient(-45deg,#3A301F_-10%,#020202_50%,#3A301F_110%)] w-full lg:w-min mx-auto max-w-120 md:max-w-none border rounded-2xl border-main py-4 px-5 gap-4 flex lg:flex-col lg:justify-between md:flex-row md:items-center order-last lg:order-first flex-col items-center">
      <img src="/ACT.png" alt="ACT Logo" width={100} height={100} className="lg:mx-auto flex-shrink md:w-22 md:h-22 lg:w-25 lg:h-25 w-25 h-25" />
      <div className="h-full w-full flex lg:flex-col lg:justify-between md:flex md:flex-row md:justify-between md:gap-2 grid grid-cols-2 gap-4 ">
        {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
        ))}
        </div>
      <button
        className="whitespace-nowrap lg:w-full bg-main text-black rounded-lg px-6 py-3 font-sans font-semibold transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]"
      >
        BUY NOW
      </button>
    </div>
  )
}