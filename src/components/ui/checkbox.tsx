// ✅ src/components/ui/checkbox.tsx
import React from 'react'

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500 ${className}`}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'