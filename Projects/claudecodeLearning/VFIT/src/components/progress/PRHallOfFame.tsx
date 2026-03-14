import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Trophy } from 'lucide-react'
import { getBestPRsByExercise } from '@/hooks/usePRDetection'
import { formatDate } from '@/lib/utils'
import type { PersonalRecord } from '@/types/database'

export function PRHallOfFame() {
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const bestMap = await getBestPRsByExercise()
      const sorted = Array.from(bestMap.values()).sort((a, b) =>
        new Date(b.achieved_date).getTime() - new Date(a.achieved_date).getTime()
      )
      setPrs(sorted)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <Card>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-pr-gold/10 flex items-center justify-center">
          <Trophy size={16} className="text-pr-gold" />
        </div>
        <h3 className="font-bold font-[family-name:var(--font-display)] tracking-tight text-base">PR Hall of Fame</h3>
      </div>

      {loading ? (
        <div className="py-6 text-center"><p className="text-text-muted text-sm">Loading...</p></div>
      ) : prs.length === 0 ? (
        <div className="py-8 text-center rounded-xl bg-subtle">
          <Trophy size={24} className="text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">No personal records yet</p>
          <p className="text-text-muted text-sm mt-1">Crush your first PR to see it here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {prs.map((pr) => (
            <div key={pr.id} className="flex items-center justify-between p-3.5 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pr-gold/10 flex items-center justify-center">
                  <Trophy size={16} className="text-pr-gold" />
                </div>
                <div>
                  <p className="font-semibold text-base">{pr.exercise_name}</p>
                  <p className="text-sm text-text-secondary">
                    {pr.weight}kg &times; {pr.reps} &mdash; Est. 1RM: {pr.estimated_1rm}kg
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-muted">{formatDate(pr.achieved_date)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
