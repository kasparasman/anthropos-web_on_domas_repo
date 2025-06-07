// components/DiscountStar.tsx
import React from 'react'

interface DiscountStarProps {
  /** e.g. "10%" */
  discount: string
}

const DiscountStar: React.FC<DiscountStarProps> = ({ discount }) => (
  <div className="absolute right-0 bottom-0 inline-block w-20 h-20 rotate-[12deg]">
    <img
      src="/discount.png"
      alt="star burst background"
      className="w-full h-full object-contain"
    />
    <div className="absolute inset-0 flex flex-col items-center justify-center text-black filter drop-shadow-lg">
      <span className="text-xl font-bold leading-none mt-1.5">
        {discount}
      </span>
      <span className="text-base font-medium -mt-1.5">
        OFF
      </span>
    </div>
  </div>
)

export default DiscountStar
