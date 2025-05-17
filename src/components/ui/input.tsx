// src/components/ui/input.tsx
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && <label className="block text-sm font-medium mb-1">{label}</label>}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 ${className}`}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
