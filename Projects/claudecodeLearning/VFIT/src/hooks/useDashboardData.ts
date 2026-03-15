import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentWeekBounds, getDayOfWeek } from '@/lib/utils'
import type { Profile, Streak, WeeklyChallenge } from '@/types/database'

interface DashboardData {
  profile: Profile | null
  streak: Streak | null
  weeklyWorkouts: number
  totalWeeklyTarget: number
  latestWeight: { weight: number; unit: string; trend: 'up' | 'down' | 'stable' } | null
  activeChallenge: WeeklyChallenge | null
  loading: boolean
}

export function useDashboardData(): DashboardData & { reload: () => void } {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    streak: null,
    weeklyWorkouts: 0,
    totalWeeklyTarget: 5,
    latestWeight: null,
    activeChallenge: null,
    loading: true,
  })

  // W4: Memoize with useCallback
  const load = useCallback(async () => {
    setData((d) => ({ ...d, loading: true }))

    try {
    const { start, end } = getCurrentWeekBounds()

    const [profileRes, streakRes, sessionsRes, weightRes, challengeRes, plansRes] = await Promise.all([
      supabase.from('profiles').select('*').limit(1).maybeSingle(),
      supabase.from('streaks').select('*').eq('streak_type', 'workout').limit(1).maybeSingle(),
      supabase
        .from('workout_sessions')
        .select('id')
        .not('completed_at', 'is', null)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0]),
      // W5: Fetch 8 records (latest + 7 for moving average)
      supabase.from('weight_logs').select('*').order('date', { ascending: false }).limit(8),
      supabase.from('weekly_challenges').select('*').eq('is_completed', false).order('week_start_date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('workout_plans').select('id').eq('is_rest_day', false),
    ])

    // W5: Compute trend vs 7-day moving average
    let trend: 'up' | 'down' | 'stable' = 'stable'
    const weights = weightRes.data
    if (weights && weights.length >= 2) {
      const latest = weights[0].weight
      const olderWeights = weights.slice(1)
      const average = olderWeights.reduce((sum, w) => sum + w.weight, 0) / olderWeights.length
      const diff = latest - average
      if (diff > 0.2) trend = 'up'
      else if (diff < -0.2) trend = 'down'
    }

    setData({
      profile: profileRes.data,
      streak: streakRes.data,
      weeklyWorkouts: sessionsRes.data?.length ?? 0,
      totalWeeklyTarget: plansRes.data?.length ?? 5,
      latestWeight: weights?.[0] ? { weight: weights[0].weight, unit: weights[0].unit, trend } : null,
      activeChallenge: challengeRes.data,
      loading: false,
    })
    } catch (err) {
      console.error('Dashboard data load error:', err)
      setData((d) => ({ ...d, loading: false }))
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { ...data, reload: load }
}

export { getDayOfWeek }
