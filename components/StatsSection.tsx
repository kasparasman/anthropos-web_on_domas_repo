// components/StatsSection.tsx
import React from 'react'
import StatsCard from './StatsCard'
import { DexToolsResponse } from '../types/dex-tools'

interface StatsSectionProps {
  data: DexToolsResponse
}

export default function StatsSection({ data }: StatsSectionProps) {
  const cards: { label: string; value: number | string }[] = [
    { label: 'Price',        value: data.price },
    { label: 'Volume 24h',   value: data.volume24h },
    { label: 'Variation 24h', value: `${data.variation24h}%` },
    { label: 'Market Cap',   value: data.marketCap },
  ]

  return (
    <section className="w-full max-w-[1120px] inline-flex justify-start items-start gap-6 overflow-x-auto py-8">
      {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
      ))}
    </section>
  )
}
