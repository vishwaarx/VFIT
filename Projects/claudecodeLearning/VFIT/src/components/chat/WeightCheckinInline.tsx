import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Scale } from 'lucide-react'

interface WeightCheckinInlineProps {
  onSubmit: (weight: number, unit: string) => void
  disabled?: boolean
}

export function WeightCheckinInline({ onSubmit, disabled }: WeightCheckinInlineProps) {
  const [weight, setWeight] = useState('')

  const handleSubmit = () => {
    const w = parseFloat(weight)
    if (w > 0) {
      onSubmit(w, 'kg')
      setWeight('')
    }
  }

  return (
    <div className="flex gap-2.5 justify-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-accent/15">
        <Scale size={14} className="text-white" />
      </div>
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
        <p className="text-base text-text-secondary mb-2">Log your weight:</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 82.5"
            className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-base font-semibold text-center focus:outline-none focus:border-accent/40 min-h-[48px]"
          />
          <span className="text-base text-text-muted">kg</span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!weight || parseFloat(weight) <= 0 || disabled}
            className="!min-h-[48px] !rounded-xl"
          >
            Log
          </Button>
        </div>
      </div>
    </div>
  )
}
