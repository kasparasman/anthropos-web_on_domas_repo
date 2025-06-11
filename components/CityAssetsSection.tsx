import React from 'react';
import AssetCarousel from './AssetCarousel';
import AssetsCounter from './AssetCounter';
import TotalAssetIncome from './TotalAssetIncome';
import { useAssets } from '../lib/hooks/useAssets';

export default function CityAssetsSection() {
  const { assets, stats, loading, error } = useAssets();

  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <p className="text-red-500">Failed to load assets</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 py-6">
      {/* Assets Counter */}
      <AssetsCounter
        current={stats.assetCount}
        max={10} // Maximum planned assets
      />

      {/* Assets Carousel */}
      <div className="w-full">
        <AssetCarousel
          assets={assets}
          autoplay={true}
          speed={1.5}
        />
      </div>

      {/* Total Asset Income */}
      <div className="w-full flex justify-end pr-8">
        <div className="w-64">
          <TotalAssetIncome
            value={stats.totalInvestment}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
} 