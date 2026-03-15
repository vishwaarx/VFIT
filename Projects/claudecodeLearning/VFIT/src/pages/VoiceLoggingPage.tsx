import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, X } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useVoiceExtraction } from '@/hooks/useVoiceExtraction'
import { Card } from '@/components/ui/Card'

export function VoiceLoggingPage() {
  const navigate = useNavigate()
  const voice = useVoiceRecognition()
  const extraction = useVoiceExtraction()
  const [transcript, setTranscript] = useState('')

  // Randomized waveform bar heights
  const barHeights = useMemo(() =>
    Array.from({ length: 15 }, () => 12 + Math.random() * 36),
    []
  )

  const handleMicToggle = async () => {
    if (voice.isListening) {
      const result = await voice.stop()
      if (typeof result === 'string' && result.trim()) {
        setTranscript(result)
      }
    } else {
      setTranscript('')
      voice.start()
    }
  }

  const handleCancel = () => {
    if (voice.isListening) {
      voice.stop()
    }
    navigate(-1)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg px-6 safe-top safe-bottom">
      {/* Title */}
      <h1 className="text-[24px] font-bold font-[family-name:var(--font-display)] tracking-tight mb-1">
        {voice.isListening ? 'Listening...' : extraction.extracting ? 'Processing...' : 'Voice Log'}
      </h1>
      <p className="text-sm text-text-muted mb-8">
        {voice.isListening ? 'Speak your workout details' : 'Tap the mic to start recording'}
      </p>

      {/* Mic button with pulse rings */}
      <div className="relative mb-8">
        {/* Pulse rings when listening */}
        {voice.isListening && (
          <>
            <div className="absolute inset-0 w-[140px] h-[140px] -top-[35px] -left-[35px] rounded-full border border-accent/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 w-[100px] h-[100px] -top-[15px] -left-[15px] rounded-full border border-accent/30 animate-ping" style={{ animationDuration: '1.5s' }} />
          </>
        )}
        <button
          onClick={handleMicToggle}
          className={`relative z-10 w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
            voice.isListening
              ? 'bg-accent shadow-lg shadow-accent/40'
              : 'bg-card border-2 border-accent hover:bg-accent/10'
          }`}
        >
          <Mic size={28} className={voice.isListening ? 'text-white' : 'text-accent'} />
        </button>
      </div>

      {/* Waveform visualization */}
      {voice.isListening && (
        <div className="flex items-center gap-1 mb-8">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="w-1 bg-accent rounded-full animate-pulse"
              style={{
                height: `${h}px`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      )}

      {/* Live transcript display */}
      {(voice.transcript || voice.interimTranscript || transcript) && (
        <Card className="w-full max-w-sm mb-6">
          <p className="text-[9px] font-bold text-accent tracking-[1px] uppercase mb-2">TRANSCRIPT</p>
          <p className="text-base text-text-primary leading-relaxed">
            {voice.transcript || transcript}
            {voice.interimTranscript && (
              <span className="text-text-muted"> {voice.interimTranscript}</span>
            )}
          </p>
          {extraction.extracting && (
            <p className="text-xs text-accent mt-2 font-medium">Processing with AI...</p>
          )}
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-sm mt-auto pb-6">
        <button
          onClick={handleCancel}
          className="flex-1 h-12 bg-card border border-border rounded-lg font-semibold text-text-secondary flex items-center justify-center gap-2 cursor-pointer hover:bg-card-hover transition-colors duration-200"
        >
          <X size={18} />
          Cancel
        </button>
        {voice.isListening && (
          <button
            onClick={handleMicToggle}
            className="flex-1 h-12 bg-accent text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-accent-hover transition-colors duration-200"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  )
}
