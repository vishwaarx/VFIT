import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Pencil, Mic, MessageCircle, TrendingUp, TrendingDown, Minus, Zap, Trophy, Bell, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan'
import { MissedWorkoutNudge } from '@/components/dashboard/MissedWorkoutNudge'
import { AnimeWarriorCard } from '@/components/dashboard/AnimeWarriorCard'
import { useCallback, useMemo } from 'react'
import { PullToRefresh } from '@/components/ui/PullToRefresh'

const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Consistency beats intensity. Show up.",
  "Every rep counts. Every day matters.",
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { streak, weeklyWorkouts, totalWeeklyTarget, latestWeight, activeChallenge, loading, reload } = useDashboardData()
  const { todayPlan, reload: reloadPlan } = useWorkoutPlan()

  const handleRefresh = useCallback(async () => {
    reload()
    reloadPlan()
  }, [reload, reloadPlan])

  const quote = useMemo(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    []
  )

  const TrendIcon = latestWeight?.trend === 'up' ? TrendingUp
    : latestWeight?.trend === 'down' ? TrendingDown
    : Minus

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  const weeklyProgress = totalWeeklyTarget > 0 ? Math.min((weeklyWorkouts / totalWeeklyTarget) * 100, 100) : 0

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="flex flex-col gap-4">
      <PageHeader
        title="VFIT"
        titleColor="var(--color-accent)"
        titleSize="32px"
        action={
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 bg-card rounded-[20px] flex items-center justify-center border border-border hover:bg-card-hover transition-colors duration-200 cursor-pointer"
          >
            <Bell size={18} className="text-text-secondary" />
          </button>
        }
      />

      <div className="px-5 flex flex-col gap-3.5">
        {/* Anime Warrior Hero Card */}
        <AnimeWarriorCard streakDays={streak?.current_count ?? 0} />

        {/* Stats Row — Weight + This Week */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-[9px] font-bold text-text-muted tracking-[1px] uppercase">TODAY&apos;S WEIGHT</p>
            {latestWeight ? (
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <p className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">{latestWeight.weight}</p>
                <span className="text-text-muted text-sm">{latestWeight.unit}</span>
              </div>
            ) : (
              <p className="text-2xl font-bold mt-1.5 text-text-muted">--</p>
            )}
            {latestWeight && (
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon size={12} className={
                  latestWeight.trend === 'down' ? 'text-success' : latestWeight.trend === 'up' ? 'text-warning' : 'text-text-muted'
                } />
                <span className={`text-xs font-medium ${
                  latestWeight.trend === 'down' ? 'text-success' : latestWeight.trend === 'up' ? 'text-warning' : 'text-text-muted'
                }`}>
                  {latestWeight.trend === 'down' ? 'Losing' : latestWeight.trend === 'up' ? 'Gaining' : 'Stable'}
                </span>
              </div>
            )}
          </Card>

          <Card>
            <p className="text-[9px] font-bold text-text-muted tracking-[1px] uppercase">THIS WEEK</p>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">{weeklyWorkouts}/{totalWeeklyTarget}</p>
              <span className="text-text-muted text-sm">done</span>
            </div>
            <div className="mt-2 h-[6px] bg-subtle-hover rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Today's Workout — redesigned card */}
        <Card
          variant="elevated"
          hover={!!todayPlan && !todayPlan.is_rest_day}
          className="overflow-hidden"
        >
          <p className="text-[9px] font-bold text-text-muted tracking-[1px] uppercase mb-2">TODAY&apos;S WORKOUT</p>
          {todayPlan ? (
            <>
              <p className="text-lg font-bold font-[family-name:var(--font-display)] tracking-tight">{todayPlan.day_label}</p>
              {!todayPlan.is_rest_day && todayPlan.exercises.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {todayPlan.exercises.slice(0, 4).map((ex) => (
                    <p key={ex.id} className="text-sm text-text-secondary">
                      {ex.exercise_name} &middot; {ex.target_sets} sets
                    </p>
                  ))}
                  {todayPlan.exercises.length > 4 && (
                    <p className="text-sm text-text-muted">+{todayPlan.exercises.length - 4} more</p>
                  )}
                </div>
              )}
              {todayPlan.is_rest_day && (
                <p className="text-base text-text-secondary mt-1">Recovery day</p>
              )}
              {!todayPlan.is_rest_day && (
                <button
                  onClick={() => navigate(`/workouts/session/${todayPlan.id}`)}
                  className="w-full h-12 mt-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
                >
                  <Play size={18} fill="white" />
                  Start Workout
                </button>
              )}
            </>
          ) : (
            <p className="text-lg font-bold mt-1 text-text-muted">No plan loaded</p>
          )}
        </Card>

        {/* Missed workout nudge */}
        <MissedWorkoutNudge />

        {/* Active Challenge */}
        {activeChallenge && (
          <Card variant="accent">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-accent" />
              <p className="text-xs text-accent font-bold tracking-[2px]">WEEKLY CHALLENGE</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base text-text-secondary flex-1">{activeChallenge.challenge_text}</p>
              <p className="text-lg font-bold font-[family-name:var(--font-display)] ml-3">
                {activeChallenge.current_value}/{activeChallenge.target_value}
              </p>
            </div>
          </Card>
        )}

        {/* Quick Actions — custom cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Pencil, label: 'Log', onClick: () => navigate('/workouts') },
            { icon: Mic, label: 'Voice', onClick: () => navigate('/voice-logging') },
            { icon: MessageCircle, label: 'Coach', onClick: () => navigate('/coach') },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="h-[80px] bg-card border border-border rounded-[12px] flex flex-col items-center justify-center gap-2 hover:bg-card-hover transition-colors duration-200 cursor-pointer"
            >
              <Icon size={22} className="text-text-secondary" />
              <span className="text-xs font-medium text-text-secondary">{label}</span>
            </button>
          ))}
        </div>

        {/* Motivational Banner — updated gradient + glow */}
        <div className="relative overflow-hidden rounded-[14px]" style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.19) 0%, rgba(255,69,0,0.03) 100%)' }}>
          {/* Glow orb */}
          <div
            className="absolute rounded-full blur-[40px]"
            style={{ left: '-20px', top: '-20px', width: '80px', height: '80px', background: '#FF4500', opacity: 0.15 }}
          />
          <div className="flex items-center gap-3 px-4 py-3.5 relative">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
              <Trophy size={18} className="text-accent" />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">&ldquo;{quote}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  )
}
