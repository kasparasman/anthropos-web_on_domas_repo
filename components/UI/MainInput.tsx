import React, { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // You can add specific props here if needed,
  // but extending InputHTMLAttributes covers most cases.
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`
        w-full 
        px-4
        py-2
        rounded-md 
        bg-[#262626]
        border 
        border-gray 
        text-smoke 
        placeholder-dim_smoke 
        focus:outline-none 
        focus:ring-1 
        focus:ring-dim_smoke 
        transition-colors 
        duration-200
        ${className || ''}
      `}
      {...props}
    />
  )
}

export default Input

