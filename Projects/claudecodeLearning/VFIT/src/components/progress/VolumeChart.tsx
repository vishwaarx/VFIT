import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { format, startOfWeek, subWeeks } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Dumbbell } from 'lucide-react'

interface VolumeDataPoint {
  week: string
  volume: number
}

export function VolumeChart({ inline = false }: { inline?: boolean }) {
  const [data, setData] = useState<VolumeDataPoint[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const eightWeeksAgo = format(subWeeks(new Date(), 8), 'yyyy-MM-dd')

    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, date')
      .not('completed_at', 'is', null)
      .gte('date', eightWeeksAgo)

    if (!sessions?.length) { setData([]); return }

    const sessionIds = sessions.map((s) => s.id)
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('session_id, weight, reps')
      .in('session_id', sessionIds)

    if (!logs?.length) { setData([]); return }

    const sessionDateMap = new Map(sessions.map((s) => [s.id, s.date]))
    const weeklyVolume = new Map<string, number>()

    for (const log of logs) {
      const date = sessionDateMap.get(log.session_id)
      if (!date) continue
      const weekStart = format(startOfWeek(new Date(date), { weekStartsOn: 1 }), 'MMM d')
      weeklyVolume.set(weekStart, (weeklyVolume.get(weekStart) ?? 0) + log.weight * log.reps)
    }

    const points: VolumeDataPoint[] = Array.from(weeklyVolume, ([week, volume]) => ({
      week,
      volume: Math.round(volume),
    }))

    setData(points)
  }

  const content = (
    <>
      {!inline && (
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Dumbbell size={16} className="text-accent" />
          </div>
          <h3 className="font-bold font-[family-name:var(--font-display)] tracking-tight text-base">Weekly Volume</h3>
        </div>
      )}

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center rounded-xl bg-subtle">
          <p className="text-text-muted text-sm">Complete workouts to see volume trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#525252' }} />
            <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, fontSize: 12 }}
              formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
            />
            <Bar dataKey="volume" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4500" />
                <stop offset="100%" stopColor="#FF450060" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  )

  if (inline) return content
  return <Card>{content}</Card>
}
