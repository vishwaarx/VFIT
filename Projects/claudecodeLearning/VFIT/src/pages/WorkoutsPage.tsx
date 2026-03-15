import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { DaySelector } from '@/components/workout/DaySelector'
import { Play, Mic, Clock } from 'lucide-react'
import { getDayOfWeek } from '@/lib/utils'
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const { days, loading: planLoading, reload: reloadPlan } = useWorkoutPlan()
  const activeSession = useWorkoutSession((s) => s.session)
  const todayIdx = getDayOfWeek()

  // Select today's day by default
  const todayDay = days.find((d) => d.day_of_week === todayIdx)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedDayId && todayDay) {
      setSelectedDayId(todayDay.id)
    }
  }, [todayDay, selectedDayId])

  const selectedDay = days.find((d) => d.id === selectedDayId)

  const handleRefresh = useCallback(async () => {
    reloadPlan()
  }, [reloadPlan])

  if (planLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="flex flex-col gap-4">
      {/* Custom header */}
      <div className="px-5 pt-5 pb-1 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-accent tracking-[2px]">WORKOUTS</span>
            <h1 className="text-[28px] font-bold font-[family-name:var(--font-display)] tracking-tight mt-0.5">
              {selectedDay?.day_label || 'Your Plan'}
            </h1>
          </div>
          <button
            onClick={() => navigate('/voice-logging')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent rounded-full text-white text-xs font-bold cursor-pointer hover:bg-accent-hover transition-colors duration-200"
          >
            <Mic size={14} />
            Voice Summary
          </button>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {/* Day Selector */}
        <DaySelector
          days={days}
          selectedDayId={selectedDayId}
          todayIdx={todayIdx}
          onSelect={setSelectedDayId}
        />

        {/* Active session banner */}
        {activeSession && (
          <Card
            hover
            variant="accent"
            className="!border-accent/30 !bg-accent/[0.08]"
            onClick={() => navigate(`/workouts/session/${activeSession.workout_plan_id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/20">
                <Play size={16} fill="white" />
              </div>
              <div>
                <p className="font-bold text-accent text-base">Workout in Progress</p>
                <p className="text-sm text-text-secondary">Tap to continue</p>
              </div>
            </div>
          </Card>
        )}

        {/* Selected day exercises */}
        {selectedDay && !selectedDay.is_rest_day && selectedDay.exercises.length > 0 && (
          <div className="flex flex-col gap-3">
            {selectedDay.exercises.map((exercise, idx) => (
              <Card key={exercise.id} padding="none">
                <div className="p-4">
                  <span className="text-[9px] font-bold text-accent">EXERCISE {idx + 1}</span>
                  <h3 className="text-[20px] font-bold font-[family-name:var(--font-display)] uppercase tracking-wide mt-0.5">
                    {exercise.exercise_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-[1px]">
                      {exercise.target_sets} SETS
                    </span>
                    <span className="text-[9px] text-text-muted">&middot;</span>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-[1px]">
                      {exercise.target_rep_min === exercise.target_rep_max
                        ? `${exercise.target_rep_min} REPS`
                        : `${exercise.target_rep_min}-${exercise.target_rep_max} REPS`}
                    </span>
                  </div>
                  {exercise.notes && (
                    <p className="text-sm text-text-muted mt-1.5">{exercise.notes}</p>
                  )}
                </div>
              </Card>
            ))}

            {/* Start Workout button */}
            <button
              onClick={() => navigate(`/workouts/session/${selectedDay.id}`)}
              className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
            >
              <Play size={18} fill="white" />
              Start Workout
            </button>
          </div>
        )}

        {/* Rest day */}
        {selectedDay?.is_rest_day && (
          <Card className="flex flex-col items-center py-8">
            <Clock size={32} className="text-text-muted mb-2" />
            <p className="text-lg font-bold font-[family-name:var(--font-display)]">Recovery Day</p>
            <p className="text-sm text-text-muted mt-1">Rest and recharge for tomorrow</p>
          </Card>
        )}

        {/* View History link */}
        <button
          onClick={() => navigate('/workouts/history')}
          className="text-sm text-accent font-semibold text-center py-2 cursor-pointer hover:underline"
        >
          View Workout History
        </button>
      </div>
    </div>
    </PullToRefresh>
  )
}
