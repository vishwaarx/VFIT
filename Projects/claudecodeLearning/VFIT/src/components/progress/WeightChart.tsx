import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { supabase } from '@/lib/supabase'
import { subDays, subMonths, format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { TrendingUp } from 'lucide-react'

type Timeframe = '1W' | '1M' | '3M' | 'ALL'

interface WeightDataPoint {
  date: string
  label: string
  weight: number
  avg?: number
}

export function WeightChart({ inline = false }: { inline?: boolean }) {
  const [data, setData] = useState<WeightDataPoint[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('1M')
  const [goalWeight, setGoalWeight] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [timeframe])

  async function loadData() {
    let dateFilter: string | undefined

    const now = new Date()
    switch (timeframe) {
      case '1W': dateFilter = format(subDays(now, 7), 'yyyy-MM-dd'); break
      case '1M': dateFilter = format(subMonths(now, 1), 'yyyy-MM-dd'); break
      case '3M': dateFilter = format(subMonths(now, 3), 'yyyy-MM-dd'); break
      case 'ALL': dateFilter = undefined; break
    }

    let query = supabase.from('weight_logs').select('date, weight').order('date', { ascending: true })
    if (dateFilter) query = query.gte('date', dateFilter)

    const [weightRes, profileRes] = await Promise.all([
      query,
      supabase.from('profiles').select('goal_weight').single(),
    ])

    setGoalWeight(profileRes.data?.goal_weight ?? null)

    const weights = weightRes.data ?? []
    if (weights.length === 0) { setData([]); return }

    const points: WeightDataPoint[] = weights.map((w, i) => {
      const windowStart = Math.max(0, i - 6)
      const window = weights.slice(windowStart, i + 1)
      const avg = window.reduce((s, x) => s + x.weight, 0) / window.length

      return {
        date: w.date,
        label: format(new Date(w.date), 'MMM d'),
        weight: w.weight,
        avg: Math.round(avg * 10) / 10,
      }
    })

    setData(points)
  }

  const content = (
    <>
      {!inline && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-accent" />
            </div>
            <h3 className="font-bold font-[family-name:var(--font-display)] tracking-tight text-base">Weight Trend</h3>
          </div>
          <div className="flex gap-0 bg-card-elevated rounded-lg p-0.5">
            {(['1W', '1M', '3M', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  timeframe === tf ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      {inline && (
        <div className="flex gap-0 bg-card-elevated rounded-lg p-0.5 mb-4 w-fit">
          {(['1W', '1M', '3M', 'ALL'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                timeframe === tf ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      )}

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center rounded-xl bg-subtle">
          <p className="text-text-muted text-sm">Log your weight to see trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#525252' }} interval="preserveStartEnd" />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#525252' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#8A8A8A' }}
            />
            {goalWeight && (
              <ReferenceLine y={goalWeight} stroke="#32D74B" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#32D74B', fontSize: 10 }} />
            )}
            <Line type="monotone" dataKey="weight" stroke="#FF4500" strokeWidth={2} dot={{ r: 3, fill: '#FF4500', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#FF4500', stroke: '#FF450040', strokeWidth: 4 }} />
            <Line type="monotone" dataKey="avg" stroke="#FF450050" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <div className="flex justify-center gap-5 mt-3 text-xs text-text-muted">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent rounded-full inline-block" /> Weight</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent/30 rounded-full inline-block" /> 7-day Avg</span>
        </div>
      )}
    </>
  )

  if (inline) return content
  return <Card>{content}</Card>
}
