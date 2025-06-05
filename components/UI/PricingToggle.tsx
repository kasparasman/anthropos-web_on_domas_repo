import React from "react";

interface PricingToggleProps {
  onPlanChange: (plan: 'monthly' | 'yearly') => void;
  disabled?: boolean;
}

export default function PricingToggle({ onPlanChange, disabled = false }: PricingToggleProps) {
  const [isYearly, setIsYearly] = React.useState(true);

  const handleToggle = (yearly: boolean) => {
    if (disabled) return;
    setIsYearly(yearly);
    onPlanChange(yearly ? 'yearly' : 'monthly');
  };

  // You can adjust these two strings to whatever you need:
  const yearlyPriceText = "9.99$";
  const monthlyPriceText = "0.99$";

  return (
    // A wrapping grid: first row = price + toggle, second row = save-text (aligned under toggle)
    <div className="flex flex-row items-center gap-4">
      {/* ───────────── 1) PRICE SECTION ───────────── */}
      <div className="w-20">
        <h2 className="text-white font-semibold text-center leading-none">
          {isYearly ? yearlyPriceText : monthlyPriceText}
        </h2>
        <div className="text-white w-full text-center leading-none">
          per {isYearly ? "year" : "month"}
        </div>
      </div>

      {/* ───────────── 2) TOGGLE + SAVE TEXT SECTION ───────────── */}
      <div className="flex flex-col items-center">
        {/*  ─────── PILL-STYLE TOGGLE ───────  */}
        <div className={`bg-gray rounded-full h-10 w-[220px] flex p-1 ${disabled ? 'opacity-50' : ''}`}>
          <button
            onClick={() => handleToggle(true)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center rounded-full transition ${
              isYearly
                ? "bg-main text-black"
                : "text-white hover:bg-white/10"
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            Yearly
          </button>
          <button
            onClick={() => handleToggle(false)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center rounded-full transition ${
              !isYearly
                ? "bg-main text-black"
                : "text-white hover:bg-white/10"
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            Monthly
          </button>
        </div>

        {/*  ─────── SAVE NOTE (only when Yearly is active) ───────  */}
        
        <div className="mt-0.5 text-sm text-white">
            Save 20% with yearly plan
        </div>
        
      </div>
    </div>
  );
}
