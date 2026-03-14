import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ExtractedSet } from '@/prompts/voice-extraction'
import { useState, useEffect } from 'react'

interface VoiceReviewModalProps {
  open: boolean
  onClose: () => void
  exerciseName: string
  sets: ExtractedSet[]
  extracting: boolean
  transcript: string
  onConfirm: (sets: ExtractedSet[]) => void
}

export function VoiceReviewModal({
  open,
  onClose,
  exerciseName,
  sets,
  extracting,
  transcript,
  onConfirm,
}: VoiceReviewModalProps) {
  const [editedSets, setEditedSets] = useState<ExtractedSet[]>(sets)

  useEffect(() => {
    if (sets.length > 0) setEditedSets(sets)
  }, [sets])

  const updateSet = (index: number, field: 'weight' | 'reps', value: number) => {
    setEditedSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={`Voice Log — ${exerciseName}`}>
      {transcript && (
        <div className="mb-4 p-3 bg-subtle rounded-xl border border-border-subtle">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">What you said</p>
          <p className="text-base text-text-secondary italic">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}

      {extracting ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-base text-text-muted">Extracting workout data...</p>
        </div>
      ) : editedSets.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-text-muted">No sets detected. Try speaking again.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold px-1">
              <span className="w-8 text-center">Set</span>
              <span className="flex-1 text-center">Weight (kg)</span>
              <span className="flex-1 text-center">Reps</span>
            </div>
            {editedSets.map((set, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 text-center text-base text-text-muted font-bold">{set.set}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={set.weight || ''}
                  onChange={(e) => updateSet(i, 'weight', parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-input border border-border rounded-xl px-3 py-2.5 text-center text-base font-semibold focus:outline-none focus:border-accent/40 min-h-[48px] transition-colors duration-200"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(i, 'reps', parseInt(e.target.value) || 0)}
                  className="flex-1 bg-input border border-border rounded-xl px-3 py-2.5 text-center text-base font-semibold focus:outline-none focus:border-accent/40 min-h-[48px] transition-colors duration-200"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onConfirm(editedSets)}>
              Confirm & Log
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
