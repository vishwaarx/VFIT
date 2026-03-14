import { motion } from 'framer-motion'
import { Check, Zap, Flame, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WARRIOR_TIERS } from '@/lib/constants'
import { useMemo } from 'react'

interface WorkoutCompleteCelebrationProps {
  open: boolean
  onClose: () => void
  dayLabel: string
  duration: number
  exerciseCount: number
  totalSets: number
  totalVolume: number
  streakDays: number
  powerGain: number
  currentPowerLevel: number
}

export function WorkoutCompleteCelebration({
  open,
  onClose,
  dayLabel,
  duration,
  exerciseCount,
  totalSets,
  totalVolume,
  streakDays,
  powerGain,
  currentPowerLevel,
}: WorkoutCompleteCelebrationProps) {
  const warriorImage = useMemo(() => {
    let img = WARRIOR_TIERS[0].image
    for (let i = WARRIOR_TIERS.length - 1; i >= 0; i--) {
      if (streakDays >= WARRIOR_TIERS[i].day) {
        img = WARRIOR_TIERS[i].image
        break
      }
    }
    return img
  }, [streakDays])

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-sm px-6"
    >
      {/* Character */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="relative w-[120px] h-[120px] rounded-xl overflow-hidden bg-card border border-border mb-4"
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,69,0,0.2) 0%, #0A0A0A 80%)' }}
        />
        <img
          src={warriorImage}
          alt="Your warrior"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1 mb-4"
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-2" style={{ boxShadow: '0 0 24px rgba(255,69,0,0.4)' }}>
          <Check size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Workout Complete!</h2>
        <p className="text-sm text-text-secondary">{dayLabel} — {duration} min</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 w-full max-w-xs mb-4"
      >
        {[
          { label: 'Exercises', value: exerciseCount },
          { label: 'Total Sets', value: totalSets },
          { label: 'Volume', value: `${totalVolume.toLocaleString()}kg` },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-accent font-[family-name:var(--font-display)]">{value}</span>
            <span className="text-[11px] text-text-muted">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Power Level gain */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs flex items-center justify-center gap-3 py-3 rounded-xl border border-accent mb-3"
        style={{ background: 'linear-gradient(90deg, rgba(255,69,0,0.12) 0%, rgba(255,69,0,0.03) 100%)' }}
      >
        <Zap size={18} className="text-accent" />
        <span className="text-lg font-bold text-accent font-[family-name:var(--font-display)]">Power Level +{powerGain}</span>
        <span className="text-sm text-text-secondary">→ {currentPowerLevel.toLocaleString()}</span>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs flex items-center justify-center gap-2.5 py-3 rounded-xl bg-card border border-border mb-6"
      >
        <Flame size={18} className="text-accent" />
        <span className="text-base font-bold font-[family-name:var(--font-display)]">{streakDays} Day Streak!</span>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs flex gap-3"
      >
        <Button variant="secondary" className="flex-1" onClick={() => {}}>
          <Share2 size={16} />
          Share
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Done
        </Button>
      </motion.div>
    </motion.div>
  )
}
