import React from 'react';

interface TotalAssetIncomeProps {
  value: number;
  isLoading?: boolean;
}

export default function TotalAssetIncome({
  value,
  isLoading = false
}: TotalAssetIncomeProps) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

  return (
    <div className="rounded-xl border border-[#403522] bg-[linear-gradient(-45deg,#1D180F_-20%,#020202_50%,#1D180F_120%)] p-2 w-full flex flex-col relative overflow-hidden">
      <div className="flex flex-col gap-1 z-10">
        <span className="text-dim_smoke text-sm font-medium">Total Asset Income</span>
        
        {isLoading ? (
          <div className="h-8 w-32 bg-[#1D180F] animate-pulse rounded"></div>
        ) : (
          <span className="text-main text-2xl font-bold">{formattedValue}</span>
        )}
      </div>
      
      {/* Moving dots animation for the golden glow effect */}
    </div>
  );
} 