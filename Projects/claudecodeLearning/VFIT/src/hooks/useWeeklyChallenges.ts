import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { chatCompletionJSON, setFeatureContext } from '@/lib/azure-openai'
import { WEEKLY_CHALLENGE_SYSTEM, type ChallengeResponse } from '@/prompts/weekly-challenge'
import { buildCoachContext, formatContextForPrompt } from '@/prompts/coach-system'
import { startOfWeek, format } from 'date-fns'
import type { WeeklyChallenge } from '@/types/database'

export function useWeeklyChallenges() {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const loadChallenges = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('weekly_challenges')
      .select('*')
      .order('week_start_date', { ascending: false })
      .limit(5)

    setChallenges(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadChallenges()
  }, [loadChallenges])

  const generateChallenges = useCallback(async () => {
    setGenerating(true)

    try {
      const ctx = await buildCoachContext()
      const contextStr = formatContextForPrompt(ctx)

      setFeatureContext('weekly_challenges')
      const result = await chatCompletionJSON<ChallengeResponse>({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: WEEKLY_CHALLENGE_SYSTEM },
          { role: 'user', content: `Generate challenges based on this context:\n\n${contextStr}` },
        ],
        temperature: 0.8,
        max_tokens: 512,
      })

      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

      for (const challenge of result.challenges) {
        await supabase.from('weekly_challenges').insert({
          week_start_date: weekStart,
          challenge_text: challenge.text,
          target_value: challenge.target_value,
          current_value: 0,
          is_completed: false,
        })
      }

      await loadChallenges()
    } catch (err) {
      console.error('Failed to generate challenges:', err)
    } finally {
      setGenerating(false)
    }
  }, [loadChallenges])

  const currentWeekChallenges = challenges.filter((c) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return c.week_start_date === format(weekStart, 'yyyy-MM-dd')
  })

  return { challenges, currentWeekChallenges, loading, generating, generateChallenges, reload: loadChallenges }
}
