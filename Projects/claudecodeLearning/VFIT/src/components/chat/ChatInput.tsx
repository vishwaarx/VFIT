import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { MicButton } from '@/components/ui/MicButton'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const voice = useVoiceRecognition()

  const handleSend = () => {
    const text = message.trim()
    if (!text) return
    onSend(text)
    setMessage('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicToggle = async () => {
    if (voice.isListening) {
      const transcript = await voice.stop()
      if (typeof transcript === 'string' && transcript.trim()) {
        setMessage((prev) => (prev ? prev + ' ' : '') + transcript)
      }
    } else {
      voice.start()
    }
  }

  return (
    <div className="px-4 pb-4 safe-bottom">
      {/* Voice transcript preview */}
      {voice.isTranscribing && (
        <div className="mb-2 px-3.5 py-2.5 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl text-sm text-amber-500 font-medium">
          Transcribing audio...
        </div>
      )}
      {voice.isListening && (voice.transcript || voice.interimTranscript || voice.isWhisper) && (
        <div className="mb-2 px-3.5 py-2.5 bg-accent/[0.06] border border-accent/15 rounded-xl text-sm text-accent">
          {voice.transcript}
          {voice.interimTranscript && (
            <span className="opacity-50"> {voice.interimTranscript}</span>
          )}
          {voice.isWhisper && !voice.transcript && (
            <span>Recording... tap mic to stop</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 bg-card border border-border rounded-full p-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach..."
          disabled={disabled}
          className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted px-3 py-2 focus:outline-none min-h-[44px]"
        />
        {voice.isSupported && (
          <MicButton
            isListening={voice.isListening}
            onClick={handleMicToggle}
            size="sm"
            disabled={disabled}
          />
        )}
        <button
          className="w-11 h-11 bg-accent rounded-full text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
          disabled={!message.trim() || disabled}
          onClick={handleSend}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
