// pages/index.tsx
import React from 'react'
import Banner from '../components/Banner'
import StatsSection from '../components/StatsSection'
import RightPanel from '../components/RightPanel'
import AssetsCounter from '@/components/AssetCounter'
import AssetCarousel from '../components/AssetCarousel'
import GridWithRays from '@/components/GridWithRays'


import { DexToolsResponse } from '../types/dex-tools'
import { Topic } from '../types/topic'
import { Asset } from '../types/asset'

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface HomeProps {
  dexData: DexToolsResponse
    topics: Topic[]
  assets: Asset[]
  currentAssets: number
  maxAssets: number
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */
export default function Home({
  dexData,
  topics,
  assets,
  currentAssets,
  maxAssets,
}: HomeProps) {
  return (
    <main className=" realtive flex flex-col items-center p-4 md:p-6">
      {/* Background */}
      <GridWithRays/>

      
      <div className="h-full flex fixed justify-between bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
        <img
          src="/BurjKalifa.png"
          alt="background"
          className="hidden lg:block ml-[-100px] object-cover opacity-100 pointer-events-none"
        />
        <img
          src="/Building2.png"
          alt="background"
          className="hidden lg:block mr-[-500px] object-cover opacity-100 pointer-events-none"
        />
        <div
          className="w-full absolute z-[1] bottom-[-40px] left-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/people.png)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom',
            backgroundSize: 'auto 100%',
            height: '200px', // adjust height as needed to fit your image
          }}
          aria-hidden="true"
        />

      </div>
      <div className="max-w-5xl w-full space-y-10">
        <Banner />

        <div className="flex flex-col lg:flex-row gap-6 w-full flex-grow">
          <StatsSection data={dexData} />
          <RightPanel topics={topics} />
        </div>

        {/* ← Assets Counter */}
        <AssetsCounter current={currentAssets} max={maxAssets} />

        <AssetCarousel assets={assets} loop autoplay speed={2000} />
      </div>
      
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Server-side data fetching                                         */
/* ------------------------------------------------------------------ */
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/authOptions'
import { prisma } from '../lib/prisma'
import type { GetServerSidePropsContext } from 'next'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  /* 1) DexTools stats ------------------------------------------------ */
  const dexRes = await fetch(
    'https://anthroposcity-tokens.anthroposcity.workers.dev/dextoolsStats'
  )
  if (!dexRes.ok) return { notFound: true }
  const dexData: DexToolsResponse = await dexRes.json()

  /* 2) Topics + likes ------------------------------------------------ */
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  const userId = session?.user?.id ?? null

  const raw = await prisma.topic.findMany({  // Changed: topic instead of topics
    orderBy: { createdAt: 'desc' },         // Changed: createdAt instead of date
    select: {
      id: true,
      title: true,
      body: true,           // Added
      createdAt: true,      // Added  
      videoUrl: true,                       // Changed: videoUrl instead of video_url
      topicLikes: { select: { userId: true } }, // Changed: topicLikes instead of likes
    },
  })
  
  const topics: Topic[] = raw.map((t) => ({
    id: t.id,
    title: t.title,
    body: t.body,           // Added
    createdAt: t.createdAt.toISOString(), // Convert Date to ISO string
    videoUrl: t.videoUrl,
    likes: t.topicLikes.length,
    likedByUser: userId ? t.topicLikes.some((l) => l.userId === userId) : false,
  }))
  /* 3) Assets --------------------------------------------------------- */
  // your real data or mock
  const assets: Asset[] = [
    { id: 'zinzino',  logoUrl: '', name: 'Zinzino',     totalInvestment: 1562, tokenCount: 7_777_777_777 },
    { id: 'alphacorp',logoUrl: '', name: 'AlphaCorp',   totalInvestment: 2300, tokenCount: 4_200_000_000 },
    { id: 'betacorp', logoUrl: '', name: 'BetaCorp',    totalInvestment: 2300, tokenCount: 4_200_000_000 },
    { id: 'gammatech',logoUrl: '', name: 'GammaTech',   totalInvestment: 1800, tokenCount: 3_500_000_000 },
    { id: 'deltainc', logoUrl: '', name: 'DeltaInc',    totalInvestment: 2750, tokenCount: 5_100_000_000 },
  ]

  // ← your counter values
  const currentAssets = 0
  const maxAssets = 100

  return {
    props: {
      dexData,
      topics,
      assets,
      currentAssets,
      maxAssets,
    },
  }
}
