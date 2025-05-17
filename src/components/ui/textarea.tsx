import * as React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
          className || ''
        }`}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
