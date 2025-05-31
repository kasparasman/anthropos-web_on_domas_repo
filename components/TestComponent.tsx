import React from 'react';
import Image from 'next/image';
import Navbar from './Navbar';
import BannerBase from './BannerBase';
import StatsSection from './StatsSection';
import AssetCard from './AssetCard';
import AssetsCounter from './AssetCounter';

// Mock data for assets
const assets = [
    {
        id: '1',
        logoUrl: '/assets/assetcard-vector-1.png',
        name: 'Zinzino',
        totalInvestment: 1562,
        tokenCount: 7777777777,
    },
    {
        id: '2',
        logoUrl: '/assets/assetcard-vector-2.png',
        name: 'Zinzino',
        totalInvestment: 1562,
        tokenCount: 7777777777,
    },
    {
        id: '3',
        logoUrl: '/assets/assetcard-vector-3.png',
        name: 'Zinzino',
        totalInvestment: 1562,
        tokenCount: 7777777777,
    },
    {
        id: '4',
        logoUrl: '/assets/assetcard-vector-4.png',
        name: 'Zinzino',
        totalInvestment: 1562,
        tokenCount: 7777777777,
    },
    {
        id: '5',
        logoUrl: '/assets/assetcard-vector-5.png',
        name: 'Zinzino',
        totalInvestment: 1562,
        tokenCount: 7777777777,
    },
];

// Mock data for stats
const stats = {
    price: '$0.0003',
    volume24h: '$594',
    variation24h: '+10.2%',
    marketCap: '$500k',
    mcap: '$500k',
};

export default function TestComponent() {
    return (
        <div className="bg-background min-h-screen flex flex-col items-center" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
            {/* Navbar */}
            <div className="w-full max-w-[360px] mx-auto">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray">
                    <span className="text-xl font-bold text-smoke">Anthropos City</span>
                    <div className="flex flex-col gap-1 w-6 h-6 justify-center items-center">
                        <Image src="/assets/navbar-vector-7.svg" alt="menu-bar-1" width={24} height={2} />
                        <Image src="/assets/navbar-vector-8.svg" alt="menu-bar-2" width={24} height={2} />
                        <Image src="/assets/navbar-vector-9.svg" alt="menu-bar-3" width={24} height={2} />
                    </div>
                </div>
            </div>

            {/* Hero/Banner */}
            <div className="w-full max-w-[360px] mx-auto px-4 mt-8 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-dim_smoke text-base font-medium">Visitors since launch:</span>
                        <span className="text-main text-base font-semibold">100000</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[30px] font-extrabold tracking-wider text-smoke" style={{ fontFamily: 'Monument Extended, Montserrat, sans-serif' }}>ANTHROPOS CITY</span>
                        <div className="relative w-10 h-10">
                            <Image src="/assets/hero-image-32.png" alt="hero" fill className="object-cover rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Price/Stats Section */}
                <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col items-center border border-main rounded-xl p-4 bg-gradient-to-br from-[#3A301F] via-[#020202] to-[#3A301F]">
                        <div className="flex flex-col md:flex-row gap-6 w-full justify-between">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative w-24 h-24 mb-2">
                                    <Image src="/assets/token-image-5.png" alt="token" fill className="object-cover rounded-full" />
                                </div>
                                <span className="text-dim_smoke text-base font-medium">Token</span>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-dim_smoke text-sm">Price</span>
                                    <span className="text-smoke text-xl font-bold">{stats.price}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-dim_smoke text-sm">Vol. 24h</span>
                                    <span className="text-smoke text-xl font-bold">{stats.volume24h}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-dim_smoke text-sm">% 24h</span>
                                    <span className="text-smoke text-xl font-bold">{stats.variation24h}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-dim_smoke text-sm">MCap</span>
                                    <span className="text-smoke text-xl font-bold">{stats.marketCap}</span>
                                </div>
                            </div>
                        </div>
                        <button className="mt-6 bg-main text-black rounded-lg px-6 py-3 font-semibold transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]">BUY NOW</button>
                    </div>
                </div>

                {/* Asset Section */}
                <div className="w-full flex flex-col gap-4 mt-8">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-main">City Assets</span>
                        <span className="text-2xl font-bold text-main">0</span>
                        <span className="text-2xl font-bold text-smoke">/100</span>
                    </div>
                    <div className="flex flex-row gap-4 overflow-x-auto scrollbar-custom">
                        {assets.map((asset) => (
                            <div key={asset.id} className="flex-shrink-0">
                                <AssetCard asset={asset} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
