// pages/index.tsx
import React from 'react'

export default function Home() {
  // You can swap this out for <VisitorCount /> if you want live fetching
  const count = 123

    return (
    <main className="flex flex-col items-center bg-background p-4 md:p-6">
      <div className="max-w-5xl space-y-10">
        <Banner />
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <StatsSection data={dexData} />
          <RightPanel topics={topics} />
        </div>
        <AssetCarousel assets={assets} loop autoplay speed={4000} />
      </div>

    </main>
  )
}
