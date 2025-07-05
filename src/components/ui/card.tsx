import React from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'



interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}
    {...props}
  />
))
Card.displayName = 'Card'

export default Card
