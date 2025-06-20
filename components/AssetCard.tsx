// components/AssetCard.tsx
'use client'
import Image from 'next/image'
import React from 'react'
import { Asset } from '../types/asset'
import DiscountStar from './DiscountStar'

interface AssetCardProps {
  asset: Asset
  isActive?: boolean
}

export default function AssetCard({ asset, isActive = false }: AssetCardProps) {
  return (

      <div className="w-64 h-50 flex items-center justify-center rounded-xl border border-[#403522] bg-black flex relative mr-5 p-0.5 overflow-hidden" >

        <div className="flex-shrink-0 px-5 py-4 rounded-xl bg-[linear-gradient(-45deg,#1D180F_-20%,#020202_50%,#1D180F_120%)] flex flex-col gap-3 z-2 w-63 h-49">

          {isActive ? (
            <>
              {/* header */}
              <div className="flex h-auto items-center gap-3">
                <Image src={asset.logoUrl} alt={asset.name} width={36} height={36} className="w-9 h-9" />
                <span className="text-smoke text-xl font-semibold">{asset.name}</span>
              </div>

              {/* investment */}
              <div className="flex flex-col gap-1">
                <span className="text-dim_smoke text-base font-regular">Total Investment</span>
                <span className="text-smoke text-xl font-bold">${asset.totalInvestment.toLocaleString()}</span>
              </div>

              {/* tokens */}
              <div className="flex flex-col gap-1">
                <span className="text-dim_smoke text-base font-regular">ACT Tokens</span>
                <span className="text-smoke text-xl font-bold">{asset.tokenCount.toLocaleString()}</span>
              </div>
              <DiscountStar discount="20%" />
            </>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <span className="text-smoke text-2xl font-semibold">Coming Soon....</span>
            </div>
          )}
        </div>
        {/*moving dots*/}
        <div className="absolute -bottom-[25px] -right-[25px] h-14 w-14 bg-main absolute animate-move-around"></div>
        <div className="h-14 w-14 bg-main absolute animate-move-around2"></div>
      </div>
  )
}
