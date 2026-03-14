import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { FullSessionVoice } from '@/components/workout/FullSessionVoice'
import { PRCelebration } from '@/components/workout/PRCelebration'
import { BadgeCelebration } from '@/components/ui/BadgeCelebration'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { MicButton } from '@/components/ui/MicButton'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan'
import { useStreaks } from '@/hooks/useStreaks'
import { useBadges } from '@/hooks/useBadges'
import { isVoiceSupported } from '@/lib/voice'
import { Timer, CheckCircle2 } from 'lucide-react'

export function WorkoutSessionPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()
  const { days, loading: planLoading } = useWorkoutPlan()
  const {
    session, exercises, isActive, saving, prAlert,
    startSession, updateSet, logSet, bulkLogSets, applyVoiceSession,
    completeSession, resetSession, dismissPR,
  } = useWorkoutSession()
  const { incrementWorkoutStreak } = useStreaks()
  const { newBadge, checkAndAward, dismissNewBadge } = useBadges()
  const [completing, setCompleting] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showFullVoice, setShowFullVoice] = useState(false)

  const day = days.find((d) => d.id === dayId)

  const starting = useWorkoutSession((s) => s.starting)
  const sessionError = useWorkoutSession((s) => s.error)

  useEffect(() => {
    if (!day || starting) return
    if (session && session.workout_plan_id !== day.id) {
      resetSession()
      return
    }
    if (!isActive && !session) {
      startSession(day.id, day.exercises)
    }
  }, [day, isActive, session, starting, startSession, resetSession])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleComplete = async () => {
    setCompleting(true)
    const completedSession = await completeSession()
    setCompleting(false)

    if (completedSession) {
      sessionStorage.setItem('vfit_pending_review', completedSession.id)
      await incrementWorkoutStreak()
      await checkAndAward()
    }

    resetSession()
    navigate('/coach', { replace: true })
  }

  const handleFullVoiceConfirm = async (
    voiceExercises: { name: string; sets: { set: number; weight: number; reps: number; unit: string }[] }[],
    transcript: string,
  ) => {
    await applyVoiceSession(
      voiceExercises.map((e) => ({
        name: e.name,
        sets: e.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
      })),
      transcript,
    )
    setShowFullVoice(false)
  }

  if (planLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <p className="text-text-secondary">Workout plan not found</p>
        <Button variant="secondary" onClick={() => navigate('/workouts')}>Back to Workouts</Button>
      </div>
    )
  }

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const loggedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.logged).length, 0)
  const exerciseNames = exercises.map((e) => e.exercise.exercise_name)
  const progress = totalSets > 0 ? (loggedSets / totalSets) * 100 : 0

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Error banner */}
      {sessionError && (
        <div className="mx-5 p-3 bg-error-muted border border-error/20 rounded-xl">
          <p className="text-sm text-error">{sessionError}</p>
        </div>
      )}

      <PageHeader
        title={day.day_label}
        subtitle={`${loggedSets}/${totalSets} sets completed`}
        action={
          <div className="flex items-center gap-1.5 bg-subtle-hover rounded-xl px-3 py-1.5">
            <Timer size={14} className="text-text-muted" />
            <span className="text-sm font-mono text-text-secondary">{formatTime(elapsed)}</span>
          </div>
        }
      />

      {/* Progress bar */}
      <div className="px-5">
        <div className="h-1 bg-subtle-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Full session voice summary button */}
      {isVoiceSupported() && (
        <div className="px-5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowFullVoice(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowFullVoice(true) } }}
            className="w-full flex items-center gap-3 p-3.5 glass border-accent/10 rounded-2xl hover:bg-accent/[0.04] transition-all duration-200 cursor-pointer"
          >
            <MicButton isListening={false} onClick={() => {}} size="sm" disabled />
            <div className="text-left">
              <p className="text-sm font-bold text-accent">Voice Summary</p>
              <p className="text-xs text-text-muted">Recap your entire workout at once</p>
            </div>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="px-5 flex flex-col gap-3">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.exercise.id}
            exercise={ex.exercise}
            exerciseIndex={i}
            sets={ex.sets}
            previousSets={ex.previousSets}
            onUpdateSet={(setIdx, data) => updateSet(i, setIdx, data)}
            onLogSet={(setIdx) => logSet(i, setIdx)}
            onBulkLogSets={(sets) => bulkLogSets(i, sets)}
            saving={saving}
          />
        ))}
      </div>

      {/* Complete button - fixed at bottom */}
      <div className="fixed bottom-24 left-0 right-0 px-5 safe-bottom">
        <Button
          className="w-full gap-2 !rounded-2xl"
          size="lg"
          onClick={handleComplete}
          loading={completing}
          disabled={loggedSets === 0}
        >
          <CheckCircle2 size={20} />
          Complete Workout
        </Button>
      </div>

      {/* Full session voice modal */}
      <FullSessionVoice
        open={showFullVoice}
        onClose={() => setShowFullVoice(false)}
        exerciseNames={exerciseNames}
        onConfirm={handleFullVoiceConfirm}
      />

      {/* PR Celebration */}
      <PRCelebration
        show={!!prAlert}
        exerciseName={prAlert?.exerciseName ?? ''}
        weight={prAlert?.weight ?? 0}
        reps={prAlert?.reps ?? 0}
        type={prAlert?.type ?? null}
        onDismiss={dismissPR}
      />

      {/* Badge Celebration */}
      <BadgeCelebration badge={newBadge} onDismiss={dismissNewBadge} />
    </div>
  )
}
