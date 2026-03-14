import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { WeightChart } from '@/components/progress/WeightChart'
import { VolumeChart } from '@/components/progress/VolumeChart'
import { PRHallOfFame } from '@/components/progress/PRHallOfFame'
import { PhotoTimeline } from '@/components/progress/PhotoTimeline'
import { BadgeShowcase } from '@/components/progress/BadgeShowcase'
import { PowerLevelCard } from '@/components/progress/PowerLevelCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { supabase } from '@/lib/supabase'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useBadges } from '@/hooks/useBadges'
import { TrendingDown, TrendingUp, Flame } from 'lucide-react'

type ChartTab = 'weight' | 'volume'

export function ProgressPage() {
  const { streak, weeklyWorkouts, totalWeeklyTarget, latestWeight } = useDashboardData()
  const { allBadges } = useBadges()
  const [totalVolume, setTotalVolume] = useState(0)
  const [prCount, setPrCount] = useState(0)
  const [chartTab, setChartTab] = useState<ChartTab>('weight')
  const [filterPeriod] = useState('30 Days')

  useEffect(() => {
    async function loadPowerData() {
      const [volRes, prRes] = await Promise.all([
        supabase.from('workout_logs').select('weight, reps'),
        supabase.from('personal_records').select('id'),
      ])
      const vol = (volRes.data ?? []).reduce((sum, l) => sum + l.weight * l.reps, 0)
      setTotalVolume(vol)
      setPrCount(prRes.data?.length ?? 0)
    }
    loadPowerData()
  }, [])

  const remaining = Math.max(0, totalWeeklyTarget - weeklyWorkouts)

  return (
    <div className="flex flex-col gap-4">
      {/* Custom header: "YOUR" label + "Progress" italic + filter pill */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 safe-top">
        <div>
          <span className="text-[10px] font-bold text-accent tracking-[2px]">YOUR</span>
          <h1 className="text-[32px] font-bold font-[family-name:var(--font-display)] tracking-tight italic">Progress</h1>
        </div>
        <div className="flex items-center px-3.5 py-1.5 bg-card border border-border rounded-[20px]">
          <span className="text-xs font-semibold text-text-secondary">{filterPeriod}</span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3.5">
        {/* Power Level Card with scanline overlay */}
        <div className="relative">
          <PowerLevelCard
            totalVolume={totalVolume}
            prCount={prCount}
            streakDays={streak?.current_count ?? 0}
            badgeCount={allBadges.filter(b => b.earned).length}
          />
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)',
            }}
          />
        </div>

        {/* Hero Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weight card */}
          <div className="rounded-[14px] p-4" style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.19) 0%, rgba(255,69,0,0.02) 100%)' }}>
            <p className="text-[9px] font-bold text-text-muted tracking-[1px] uppercase">WEIGHT</p>
            <p className="text-2xl font-bold font-[family-name:var(--font-display)] mt-1">
              {latestWeight?.weight ?? '--'}<span className="text-sm text-text-muted ml-1">{latestWeight?.unit ?? 'kg'}</span>
            </p>
            {latestWeight?.trend && (
              <div className="flex items-center gap-1 mt-1.5">
                {latestWeight.trend === 'down' ? (
                  <TrendingDown size={12} className="text-success" />
                ) : (
                  <TrendingUp size={12} className="text-warning" />
                )}
                <span className={`text-xs font-medium ${latestWeight.trend === 'down' ? 'text-success' : 'text-warning'}`}>
                  {latestWeight.trend === 'down' ? 'Trending down' : 'Trending up'}
                </span>
              </div>
            )}
          </div>

          {/* Volume card */}
          <div className="rounded-[14px] p-4" style={{ background: 'linear-gradient(135deg, rgba(50,215,75,0.12) 0%, rgba(50,215,75,0.02) 100%)' }}>
            <p className="text-[9px] font-bold text-text-muted tracking-[1px] uppercase">TOTAL VOLUME</p>
            <p className="text-2xl font-bold font-[family-name:var(--font-display)] mt-1">
              {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(0)}k` : '--'}<span className="text-sm text-text-muted ml-1">kg</span>
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp size={12} className="text-success" />
              <span className="text-xs font-medium text-success">All time</span>
            </div>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing value={weeklyWorkouts} max={totalWeeklyTarget} size={64} strokeWidth={5} />
            <div className="flex-1">
              <p className="text-base font-bold font-[family-name:var(--font-display)]">Weekly Workout Goal</p>
              {remaining > 0 ? (
                <p className="text-sm text-text-secondary mt-0.5">{remaining} more session{remaining !== 1 ? 's' : ''} to go</p>
              ) : (
                <p className="text-sm text-success mt-0.5 font-semibold">Goal reached!</p>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <Flame size={12} className="text-accent" />
                <span className="text-xs text-text-muted">{streak?.current_count ?? 0} day streak</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart with toggle pills */}
        <Card>
          <div className="flex items-center gap-0 bg-card-elevated rounded-lg p-0.5 mb-4 w-fit">
            {(['weight', 'volume'] as ChartTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer capitalize ${
                  chartTab === tab ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {chartTab === 'weight' ? <WeightChart inline /> : <VolumeChart inline />}
        </Card>

        <PRHallOfFame />
        <PhotoTimeline />
        <BadgeShowcase />
      </div>
    </div>
  )
}
