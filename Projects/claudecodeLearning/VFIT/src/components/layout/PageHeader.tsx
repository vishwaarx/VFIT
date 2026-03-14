import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  label?: string
  titleSize?: string
  titleColor?: string
  titleStyle?: 'normal' | 'italic'
  action?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  label,
  titleSize = '2xl',
  titleColor,
  titleStyle = 'normal',
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2 safe-top">
      <div>
        {label && (
          <span className="text-[10px] font-bold text-accent tracking-[2px] uppercase">{label}</span>
        )}
        <h1
          className={`text-[${titleSize}] font-bold font-[family-name:var(--font-display)] tracking-tight ${titleStyle === 'italic' ? 'italic' : ''}`}
          style={titleColor ? { color: titleColor } : undefined}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
