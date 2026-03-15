import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Shield, Flame, Dumbbell, Trophy, ChevronRight, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useBadges } from '@/hooks/useBadges'
import { HERO_TIERS } from '@/lib/constants'
import { Card } from '@/components/ui/Card'

export function PowerLevelPage() {
  const navigate = useNavigate()
  const { streak } = useDashboardData()
  const { allBadges } = useBadges()
  const [totalVolume, setTotalVolume] = useState(0)
  const [prCount, setPrCount] = useState(0)

  useEffect(() => {
    async function load() {
      const [volRes, prRes] = await Promise.all([
        supabase.from('workout_logs').select('weight, reps'),
        supabase.from('personal_records').select('id'),
      ])
      setTotalVolume((volRes.data ?? []).reduce((sum, l) => sum + l.weight * l.reps, 0))
      setPrCount(prRes.data?.length ?? 0)
    }
    load()
  }, [])

  const streakDays = streak?.current_count ?? 0
  const badgeCount = allBadges.filter(b => b.earned).length

  const { powerLevel, tier, nextTier, progress, streakPower, volumePower, prPower, badgePower } = useMemo(() => {
    const sp = streakDays * 30
    const vp = Math.floor(totalVolume / 10)
    const pp = prCount * 286
    const bp = badgeCount * 150
    const pl = sp + vp + pp + bp

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
    const prog = tierEnd > tierStart ? (pl - tierStart) / (tierEnd - tierStart) : 1

    return {
      powerLevel: pl,
      tier: currentTier,
      nextTier: nextTierData,
      progress: Math.min(prog, 1),
      streakPower: sp,
      volumePower: vp,
      prPower: pp,
      badgePower: bp,
    }
  }, [streakDays, totalVolume, prCount, badgeCount])

  const maxPower = Math.max(streakPower, volumePower, prPower, badgePower, 1)

  return (
    <div className="flex flex-col min-h-full bg-bg">
      {/* Hero zone with character */}
      <div className="relative w-full h-[340px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 40%, rgba(255,69,0,0.18) 0%, #0A0A0A 70%)` }}
        />
        <div className="absolute left-1/2 top-5 -translate-x-1/2 w-[200px] h-[300px]">
          <img
            src={tier.image}
            alt={tier.name}
            className="w-full h-full object-contain"
            style={{ transform: `scale(${0.88 + progress * 0.14})`, transition: 'transform 0.7s ease-out' }}
          />
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px]" style={{ background: 'linear-gradient(180deg, transparent 0%, #0A0A0A 100%)' }} />
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-5 safe-top w-9 h-9 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        {/* Rank badge */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 safe-top flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent">
          <Shield size={12} className="text-white" />
          <span className="text-[10px] font-bold text-white tracking-[1.5px]">{tier.name.toUpperCase()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-10 flex flex-col gap-5 -mt-2">
        {/* Power level display */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-accent" />
            <span className="text-[11px] font-bold text-accent tracking-[2px]">POWER LEVEL</span>
          </div>
          <span
            className="text-[56px] font-bold text-white leading-none font-[family-name:var(--font-display)] tracking-tighter"
            style={{ textShadow: '0 0 24px rgba(255,69,0,0.3)' }}
          >
            {powerLevel.toLocaleString()}
          </span>
        </div>

        {/* XP progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-accent" />
              <span className="text-[10px] font-bold text-accent tracking-[1px]">{tier.name.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-text-muted tracking-[1px]">{nextTier.name.toUpperCase()}</span>
              {nextTier.level > tier.level && <Lock size={10} className="text-text-muted" />}
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-card-elevated overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #FF4500, #FF6B35)',
                boxShadow: '0 0 8px rgba(255,69,0,0.5)',
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">{powerLevel.toLocaleString()} / {nextTier.level.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-accent">{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Power breakdown */}
        <Card>
          <p className="text-[9px] font-bold text-text-muted tracking-[2px] mb-3.5">POWER BREAKDOWN</p>
          <div className="flex flex-col gap-3.5">
            {[
              { icon: Flame, label: 'Streak Bonus', value: streakPower, color: '#FF4500' },
              { icon: Dumbbell, label: 'Total Volume', value: volumePower, color: '#32D74B' },
              { icon: Trophy, label: 'Personal Records', value: prPower, color: '#FFD60A' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color }} />
                    <span className="text-[13px] font-medium text-text-primary">{label}</span>
                  </div>
                  <span className="text-sm font-bold font-[family-name:var(--font-display)]" style={{ color }}>
                    +{value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-card-elevated overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(value / maxPower) * 100}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Next transformation */}
        {nextTier.level > tier.level && (
          <Card hover className="flex items-center gap-3.5">
            <div className="w-[70px] h-[70px] rounded-xl overflow-hidden bg-card-elevated shrink-0">
              <img src={nextTier.image} alt={nextTier.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold text-text-muted tracking-[1.5px]">NEXT TRANSFORMATION</p>
              <p className="text-lg font-bold font-[family-name:var(--font-display)] tracking-tight">{nextTier.name}</p>
              <p className="text-xs text-text-secondary">
                {(nextTier.level - powerLevel).toLocaleString()} points to go
              </p>
            </div>
            <ChevronRight size={18} className="text-text-muted" />
          </Card>
        )}

        {/* Tier timeline */}
        <div className="flex flex-col gap-2.5">
          <p className="text-[9px] font-bold text-text-muted tracking-[2px]">ALL TRANSFORMATIONS</p>
          <div className="flex items-center justify-between">
            {HERO_TIERS.slice(0, 6).map((t, i) => {
              const isCompleted = powerLevel >= t.level
              const isCurrent = t.level === tier.level
              return (
                <div key={t.level} className="flex flex-col items-center gap-1">
                  <div
                    className={`rounded-full transition-all ${
                      isCurrent ? 'w-3 h-3 bg-accent shadow-[0_0_6px_rgba(255,69,0,0.5)]'
                      : isCompleted ? 'w-2.5 h-2.5 bg-success'
                      : 'w-2.5 h-2.5 bg-card-elevated border border-border-strong'
                    }`}
                  />
                  <span className={`text-[8px] font-semibold ${isCurrent ? 'text-accent' : 'text-text-muted'}`}>
                    {t.level >= 1000 ? `${t.level / 1000}K` : t.level}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
