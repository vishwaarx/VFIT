import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getDayOfWeek } from '@/lib/utils'
import type { Streak } from '@/types/database'

export function useStreaks() {
  const [workoutStreak, setWorkoutStreak] = useState<Streak | null>(null)
  const [photoStreak, setPhotoStreak] = useState<Streak | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('streaks').select('*')

    const workout = data?.find((s) => s.streak_type === 'workout') ?? null
    const photo = data?.find((s) => s.streak_type === 'photo') ?? null

    setWorkoutStreak(workout)
    setPhotoStreak(photo)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /** Call after completing a workout on a scheduled day */
  const incrementWorkoutStreak = useCallback(async () => {
    if (!workoutStreak) return

    const today = new Date().toISOString().split('T')[0]
    if (workoutStreak.last_active_date === today) return // Already counted today

    // Verify today is a workout day (not rest day)
    const dayOfWeek = getDayOfWeek()
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('is_rest_day')
      .eq('day_of_week', dayOfWeek)
      .single()

    if (plan?.is_rest_day) return

    const newCount = workoutStreak.current_count + 1
    const newLongest = Math.max(newCount, workoutStreak.longest_count)

    const { data } = await supabase
      .from('streaks')
      .update({
        current_count: newCount,
        longest_count: newLongest,
        last_active_date: today,
      })
      .eq('id', workoutStreak.id)
      .select()
      .single()

    if (data) setWorkoutStreak(data)
  }, [workoutStreak])

  const incrementPhotoStreak = useCallback(async () => {
    if (!photoStreak) return

    const today = new Date().toISOString().split('T')[0]
    if (photoStreak.last_active_date === today) return

    const newCount = photoStreak.current_count + 1
    const newLongest = Math.max(newCount, photoStreak.longest_count)

    const { data } = await supabase
      .from('streaks')
      .update({
        current_count: newCount,
        longest_count: newLongest,
        last_active_date: today,
      })
      .eq('id', photoStreak.id)
      .select()
      .single()

    if (data) setPhotoStreak(data)
  }, [photoStreak])

  return { workoutStreak, photoStreak, loading, incrementWorkoutStreak, incrementPhotoStreak, reload: load }
}
