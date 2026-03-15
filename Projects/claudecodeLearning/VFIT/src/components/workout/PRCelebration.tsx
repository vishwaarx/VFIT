import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useEffect } from 'react'
import { haptic } from '@/lib/haptics'

interface PRCelebrationProps {
  show: boolean
  exerciseName: string
  weight: number
  reps: number
  type: 'weight' | 'reps' | '1rm' | null
  previousWeight?: number
  previousReps?: number
  estimated1RM?: number
  onDismiss: () => void
}

export function PRCelebration({ show, exerciseName, weight, reps, type, previousWeight, previousReps, estimated1RM, onDismiss }: PRCelebrationProps) {
  useEffect(() => {
    if (show) haptic('success')
  }, [show])

  // Calculate improvement percentage
  const improvementPct = previousWeight && previousWeight > 0
    ? (((weight - previousWeight) / previousWeight) * 100).toFixed(1)
    : null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onDismiss}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Confetti particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: ['#FF4500', '#F59E0B', '#32D74B', '#FF6B35', '#FFD60A', '#FF453A'][i % 6],
                left: `${Math.random() * 100}%`,
                top: '-5%',
              }}
              animate={{
                y: ['0vh', `${60 + Math.random() * 40}vh`],
                x: `${(Math.random() - 0.5) * 200}px`,
                rotate: Math.random() * 720,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* PR card — gold border */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="relative glass-elevated rounded-3xl p-8 text-center max-w-[300px] mx-4 glow-gold border border-[#FFD60A]/40"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-pr-gold/15 flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-pr-gold" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight text-pr-gold mb-2">New PR!</h2>
            <p className="text-base font-semibold text-text-secondary mb-1">{exerciseName}</p>
            <p className="text-3xl font-bold text-white mb-2">
              {weight}kg &times; {reps}
            </p>
            <p className="text-sm text-text-muted">
              {type === 'weight' && 'New weight record'}
              {type === 'reps' && 'New rep record'}
              {type === '1rm' && 'New estimated 1RM'}
            </p>

            {/* Previous record comparison */}
            {previousWeight !== undefined && previousReps !== undefined && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[9px] font-bold text-text-muted tracking-[1px] uppercase mb-1.5">PREVIOUS RECORD</p>
                <p className="text-base text-text-secondary">
                  {previousWeight}kg × {previousReps} → <span className="font-bold text-white">{weight}kg × {reps}</span>
                </p>
                {improvementPct && (
                  <p className="text-sm text-success font-semibold mt-1">+{improvementPct}% improvement</p>
                )}
              </div>
            )}

            {/* Estimated 1RM badge */}
            {estimated1RM && (
              <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-pr-gold/10 rounded-full">
                <span className="text-xs font-bold text-pr-gold">Estimated 1RM: {estimated1RM} kg</span>
              </div>
            )}

            <p className="text-xs text-text-muted mt-5">Tap to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
