import React from 'react'

interface CityAssetsProps {
  current: number
  max: number
}

export default function AssetsCounter({ current, max }: CityAssetsProps) {
  return (
    <div className="w-full flex justify-center items-center gap-2">
      {/* Label */}
      <span className="text-3xl font-bold text-main">
        City Assets
      </span>

      {/* Counter */}
      <span className="text-3xl font-bold text-main">
        {current}
      </span>
      <span className="text-3xl font-bold text-dim_smoke">
        / {max}
      </span>
    </div>
  )
}
