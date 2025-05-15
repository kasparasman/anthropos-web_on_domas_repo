// pages/index.tsx
import Image from 'next/image'
import VisitorCount from '../components/VisitorCount'
import React from 'react'

export default function Home() {
  // You can swap this out for <VisitorCount /> if you want live fetching
  const count = 123

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-6 md:p-24 bg-background">
      {/* Banner */}
      <section className="w-full max-w-[1120px] flex flex-col items-center gap-6">
        {/* Visitor count row */}
        <div className="flex items-center gap-3">
          <span className="text-[#E6E6E6] text-lg font-sans font-medium">
            Visitors since launch:
          </span>
          <span className="text-main text-lg font-sans font-semibold">
            {count}
          </span>
        </div>

        {/* Title + logo row */}
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <h1 className="text-[#E6E6E6] text-5xl md:text-[64px] font-mono font-extrabold tracking-[1.92px]">
            ANTHROPOS CITY
          </h1>
          <Image
            src=""
            width={72}
            height={72}
            alt="Anthropos City logo"
          />
        </div>
      </section>

      {/* Top cards */}
      <section className="w-full max-w-[1120px] flex flex-col lg:flex-row items-start lg:items-center gap-6 mt-12">
        {/* Left info card */}
        <div className="flex-shrink-0 w-full lg:w-auto bg-foreground border border-main rounded-xl p-6 flex flex-col items-center gap-6">
          <Image
            src=""
            width={96}
            height={96}
            alt="Icon"
          />

          {[
            ['Price', '$0.00000003'],
            ['Volume 24h', '$594'],
            ['Variation 24h', '10.2%'],
            ['Market Cap', '$500k'],
          ].map(([label, value]) => (
            <div key={label} className="w-full flex flex-col gap-1">
              <span className="text-zinc-400 text-base font-medium font-sans">
                {label}
              </span>
              <span className="text-foreground text-2xl font-bold font-sans">
                {value}
              </span>
            </div>
          ))}

          <button className="mt-4 px-4 py-2 bg-main text-foreground rounded-md font-sans font-semibold">
            BUY NOW
          </button>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-foreground border border-main rounded-xl p-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-zinc-300 rounded-md min-h-[200px]" />
          <div className="flex-1 flex flex-col gap-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="w-full h-36 bg-stone-800 rounded-xl border border-amber-200"
              />
            ))}
          </div>
        </div>
      </section>

      {/* City Assets */}
      <section className="w-full max-w-[1120px] flex flex-col items-center gap-10 mt-16">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-inter font-bold text-main">City Assets</h2>
          <span className="text-3xl font-inter font-bold text-main">0</span>
          <span className="text-3xl font-inter font-bold text-foreground">/100</span>
        </div>

        <div className="w-full h-48 flex gap-5 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="w-64 bg-foreground border border-stone-800 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <Image
                  src=""
                  width={36}
                  height={36}
                  alt="Asset icon"
                  className="w-9 h-9"
                />
                <span className="text-foreground text-2xl font-semibold font-sans">
                  Zinzino
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 text-base font-medium font-sans">
                  Total Investment
                </span>
                <span className="text-foreground text-xl font-bold font-sans">
                  $1562
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 text-base font-medium font-sans">
                  ACT Tokens
                </span>
                <span className="text-foreground text-xl font-bold font-sans">
                  7,777,777,777
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
