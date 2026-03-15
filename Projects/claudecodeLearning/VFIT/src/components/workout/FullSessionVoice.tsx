import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { MicButton } from '@/components/ui/MicButton'
import { Spinner } from '@/components/ui/Spinner'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useVoiceExtraction } from '@/hooks/useVoiceExtraction'
import type { FullSessionResult, ExtractedSet } from '@/prompts/voice-extraction'
import { useState } from 'react'

interface FullSessionVoiceProps {
  open: boolean
  onClose: () => void
  exerciseNames: string[]
  onConfirm: (exercises: FullSessionResult['exercises'], transcript: string) => void
}

export function FullSessionVoice({ open, onClose, exerciseNames, onConfirm }: FullSessionVoiceProps) {
  const voice = useVoiceRecognition()
  const extraction = useVoiceExtraction()
  const [result, setResult] = useState<FullSessionResult | null>(null)
  const [editedResult, setEditedResult] = useState<FullSessionResult | null>(null)

  const handleToggleRecord = async () => {
    if (voice.isListening) {
      await voice.stop()
    } else {
      setResult(null)
      setEditedResult(null)
      voice.start()
    }
  }

  const handleExtract = async () => {
    const transcript = voice.transcript
    if (!transcript.trim()) return

    try {
      const extracted = await extraction.extractFullSession(transcript, exerciseNames)
      setResult(extracted)
      setEditedResult(extracted)
    } catch {
      // Error is set in the hook
    }
  }

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    if (!editedResult) return
    setEditedResult({
      exercises: editedResult.exercises.map((ex, ei) =>
        ei === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIdx ? { ...s, [field]: value } : s
              ),
            }
          : ex
      ),
    })
  }

  const handleConfirm = () => {
    if (editedResult) {
      onConfirm(editedResult.exercises, voice.transcript)
      handleClose()
    }
  }

  const handleClose = () => {
    voice.reset()
    setResult(null)
    setEditedResult(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Voice Summary">
      <div className="flex flex-col gap-4">
        {/* Recording controls */}
        <div className="flex flex-col items-center gap-3 py-4">
          <MicButton isListening={voice.isListening} onClick={handleToggleRecord} size="lg" />
          <p className="text-base text-text-muted text-center max-w-[240px]">
            {voice.isListening
              ? 'Listening... Describe your entire workout'
              : voice.transcript
                ? 'Recording stopped. Review or extract.'
                : 'Tap to start recording your workout summary'}
          </p>
        </div>

        {/* Live transcript */}
        {(voice.transcript || voice.interimTranscript) && (
          <div className="p-3 bg-subtle rounded-xl border border-border-subtle max-h-32 overflow-y-auto">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Transcript</p>
            <p className="text-base text-text-secondary">
              {voice.transcript}
              {voice.interimTranscript && (
                <span className="text-text-muted italic"> {voice.interimTranscript}</span>
              )}
            </p>
          </div>
        )}

        {/* Extract button */}
        {voice.transcript && !voice.isListening && !result && (
          <Button onClick={handleExtract} loading={extraction.extracting} className="w-full">
            Extract Workout Data
          </Button>
        )}

        {extraction.extracting && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Spinner size="lg" />
            <p className="text-base text-text-muted">Parsing your workout...</p>
          </div>
        )}

        {extraction.error && (
          <p className="text-sm text-error text-center">{extraction.error}</p>
        )}

        {/* Editable results grid */}
        {editedResult && editedResult.exercises.length > 0 && (
          <div className="flex flex-col gap-4 max-h-64 overflow-y-auto">
            {editedResult.exercises.map((ex, exIdx) => (
              <div key={exIdx}>
                <p className="text-sm font-bold font-[family-name:var(--font-display)] tracking-tight mb-2">{ex.name}</p>
                <div className="flex flex-col gap-1.5">
                  {ex.sets.map((set: ExtractedSet, setIdx: number) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <span className="w-6 text-xs text-text-muted font-bold text-center">#{set.set}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-input border border-border rounded-xl px-2 py-2 text-center text-base font-semibold focus:outline-none focus:border-accent/40 min-h-[48px] transition-colors duration-200"
                      />
                      <span className="text-xs text-text-muted">kg</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                        className="flex-1 bg-input border border-border rounded-xl px-2 py-2 text-center text-base font-semibold focus:outline-none focus:border-accent/40 min-h-[48px] transition-colors duration-200"
                      />
                      <span className="text-xs text-text-muted">reps</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {editedResult && editedResult.exercises.length === 0 && (
          <p className="text-base text-text-muted text-center py-4">
            No exercises detected. Try recording again.
          </p>
        )}

        {/* Confirm / Cancel */}
        {editedResult && editedResult.exercises.length > 0 && (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Confirm All
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
