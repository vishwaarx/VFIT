import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { estimateCost } from '@/lib/token-tracker'

interface UsageSummary {
  totalTokens: number
  promptTokens: number
  completionTokens: number
  estimatedCost: number
  byFeature: Record<string, { prompt: number; completion: number; total: number; cost: number }>
  byDeployment: Record<string, { prompt: number; completion: number; total: number; cost: number }>
  todayTokens: number
  todayCost: number
  last7DaysTokens: number
  last7DaysCost: number
}

const EMPTY: UsageSummary = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  estimatedCost: 0,
  byFeature: {},
  byDeployment: {},
  todayTokens: 0,
  todayCost: 0,
  last7DaysTokens: 0,
  last7DaysCost: 0,
}

export function useTokenUsage() {
  const [usage, setUsage] = useState<UsageSummary>(EMPTY)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data: rows } = await supabase
        .from('token_usage')
        .select('*')
        .order('created_at', { ascending: false })

      if (!rows || rows.length === 0) {
        setUsage(EMPTY)
        return
      }

      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      let totalTokens = 0, promptTokens = 0, completionTokens = 0, totalCost = 0
      let todayTokens = 0, todayCost = 0
      let last7DaysTokens = 0, last7DaysCost = 0
      const byFeature: UsageSummary['byFeature'] = {}
      const byDeployment: UsageSummary['byDeployment'] = {}

      for (const row of rows) {
        const cost = estimateCost(row.deployment, row.prompt_tokens, row.completion_tokens)

        totalTokens += row.total_tokens
        promptTokens += row.prompt_tokens
        completionTokens += row.completion_tokens
        totalCost += cost

        const rowDate = row.created_at.split('T')[0]
        if (rowDate === todayStr) {
          todayTokens += row.total_tokens
          todayCost += cost
        }
        if (new Date(row.created_at) >= sevenDaysAgo) {
          last7DaysTokens += row.total_tokens
          last7DaysCost += cost
        }

        // By feature
        if (!byFeature[row.feature]) {
          byFeature[row.feature] = { prompt: 0, completion: 0, total: 0, cost: 0 }
        }
        byFeature[row.feature].prompt += row.prompt_tokens
        byFeature[row.feature].completion += row.completion_tokens
        byFeature[row.feature].total += row.total_tokens
        byFeature[row.feature].cost += cost

        // By deployment
        if (!byDeployment[row.deployment]) {
          byDeployment[row.deployment] = { prompt: 0, completion: 0, total: 0, cost: 0 }
        }
        byDeployment[row.deployment].prompt += row.prompt_tokens
        byDeployment[row.deployment].completion += row.completion_tokens
        byDeployment[row.deployment].total += row.total_tokens
        byDeployment[row.deployment].cost += cost
      }

      setUsage({
        totalTokens,
        promptTokens,
        completionTokens,
        estimatedCost: totalCost,
        byFeature,
        byDeployment,
        todayTokens,
        todayCost,
        last7DaysTokens,
        last7DaysCost,
      })
    } catch (err) {
      console.error('Failed to load token usage:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { usage, loading, refresh }
}
