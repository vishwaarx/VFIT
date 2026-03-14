import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-text-secondary font-medium tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`glass rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all duration-200 min-h-[48px] ${error ? 'border-error/50 focus:border-error/50 focus:ring-error/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
