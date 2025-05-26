// components/StatsCard.tsx
import React from 'react'

export interface StatsCardProps {
  label: string
  value: number | string
}

// Helper: parse "$0.0000000056" → 0.0000000056
function parseDollarString(str: string | number | undefined): number | null {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return null;
  const cleaned = str.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// Helper: format price like DEXTools (e.g. 0.0₈5601)
function formatDexToolsPrice(val: number): React.ReactNode {
  if (val >= 0.01) return val.toLocaleString();
  const str = val.toFixed(18).replace(/0+$/, '');
  const match = str.match(/^0\.(0+)([1-9]\d*)$/);
  if (!match) return val.toLocaleString();
  const zeroCount = match[1].length;
  const rest = match[2];
  const subscript = String(zeroCount).split('').map(d => String.fromCharCode(0x2080 + Number(d))).join('');
  return <>0.0{subscript}{rest}</>;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  let displayValue: React.ReactNode = value;
  const isDollar = typeof value === 'string' && value.trim().startsWith('$');
  const parsed = parseDollarString(value);

  if (label.toLowerCase().includes('price') && parsed !== null) {
    displayValue = <>{'$'}{formatDexToolsPrice(parsed)}</>;
  } else if (
    (label.toLowerCase().includes('volume') ||
     label.toLowerCase().includes('market cap')) &&
    parsed !== null
  ) {
    displayValue = <>{'$'}{parsed.toLocaleString()}</>;
  } else if (parsed === null && isDollar) {
    displayValue = value; // fallback to original string if parsing fails
  }

  if (parsed === null && !isDollar) {
    displayValue = '—';
  }

  return (
    <div className="flex-shrink-0 rounded-xl flex flex-col gap-1.5 text-center md:text-left">
      <div className="text-dim_smoke font-medium font-sans">{label}</div>
      <div className="text-smoke text-2xl font-bold font-sans">{displayValue}</div>
    </div>
  );
}