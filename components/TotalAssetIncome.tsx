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
    <div className=" px-4 py-2 relative overflow-hidden ">
      <div className="flex flex-row gap-2 items-center">
        <span className="text-smoke text-xl font-regualr whitespace-nowrap">Total Asset Income:</span>
        
        {isLoading ? (
          <div className="h-8 w-32 animate-pulse rounded"></div>
        ) : (
          <span className="text-smoke text-xl font-semibold">{formattedValue}</span>
        )}
      </div>
    </div>
  );
} 