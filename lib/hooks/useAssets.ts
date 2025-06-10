import { useState, useEffect } from 'react';
import { Asset } from '../types/asset';

type AssetStats = {
  totalInvestment: number;
  totalTokens: number;
  assetCount: number;
};

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats>({
    totalInvestment: 0,
    totalTokens: 0,
    assetCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        setLoading(true);
        const response = await fetch('/api/assets');
        
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        
        const data = await response.json();
        setAssets(data.assets);
        setStats(data.stats);
        setError(null);
      } catch (err) {
        console.error('Error loading assets:', err);
        setError('Failed to load assets');
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  return {
    assets,
    stats,
    loading,
    error
  };
} 