// components/StatsCard.tsx
import React from 'react'

export interface StatsCardProps {
  label: string
  value: number | string
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="flex-shrink-0 rounded-xl flex flex-col gap-1.5 text-center md:text-left">
      <div className="text-dim_smoke font-medium font-sans">{label}</div>
      <div className="text-smoke text-2xl font-bold font-sans">{value}</div>
    </div>
  )
}