import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProteinLog } from '@/types/database'

interface DayTotal {
  date: string
  total: number
}

export function useProtein() {
  const [todayTotal, setTodayTotal] = useState(0)
  const [todayLogs, setTodayLogs] = useState<ProteinLog[]>([])
  const [weeklyAvg, setWeeklyAvg] = useState<number | null>(null)
  const [recentDays, setRecentDays] = useState<DayTotal[]>([])
  const [target, setTarget] = useState(150)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    setLoading(true)

    const [profileRes, todayRes, weekRes] = await Promise.all([
      supabase.from('profiles').select('daily_protein_target').single(),
      supabase.from('protein_logs').select('*').eq('date', today).order('created_at', { ascending: false }),
      supabase.from('protein_logs').select('date, grams').gte('date', getDateDaysAgo(7)).order('date'),
    ])

    if (profileRes.data?.daily_protein_target) {
      setTarget(profileRes.data.daily_protein_target)
    }

    const logs = todayRes.data ?? []
    setTodayLogs(logs)
    setTodayTotal(logs.reduce((s, l) => s + l.grams, 0))

    // Compute weekly average and daily totals
    const weekLogs = weekRes.data ?? []
    const dayMap = new Map<string, number>()
    for (const log of weekLogs) {
      dayMap.set(log.date, (dayMap.get(log.date) ?? 0) + log.grams)
    }

    const days = Array.from(dayMap, ([date, total]) => ({ date, total }))
    setRecentDays(days)

    if (days.length > 0) {
      const avg = days.reduce((s, d) => s + d.total, 0) / days.length
      setWeeklyAvg(Math.round(avg))
    } else {
      setWeeklyAvg(null)
    }

    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  const logProtein = useCallback(async (grams: number, label?: string) => {
    if (grams <= 0) return
    setSaving(true)

    const { error } = await supabase.from('protein_logs').insert({
      date: today,
      grams,
      meal_label: label ?? null,
    })

    if (!error) {
      setTodayTotal((prev) => prev + grams)
      await load()
    }
    setSaving(false)
  }, [today, load])

  return { todayTotal, todayLogs, weeklyAvg, recentDays, target, loading, saving, logProtein, reload: load }
}

function getDateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}
