// components/StatsCard.tsx
import React from 'react'

export interface StatsCardProps {
  label: string
  value: number | string
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="flex-shrink-0 w-full sm:w-64 px-5 py-4 rounded-xl border border-main bg-foreground flex flex-col gap-2">
      <div className="text-zinc-400 text-base font-medium font-sans">{label}</div>
      <div className="text-foreground text-2xl font-bold font-sans">{value}</div>
    </div>
  )
}
