import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  variant?: 'glass' | 'solid' | 'elevated' | 'accent'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

const variants = {
  glass: 'bg-card border border-border',
  solid: 'bg-card-solid border border-border',
  elevated: 'bg-card-elevated border border-border',
  accent: 'bg-accent-subtle border border-accent/20',
}

export function Card({ children, padding = 'md', hover = false, variant = 'glass', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${hover ? 'hover:bg-card-hover cursor-pointer transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
