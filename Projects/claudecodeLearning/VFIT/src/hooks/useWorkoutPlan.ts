import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { WorkoutPlan, PlanExercise } from '@/types/database'
import { getDayOfWeek } from '@/lib/utils'

export interface WorkoutDay extends WorkoutPlan {
  exercises: PlanExercise[]
}

export function useWorkoutPlan() {
  const [days, setDays] = useState<WorkoutDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlan = useCallback(async () => {
    setLoading(true)
    setError(null)

    // W3: Single joined query instead of two sequential fetches
    const { data, error: queryError } = await supabase
      .from('workout_plans')
      .select('*, plan_exercises(*)')
      .order('order')

    if (queryError) {
      setError(queryError.message)
      setLoading(false)
      return
    }

    if (!data?.length) {
      setLoading(false)
      return
    }

    const workoutDays: WorkoutDay[] = data.map((plan) => ({
      ...plan,
      exercises: ((plan as Record<string, unknown>).plan_exercises as PlanExercise[] ?? [])
        .sort((a, b) => a.order - b.order),
    }))

    setDays(workoutDays)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  const todayPlan = days.find((d) => d.day_of_week === getDayOfWeek())

  return { days, todayPlan, loading, error, reload: loadPlan }
}
