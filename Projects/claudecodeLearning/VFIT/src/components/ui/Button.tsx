import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variants = {
  primary: 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover hover:shadow-accent/30 active:scale-[0.97]',
  secondary: 'bg-card border border-border text-text-primary hover:bg-card-hover active:scale-[0.97]',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-card transition-colors',
  danger: 'bg-error-muted text-error border border-error/20 hover:bg-error/20',
}

const sizes = {
  sm: 'px-3.5 py-2 text-sm rounded-lg',
  md: 'px-5 py-3 text-[15px] rounded-lg',
  lg: 'px-6 py-3.5 text-base rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`font-semibold transition-all duration-200 min-h-[48px] inline-flex items-center justify-center gap-2 cursor-pointer ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-40 pointer-events-none' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
