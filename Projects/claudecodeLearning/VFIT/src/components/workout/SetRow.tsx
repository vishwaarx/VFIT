import { Check } from 'lucide-react'
import { haptic } from '@/lib/haptics'

interface SetRowProps {
  setNumber: number
  weight: number
  reps: number
  logged: boolean
  previousWeight?: number
  previousReps?: number
  onWeightChange: (weight: number) => void
  onRepsChange: (reps: number) => void
  onLog: () => void
  disabled: boolean
}

export function SetRow({
  setNumber,
  weight,
  reps,
  logged,
  previousWeight,
  previousReps,
  onWeightChange,
  onRepsChange,
  onLog,
  disabled,
}: SetRowProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 ${
        logged ? 'bg-success-muted border border-success/10' : 'bg-subtle'
      }`}
    >
      {/* Set number */}
      <span className={`text-xs font-bold w-7 text-center rounded-lg py-1 ${
        logged ? 'text-success' : 'text-text-muted'
      }`}>{setNumber}</span>

      {/* Weight input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          placeholder={previousWeight ? `${previousWeight}` : 'kg'}
          value={weight || ''}
          onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
          disabled={logged || disabled}
          className="w-full bg-card-elevated border border-border-strong rounded-xl px-3 py-2.5 text-center text-base font-semibold placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 focus:bg-accent/[0.03] disabled:opacity-40 min-h-[44px] transition-all duration-200"
        />
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          placeholder={previousReps ? `${previousReps}` : 'reps'}
          value={reps || ''}
          onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
          disabled={logged || disabled}
          className="w-full bg-card-elevated border border-border-strong rounded-xl px-3 py-2.5 text-center text-base font-semibold placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 focus:bg-accent/[0.03] disabled:opacity-40 min-h-[44px] transition-all duration-200"
        />
      </div>

      {/* Log button */}
      <button
        onClick={() => { haptic('medium'); onLog() }}
        disabled={logged || disabled || (weight <= 0 && reps <= 0)}
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
          logged
            ? 'bg-success/20 text-success border border-success/20'
            : weight > 0 || reps > 0
              ? 'bg-gradient-to-br from-accent to-accent-hover text-white shadow-md shadow-accent/20'
              : 'bg-subtle-hover border border-border text-text-muted'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        <Check size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}
