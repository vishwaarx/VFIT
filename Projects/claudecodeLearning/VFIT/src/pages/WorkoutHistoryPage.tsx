import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Search, ChevronRight, Calendar, Dumbbell, Clock } from 'lucide-react'
import { isThisWeek, isThisMonth, parseISO } from 'date-fns'

export function WorkoutHistoryPage() {
  const navigate = useNavigate()
  const { sessions, loading } = useWorkoutHistory(50)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sessions
    const q = searchQuery.toLowerCase()
    return sessions.filter((s) =>
      (s.plan_label || '').toLowerCase().includes(q)
    )
  }, [sessions, searchQuery])

  // Group sessions
  const groups = useMemo(() => {
    const thisWeek = filtered.filter((s) => {
      try { return isThisWeek(parseISO(s.date), { weekStartsOn: 1 }) } catch { return false }
    })
    const thisMonth = filtered.filter((s) => {
      try {
        const d = parseISO(s.date)
        return isThisMonth(d) && !isThisWeek(d, { weekStartsOn: 1 })
      } catch { return false }
    })
    const older = filtered.filter((s) => {
      try {
        const d = parseISO(s.date)
        return !isThisMonth(d)
      } catch { return false }
    })
    return { thisWeek, thisMonth, older }
  }, [filtered])

  // Summary stats
  const totalWorkouts = sessions.length
  const thisMonthCount = sessions.filter((s) => {
    try { return isThisMonth(parseISO(s.date)) } catch { return false }
  }).length
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) / sessions.length)
    : 0

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  const renderGroup = (title: string, items: typeof sessions) => {
    if (items.length === 0) return null
    return (
      <div>
        <p className="text-[9px] font-bold text-text-muted tracking-[2px] uppercase mb-2">{title}</p>
        <div className="flex flex-col gap-2">
          {items.map((s) => (
            <Card key={s.id} hover onClick={() => navigate(`/workouts/detail/${s.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base">{s.plan_label || 'Workout'}</p>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {formatDate(s.date)} &middot; {s.logs.length} sets
                    {s.duration_minutes ? ` &middot; ${s.duration_minutes}min` : ''}
                  </p>
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2 safe-top">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer hover:bg-card-hover transition-colors duration-200"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <h1 className="text-[24px] font-bold font-[family-name:var(--font-display)] tracking-tight">History</h1>
      </div>

      <div className="px-5 flex flex-col gap-3.5">
        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts..."
            className="w-full h-11 bg-card border border-border rounded-[12px] pl-10 pr-4 text-base placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40"
          />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Dumbbell, label: 'Total', value: totalWorkouts },
            { icon: Calendar, label: 'This Month', value: thisMonthCount },
            { icon: Clock, label: 'Avg Duration', value: `${avgDuration}m` },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex flex-col items-center py-3 gap-1">
              <Icon size={16} className="text-accent" />
              <span className="text-lg font-bold font-[family-name:var(--font-display)]">{value}</span>
              <span className="text-[10px] text-text-muted">{label}</span>
            </Card>
          ))}
        </div>

        {/* Grouped sessions */}
        {renderGroup('THIS WEEK', groups.thisWeek)}
        {renderGroup('THIS MONTH', groups.thisMonth)}
        {renderGroup('OLDER', groups.older)}

        {sessions.length === 0 && (
          <Card className="flex items-center justify-center py-8">
            <p className="text-text-muted text-sm">No workouts logged yet</p>
          </Card>
        )}
      </div>
    </div>
  )
}
