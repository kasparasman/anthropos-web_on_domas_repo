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
    { label: 'Variation 24h', value: `${data.variation24h}` },
    { label: 'Market Cap', value: data.marketCap },
  ]

  return (
    <div className=" border rounded-2xl border-main py-4 px-5 flex flex-col justify-between ">
      <img src="/logo.png" alt="ACT Logo" width={100} height={100} className="flex-shrink-0" />
      {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
      ))}
      <button className="w-full bg-main text-black rounded-lg px-4 py-3 font-sans font-semibold">
        BUY NOW
      </button>
    </div>
  )
}
