import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { WorkoutSession, WorkoutLog } from '@/types/database'

export interface SessionWithLogs extends WorkoutSession {
  logs: WorkoutLog[]
  plan_label?: string
}

export function useWorkoutHistory(limit = 20) {
  const [sessions, setSessions] = useState<SessionWithLogs[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  const loadSessions = useCallback(async (offset = 0) => {
    setLoading(true)

    const { data: sessionData } = await supabase
      .from('workout_sessions')
      .select('*')
      .not('completed_at', 'is', null)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (!sessionData?.length) {
      setHasMore(false)
      setLoading(false)
      return
    }

    const sessionIds = sessionData.map((s) => s.id)
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('*')
      .in('session_id', sessionIds)
      .order('set_number')

    // Get plan labels
    const planIds = [...new Set(sessionData.map((s) => s.workout_plan_id))]
    const { data: plans } = await supabase
      .from('workout_plans')
      .select('id, day_label')
      .in('id', planIds)

    const planMap = new Map(plans?.map((p) => [p.id, p.day_label]) ?? [])

    const sessionsWithLogs: SessionWithLogs[] = sessionData.map((s) => ({
      ...s,
      logs: (logs ?? []).filter((l) => l.session_id === s.id),
      plan_label: planMap.get(s.workout_plan_id),
    }))

    if (offset === 0) {
      setSessions(sessionsWithLogs)
    } else {
      setSessions((prev) => [...prev, ...sessionsWithLogs])
    }

    setHasMore(sessionData.length === limit)
    setLoading(false)
  }, [limit])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const loadMore = () => {
    if (!loading && hasMore) {
      loadSessions(sessions.length)
    }
  }

  return { sessions, loading, hasMore, loadMore, reload: () => loadSessions(0) }
}
