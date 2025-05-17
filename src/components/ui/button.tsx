// ✅ components/ui/button.tsx
import React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'destructive' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded font-semibold focus:outline-none transition-colors duration-200'
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-green-600 text-green-700 hover:bg-green-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className || ''}`}
      {...props}
    />
  )
}
