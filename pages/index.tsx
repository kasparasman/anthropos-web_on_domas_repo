// pages/index.tsx
import React from 'react'
import Banner from '../components/Banner'
import AssetsCounter from '@/components/AssetCounter'
import AssetCarousel from '../components/AssetCarousel'
import TotalAssetIncome from '@/components/TotalAssetIncome'
import dynamic from 'next/dynamic'

import Input from '@/components/UI/input'
import MainButton from '@/components/UI/button'
import PricingToggle from '@/components/UI/PricingToggle'

import { DexToolsResponse } from '../types/dex-tools'
import { Topic } from '../types/topic'
import { Asset } from '../types/asset'

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
const StatsSection = dynamic(() => import('../components/StatsSection'), { ssr: false })
const RightPanel = dynamic(() => import('../components/RightPanel'), { ssr: false })

interface HomeProps {
  dexData: DexToolsResponse
  topics: Topic[]
  assets: Asset[]
  currentAssets: number
  maxAssets: number
  totalAssetIncome: number
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
  totalAssetIncome
}: HomeProps) {
  return (
    <main className=" relative flex flex-col items-center">
      {/* Background */}      
      <div className="h-full flex fixed justify-between bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
        <img
          src="/BurjKalifa.png"
          alt="background"
          className="hidden lg:block ml-[-50px] opacity-100 pointer-events-none"
        />
        <img
          src="/Building2.png"
          alt="background"
          className="hidden lg:block lg:mr-[-250px] opacity-100 pointer-events-none"
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
      <div className="max-w-5xl w-full space-y-10 my-10">
        <Banner />

        <div className="flex flex-col lg:flex-row gap-6 w-full px-4 flex-grow">
          <StatsSection data={dexData} />
          <RightPanel topics={topics} />
        </div>

        {/* Container for AssetsCounter (left) and TotalAssetIncome (right) */}
        <div className="w-full flex flex-col justify-between items-center pt-4 relative">
          <AssetsCounter current={currentAssets} max={maxAssets} />
          <TotalAssetIncome value={totalAssetIncome} />
        </div>
        
        {/* Assets Carousel */}
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
import Button from '@/components/UI/button'

interface RawTopic {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  videoUrl: string;
  topicLikes: { userId: string | null }[];
}

interface RawTopicLike {
  userId: string | null;
}

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

  const raw: RawTopic[] = await prisma.topic.findMany({ 
    orderBy: { createdAt: 'desc' },        
    select: {
      id: true,
      title: true,
      body: true,          
      createdAt: true,     
      videoUrl: true,                      
      topicLikes: { select: { userId: true } }, 
    },
  })
  
  const topics: Topic[] = raw.map((t: RawTopic) => ({
    id: t.id,
    title: t.title,
    body: t.body,          
    createdAt: t.createdAt.toISOString(), 
    videoUrl: t.videoUrl,
    likes: t.topicLikes.length,
    likedByUser: userId ? t.topicLikes.some((l: RawTopicLike) => l.userId === userId) : false,
  }))

  /* 3) Assets --------------------------------------------------------- */
  
  let assets: Asset[] = []
  let currentAssets = 0
  const maxAssets = 10 // Corrected to const as it's not reassigned
  let totalAssetIncome = 0

  try {
    
    const rawAssets = await prisma.$queryRaw<Asset[]>`
      SELECT id, name, description, "logoUrl", "websiteUrl", 
             "totalInvestment", "tokenCount", "order", "isActive"
      FROM assets
      WHERE "isActive" = true
      ORDER BY "order" ASC
    `;
    
    if (rawAssets && Array.isArray(rawAssets)) {
      assets = rawAssets;
      currentAssets = assets.length;
      
      totalAssetIncome = assets.reduce((sum, asset) => {
        const investmentValue = asset.totalInvestment;
        let numericInvestment = 0;

        if (typeof investmentValue === 'number') {
          numericInvestment = investmentValue;
        } else if (typeof investmentValue === 'string') {
          const parsed = parseFloat(investmentValue);
          if (!isNaN(parsed)) {
            numericInvestment = parsed;
          }
        } // If investmentValue is null, undefined, or a non-parseable string, numericInvestment remains 0.
        
        return sum + numericInvestment;
      }, 0);
    }
  } catch (error) {
    console.error('Error fetching assets:', error);
    
  }

  return {
    props: {
      dexData,
      topics,
      assets,
      currentAssets,
      maxAssets,
      totalAssetIncome
    },
  }
}
