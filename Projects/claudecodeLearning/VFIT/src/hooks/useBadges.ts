import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { BADGE_DEFINITIONS } from '@/lib/constants'
import type { Badge } from '@/types/database'

export function useBadges() {
  const [earned, setEarned] = useState<Badge[]>([])
  const [newBadge, setNewBadge] = useState<Badge | null>(null)
  const [loading, setLoading] = useState(true)

  const loadBadges = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('badges')
      .select('*')
      .order('earned_at', { ascending: false })

    setEarned(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadBadges()
  }, [loadBadges])

  const checkAndAward = useCallback(async () => {
    const earnedKeys = new Set(earned.map((b) => b.badge_key))

    // Fetch data for badge checks
    const [streakRes, prCountRes, sessionCountRes, challengeCountRes, weightRes] = await Promise.all([
      supabase.from('streaks').select('*').eq('streak_type', 'workout').single(),
      supabase.from('personal_records').select('id', { count: 'exact', head: true }),
      supabase.from('workout_sessions').select('id', { count: 'exact', head: true }).not('completed_at', 'is', null),
      supabase.from('weekly_challenges').select('id', { count: 'exact', head: true }).eq('is_completed', true),
      supabase.from('workout_logs').select('weight').order('weight', { ascending: false }).limit(1),
    ])

    const streak = streakRes.data?.current_count ?? 0
    const prCount = prCountRes.count ?? 0
    const sessionCount = sessionCountRes.count ?? 0
    const challengeCount = challengeCountRes.count ?? 0
    const maxWeight = weightRes.data?.[0]?.weight ?? 0

    const checks: { key: string; condition: boolean }[] = [
      { key: 'first_rep', condition: sessionCount >= 1 },
      { key: 'streak_7', condition: streak >= 7 },
      { key: 'streak_14', condition: streak >= 14 },
      { key: 'streak_30', condition: streak >= 30 },
      { key: 'streak_60', condition: streak >= 60 },
      { key: 'streak_90', condition: streak >= 90 },
      { key: 'streak_365', condition: streak >= 365 },
      { key: 'first_pr', condition: prCount >= 1 },
      { key: 'pr_machine', condition: prCount >= 10 },
      { key: '100kg_club', condition: maxWeight >= 100 },
      { key: 'challenge_completer', condition: challengeCount >= 1 },
      { key: 'challenge_master', condition: challengeCount >= 10 },
    ]

    for (const check of checks) {
      if (check.condition && !earnedKeys.has(check.key)) {
        const def = BADGE_DEFINITIONS.find((b) => b.key === check.key)
        if (!def) continue

        const { data } = await supabase
          .from('badges')
          .insert({
            badge_key: def.key,
            badge_name: def.name,
            description: def.description,
            icon: def.icon,
          })
          .select()
          .single()

        if (data) {
          setEarned((prev) => [data, ...prev])
          setNewBadge(data)
        }
      }
    }
  }, [earned])

  const dismissNewBadge = useCallback(() => setNewBadge(null), [])

  const allBadges = BADGE_DEFINITIONS.map((def) => ({
    ...def,
    earned: earned.find((e) => e.badge_key === def.key) ?? null,
  }))

  return { earned, allBadges, newBadge, loading, checkAndAward, dismissNewBadge, reload: loadBadges }
}
