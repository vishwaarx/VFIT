import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { haptic } from '@/lib/haptics'

interface MicButtonProps {
  isListening: boolean
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const sizes = {
  sm: { button: 'w-12 h-12', icon: 18 },
  md: { button: 'w-14 h-14', icon: 22 },
  lg: { button: 'w-16 h-16', icon: 26 },
}

export function MicButton({ isListening, onClick, size = 'md', disabled = false, className = '' }: MicButtonProps) {
  const s = sizes[size]

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Pulse rings when recording */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/25"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/15"
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/8"
            animate={{ scale: [1, 2.2], opacity: [0.25, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />
        </>
      )}

      <button
        onClick={() => { haptic('light'); onClick() }}
        disabled={disabled}
        aria-label={isListening ? 'Stop recording' : 'Start voice recording'}
        className={`${s.button} rounded-full flex items-center justify-center transition-all duration-200 relative z-10 cursor-pointer ${
          isListening
            ? 'bg-accent text-white glow-accent'
            : 'bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30'
        } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {isListening ? <MicOff size={s.icon} /> : <Mic size={s.icon} />}
      </button>
    </div>
  )
}
