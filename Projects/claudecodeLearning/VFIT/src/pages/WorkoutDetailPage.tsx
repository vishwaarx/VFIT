import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Dumbbell, Layers, BarChart3, Trophy } from 'lucide-react'
import type { WorkoutSession, WorkoutLog } from '@/types/database'

interface GroupedExercise {
  name: string
  sets: WorkoutLog[]
}

export function WorkoutDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [exercises, setExercises] = useState<GroupedExercise[]>([])
  const [planLabel, setPlanLabel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!sessionId) return

      const [sessionRes, logsRes] = await Promise.all([
        supabase.from('workout_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('workout_logs').select('*').eq('session_id', sessionId).order('set_number'),
      ])

      if (sessionRes.data) {
        setSession(sessionRes.data)
        const { data: plan } = await supabase
          .from('workout_plans')
          .select('day_label')
          .eq('id', sessionRes.data.workout_plan_id)
          .single()
        setPlanLabel(plan?.day_label ?? '')
      }

      const grouped = new Map<string, WorkoutLog[]>()
      for (const log of logsRes.data ?? []) {
        if (!grouped.has(log.exercise_name)) grouped.set(log.exercise_name, [])
        grouped.get(log.exercise_name)!.push(log)
      }
      setExercises(Array.from(grouped, ([name, sets]) => ({ name, sets })))
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary">Session not found</p>
        <Button variant="secondary" onClick={() => navigate('/workouts')}>Back</Button>
      </div>
    )
  }

  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0
  )

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={planLabel || 'Workout'}
        subtitle={formatDate(session.date)}
        action={
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl glass cursor-pointer hover:bg-card-hover transition-colors duration-200">
            <ArrowLeft size={18} className="text-text-secondary" />
          </button>
        }
      />

      <div className="px-5 flex flex-col gap-3.5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="text-center py-4">
            <Dumbbell size={16} className="text-accent mx-auto mb-1.5" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)]">{exercises.length}</p>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Exercises</p>
          </Card>
          <Card className="text-center py-4">
            <Layers size={16} className="text-accent mx-auto mb-1.5" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)]">
              {exercises.reduce((s, e) => s + e.sets.length, 0)}
            </p>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Sets</p>
          </Card>
          <Card className="text-center py-4">
            <BarChart3 size={16} className="text-accent mx-auto mb-1.5" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)]">{Math.round(totalVolume).toLocaleString()}</p>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Volume</p>
          </Card>
        </div>

        {/* Exercise details */}
        {exercises.map((ex) => (
          <Card key={ex.name}>
            <h3 className="font-bold text-[15px] font-[family-name:var(--font-display)] tracking-tight mb-3">{ex.name}</h3>
            <div className="flex flex-col gap-1.5">
              {ex.sets.map((set) => (
                <div key={set.id} className={`flex items-center gap-3 text-base py-2 px-3 rounded-lg ${set.is_pr ? 'bg-pr-gold/[0.06] border border-pr-gold/10' : 'bg-subtle'}`}>
                  <span className="text-text-muted text-xs font-bold w-6">#{set.set_number}</span>
                  <span className="font-bold">{set.weight}kg</span>
                  <span className="text-text-secondary">&times; {set.reps}</span>
                  {set.is_pr && (
                    <span className="ml-auto flex items-center gap-1 text-pr-gold text-xs font-bold">
                      <Trophy size={12} /> PR
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
