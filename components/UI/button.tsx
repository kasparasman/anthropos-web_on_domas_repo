// components/MainButton.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Choose between:
   *  - "solid"  (default): uses bg-main text-black
   *  - "outline": transparent background + border (border-color & text-color come from `className`)
   */
  variant?: "solid" | "outline";
}

const MainButton: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "solid",
  ...props
}) => {
  // Base layout classes (same for both variants)
  const baseClasses =
    "flex items-center justify-center font-semibold px-4 rounded-full transition-all duration-200 hover:shadow-[0_0px_16px_0_rgba(254,212,138,0.5)]";

  // Variant‐specific classes
  const variantClasses =
    variant === "solid"
      ? "bg-main text-black py-2"
      : // outline: transparent bg, border, inherit text‐color from className
        "bg-transparent border border-current";

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default MainButton;
