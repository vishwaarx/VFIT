import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { MicButton } from '@/components/ui/MicButton'
import { SetRow } from './SetRow'
import { VoiceReviewModal } from './VoiceReviewModal'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useVoiceExtraction } from '@/hooks/useVoiceExtraction'
import type { PlanExercise } from '@/types/database'
import type { ExtractedSet } from '@/prompts/voice-extraction'

interface ExerciseCardProps {
  exercise: PlanExercise
  exerciseIndex: number
  sets: { weight: number; reps: number; logged: boolean }[]
  previousSets: { weight: number; reps: number }[]
  onUpdateSet: (setIndex: number, data: { weight?: number; reps?: number }) => void
  onLogSet: (setIndex: number) => void
  onBulkLogSets: (sets: { weight: number; reps: number }[]) => void
  saving: boolean
  aiSuggestion?: string
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  sets,
  previousSets,
  onUpdateSet,
  onLogSet,
  onBulkLogSets,
  saving,
  aiSuggestion,
}: ExerciseCardProps) {
  const [showReview, setShowReview] = useState(false)
  const [extractedSets, setExtractedSets] = useState<ExtractedSet[]>([])
  const [savedTranscript, setSavedTranscript] = useState('')

  const voice = useVoiceRecognition()
  const extraction = useVoiceExtraction()

  const loggedCount = sets.filter((s) => s.logged).length
  const allLogged = loggedCount === sets.length

  const repRange =
    exercise.target_rep_min === exercise.target_rep_max
      ? `${exercise.target_rep_min}`
      : `${exercise.target_rep_min}-${exercise.target_rep_max}`

  const handleMicToggle = async () => {
    if (voice.isListening) {
      const transcript = await voice.stop()
      if (typeof transcript === 'string' && transcript.trim()) {
        setSavedTranscript(transcript)
        setShowReview(true)
        try {
          const result = await extraction.extractPerExercise(
            transcript,
            exercise.exercise_name,
            exercise.target_sets
          )
          setExtractedSets(result.sets)
        } catch {
          // Error shown in modal
        }
      }
    } else {
      voice.start()
    }
  }

  const handleConfirmVoice = (confirmed: ExtractedSet[]) => {
    onBulkLogSets(confirmed.map((s) => ({ weight: s.weight, reps: s.reps })))
    setShowReview(false)
    setExtractedSets([])
    setSavedTranscript('')
    voice.reset()
  }

  return (
    <>
      <Card padding="none" variant={allLogged ? 'accent' : undefined} className={allLogged ? 'border-success/15 bg-success/[0.03]' : ''}>
        {/* Header — always expanded, no accordion */}
        <div className="p-4 pb-2">
          <span className="text-[9px] font-bold text-accent">EXERCISE {exerciseIndex + 1}</span>
          <div className="flex items-center justify-between mt-0.5">
            <h3 className="text-[20px] font-bold font-[family-name:var(--font-display)] uppercase tracking-wide">
              {exercise.exercise_name}
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              allLogged ? 'bg-success/15 text-success' : 'bg-subtle-hover text-text-muted'
            }`}>
              {loggedCount}/{sets.length}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">
            {exercise.target_sets} sets &middot; {repRange} reps
            {exercise.notes && <span className="text-text-muted"> &mdash; {exercise.notes}</span>}
          </p>
        </div>

        {/* Previous performance */}
        {previousSets.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-text-muted">
              Previous: {previousSets.map((s) => `${s.weight}kg × ${s.reps}`).join(' / ')}
            </p>
          </div>
        )}

        {/* Voice + Sets */}
        <div className="px-4 pb-4">
          {/* Voice log button */}
          {!allLogged && voice.isSupported && (
            <div className="flex items-center gap-3 mb-3 p-2.5 bg-accent/[0.04] border border-accent/10 rounded-xl">
              <MicButton
                isListening={voice.isListening}
                onClick={handleMicToggle}
                size="sm"
              />
              <p className="text-sm text-text-secondary flex-1">
                {voice.isTranscribing ? (
                  <span className="text-amber-500 font-medium">Transcribing...</span>
                ) : voice.isListening ? (
                  <span className="text-accent font-medium">
                    {voice.interimTranscript || voice.transcript || (voice.isWhisper ? 'Recording... tap to stop' : 'Listening...')}
                  </span>
                ) : (
                  <span className="text-text-muted">Tap mic to voice log</span>
                )}
              </p>
            </div>
          )}

          {/* Column headers */}
          <div className="flex items-center gap-2.5 px-3 mb-1.5">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-[1px] w-7 text-center">SET</span>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-[1px] flex-1 text-center">KG</span>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-[1px] flex-1 text-center">REPS</span>
            <span className="w-11" />
          </div>

          {/* Set rows */}
          <div className="flex flex-col gap-1.5">
            {sets.map((setData, setIdx) => (
              <SetRow
                key={setIdx}
                setNumber={setIdx + 1}
                weight={setData.weight}
                reps={setData.reps}
                logged={setData.logged}
                previousWeight={previousSets[setIdx]?.weight}
                previousReps={previousSets[setIdx]?.reps}
                onWeightChange={(w) => onUpdateSet(setIdx, { weight: w })}
                onRepsChange={(r) => onUpdateSet(setIdx, { reps: r })}
                onLog={() => onLogSet(setIdx)}
                disabled={saving}
              />
            ))}
          </div>

          {/* AI Suggestion pill */}
          {aiSuggestion && !allLogged && (
            <div className="mt-3 px-3 py-2.5 rounded-xl bg-accent/[0.06] border border-accent/10">
              <p className="text-xs text-accent">{aiSuggestion}</p>
            </div>
          )}
        </div>
      </Card>

      <VoiceReviewModal
        open={showReview}
        onClose={() => {
          setShowReview(false)
          setExtractedSets([])
          setSavedTranscript('')
        }}
        exerciseName={exercise.exercise_name}
        sets={extractedSets}
        extracting={extraction.extracting}
        transcript={savedTranscript}
        onConfirm={handleConfirmVoice}
      />
    </>
  )
}
