// components/Banner.tsx
import React from 'react'
import BannerBase, { BannerBaseProps } from './BannerBase'
import { useVisitorCount } from '../hooks/useVisitorCount'

export type BannerProps = Omit<BannerBaseProps, 'visitorCount'>

export default function Banner(props: BannerProps) {
  const { count, isLoading, error } = useVisitorCount()

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <span className="text-base font-sans text-zinc-400">Loading…</span>

      </div>
    )
  }

  if (error || count === null) {
    return (
      <div className="w-full flex justify-center py-12">
        <span className="text-base font-sans text-red-500">
          Failed to load visitor count.
        </span>
      </div>
    )
  }

  // Render the pure component with the fetched count
  return <BannerBase visitorCount={count} {...props} />
}
