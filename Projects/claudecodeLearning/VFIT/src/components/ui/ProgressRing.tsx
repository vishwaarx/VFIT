interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

export function ProgressRing({ value, max, size = 80, strokeWidth = 5, className = '', label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference - progress * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/5"
        />
        {/* Gradient progress */}
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold">{value}/{max}</span>
        {label && <span className="text-[10px] text-text-muted">{label}</span>}
      </div>
    </div>
  )
}
