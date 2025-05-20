// pages/index.tsx
import React from 'react'
import Banner from '../components/Banner'
import StatsSection from '../components/StatsSection'
import RightPanel from '../components/RightPanel'
import { DexToolsResponse } from '../types/dex-tools'
import { Topic } from '../types/topic'
import AssetCarousel from '../components/AssetCarousel'
import { Asset } from '../types/asset'
import { mockTopics }    from '../data/mockTopics'


/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface HomeProps {
  dexData: DexToolsResponse
topics: Topic[]
  assets: Asset[]

}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */
export default function Home({ dexData, topics, assets  }: HomeProps) {

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

/* ------------------------------------------------------------------ */
/*  Server-side data fetching                                         */
/* ------------------------------------------------------------------ */
import { getServerSession }  from 'next-auth/next'
import { authOptions }      from '../lib/authOptions'
import { prisma }           from '../lib/prisma'
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
  const userId  = session?.user?.id ?? null

  /*  Query Prisma: each topic + its likes array  */
  const raw = await prisma.topics.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      video_url: true,
      likes: { select: { user_id: true } },
    },
  })

  const topics: Topic[] = raw.map((t: Topic) => ({
    id:            t.id,
    title:         t.title,
    videoUrl:      t.videoUrl ?? null,   // ← null-coalesce
    likes:         t.likes.length,
    likedByUser:   userId ? t.likes.some((l) => l.user_id === userId) : false,
  }))
  /* 3) Assets ------------------------------------------------------ */
  // ⬇️ Replace this mock block with a real Prisma query or external fetch
  const assets: Asset[] = [
    {
      id: 'zinzino',
      logoUrl: '',
      name: 'Zinzino',
      totalInvestment: 1562,
      tokenCount: 7_777_777_777,
    },
    {
      id: 'alphacorp',
      logoUrl: '',
      name: 'AlphaCorp',
      totalInvestment: 2300,
      tokenCount: 4_200_000_000,
    },
    // …more mock rows
  ]

  return {
    props: {
      dexData,
      topics: mockTopics,
      assets 
    },
  }
}
