import { motion, AnimatePresence } from 'framer-motion'
import { Award } from 'lucide-react'
import { useEffect } from 'react'
import { haptic } from '@/lib/haptics'
import type { Badge } from '@/types/database'

interface BadgeCelebrationProps {
  badge: Badge | null
  onDismiss: () => void
}

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  useEffect(() => {
    if (badge) haptic('success')
  }, [badge])

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onDismiss}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative glass-elevated rounded-3xl p-8 text-center max-w-[280px] mx-4 border-accent/25 glow-accent"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <div className="text-5xl mb-4">{badge.icon}</div>
            </motion.div>

            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Award size={16} className="text-accent" />
              <h2 className="text-sm font-bold text-accent uppercase tracking-widest font-[family-name:var(--font-display)]">Badge Earned</h2>
            </div>

            <p className="text-xl font-bold mb-1">{badge.badge_name}</p>
            <p className="text-sm text-text-secondary">{badge.description}</p>

            <p className="text-xs text-text-muted mt-5">Tap to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
