import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Shield } from 'lucide-react'
import { HERO_TIERS } from '@/lib/constants'

interface PowerLevelCardProps {
  totalVolume: number
  prCount: number
  streakDays: number
  badgeCount: number
}

export function PowerLevelCard({ totalVolume, prCount, streakDays, badgeCount }: PowerLevelCardProps) {
  const navigate = useNavigate()

  const { powerLevel, tier, nextTier, progress } = useMemo(() => {
    // Power level formula: volume contribution + PR bonus + streak bonus + badge bonus
    const pl = Math.floor((totalVolume / 10) + (prCount * 286) + (streakDays * 30) + (badgeCount * 150))

    let currentTier = HERO_TIERS[0]
    let nextTierData = HERO_TIERS[1]

    for (let i = HERO_TIERS.length - 1; i >= 0; i--) {
      if (pl >= HERO_TIERS[i].level) {
        currentTier = HERO_TIERS[i]
        nextTierData = HERO_TIERS[i + 1] ?? HERO_TIERS[i]
        break
      }
    }

    const tierStart = currentTier.level
    const tierEnd = nextTierData.level
    const prog = tierEnd > tierStart
      ? (pl - tierStart) / (tierEnd - tierStart)
      : 1

    return { powerLevel: pl, tier: currentTier, nextTier: nextTierData, progress: Math.min(prog, 1) }
  }, [totalVolume, prCount, streakDays, badgeCount])

  return (
    <div
      onClick={() => navigate('/power-level')}
      className="relative w-full h-[160px] rounded-xl overflow-hidden cursor-pointer border border-accent transition-all duration-200 hover:shadow-lg hover:shadow-accent/10"
      role="button"
      tabIndex={0}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,69,0,0.12) 0%, #1A1A1A 40%, #0A0A0A 100%)',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute rounded-full blur-[40px]"
        style={{ right: '-20px', top: '-20px', width: '140px', height: '140px', background: '#FF4500', opacity: 0.08 }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        {/* Top row: label + rank */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-accent" />
            <span className="text-[10px] font-bold text-accent tracking-[2px]">POWER LEVEL</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft">
            <Shield size={10} className="text-accent" />
            <span className="text-[9px] font-bold text-accent tracking-[1px]">RANK: {tier.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Big number */}
        <span
          className="text-[48px] font-bold text-white leading-none font-[family-name:var(--font-display)] tracking-tighter"
          style={{ textShadow: '0 0 20px rgba(255,69,0,0.3)' }}
        >
          {powerLevel.toLocaleString()}
        </span>

        {/* XP bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">
              Next: {nextTier.name}
            </span>
            <span className="text-[11px] font-semibold text-accent">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-card-elevated overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #FF4500, #FF6B35)',
                boxShadow: '0 0 8px rgba(255,69,0,0.4)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
