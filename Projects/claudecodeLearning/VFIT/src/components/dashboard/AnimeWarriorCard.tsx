import { useMemo } from 'react'
import { WARRIOR_TIERS } from '@/lib/constants'

interface AnimeWarriorCardProps {
  streakDays: number
}

export function AnimeWarriorCard({ streakDays }: AnimeWarriorCardProps) {
  const { tier, nextTier, progress } = useMemo(() => {
    let currentTier = WARRIOR_TIERS[0]
    let nextTierData = WARRIOR_TIERS[1]

    for (let i = WARRIOR_TIERS.length - 1; i >= 0; i--) {
      if (streakDays >= WARRIOR_TIERS[i].day) {
        currentTier = WARRIOR_TIERS[i]
        nextTierData = WARRIOR_TIERS[i + 1] ?? WARRIOR_TIERS[i]
        break
      }
    }

    const tierStart = currentTier.day
    const tierEnd = nextTierData.day
    const prog = tierEnd > tierStart
      ? (streakDays - tierStart) / (tierEnd - tierStart)
      : 1

    return { tier: currentTier, nextTier: nextTierData, progress: Math.min(prog, 1) }
  }, [streakDays])

  // CSS scale interpolation: character grows within each tier
  const scale = 0.88 + progress * 0.14

  return (
    <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-card border border-border">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(255,69,0,${0.05 + progress * 0.15}) 0%, #0A0A0A 60%, #1A1A1A 100%)`,
        }}
      />

      {/* Character image */}
      <div className="absolute right-0 top-0 w-[200px] h-[200px] flex items-center justify-center">
        <img
          src={tier.image}
          alt={tier.name}
          className="w-full h-full object-contain transition-transform duration-700 ease-out"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {/* Left fade for text readability */}
      <div
        className="absolute inset-y-0 left-0 w-[200px]"
        style={{ background: 'linear-gradient(90deg, #0A0A0AFF 0%, #0A0A0A00 100%)' }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[60px]"
        style={{ background: 'linear-gradient(180deg, #0A0A0A00 0%, #0A0A0AEE 100%)' }}
      />

      {/* Ambient glow */}
      <div
        className="absolute rounded-full blur-[30px]"
        style={{
          right: '60px',
          top: '40px',
          width: '80px',
          height: '80px',
          background: '#FF4500',
          opacity: 0.04 + progress * 0.08,
        }}
      />

      {/* Text overlay */}
      <div className="absolute left-5 top-6 flex flex-col gap-2">
        <span className="text-[10px] font-bold text-accent tracking-[2px]">
          STREAK
        </span>
        <span
          className="text-[64px] font-bold text-white leading-none font-[family-name:var(--font-display)] tracking-tighter"
          style={{ textShadow: '0 0 20px rgba(255,69,0,0.4)' }}
        >
          {streakDays}
        </span>
        <span className="text-[13px] font-bold text-text-secondary tracking-[2px]">
          DAYS STRONG
        </span>
        <span className="text-[13px] font-medium text-accent">
          {tier.name}
        </span>
      </div>
    </div>
  )
}
