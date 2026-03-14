import { useState, useRef, useCallback } from 'react'
import {
  createRecognition,
  createWhisperRecorder,
  isVoiceSupported,
  isWhisperMode,
  type WhisperRecorder,
} from '@/lib/voice'

interface UseVoiceRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  isSupported: boolean
  /** True when using MediaRecorder + Whisper (no interim results) */
  isWhisper: boolean
  /** True when Whisper is transcribing after stop */
  isTranscribing: boolean
  start: () => void
  stop: () => string | Promise<string>
  reset: () => void
  error: string | null
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null)
  const whisperRef = useRef<WhisperRecorder | null>(null)
  const transcriptRef = useRef('')

  const whisper = isWhisperMode()

  const start = useCallback(() => {
    setError(null)
    setInterimTranscript('')
    transcriptRef.current = ''
    setTranscript('')

    if (whisper) {
      // iOS / Whisper path
      const recorder = createWhisperRecorder({
        onError: (err) => {
          setError(err)
          setIsListening(false)
        },
      })
      whisperRef.current = recorder
      recorder.start()
      setIsListening(true)
    } else {
      // Native Web Speech API path
      const recognition = createRecognition({
        continuous: true,
        interimResults: true,
        onResult: (text, isFinal) => {
          if (isFinal) {
            transcriptRef.current += (transcriptRef.current ? ' ' : '') + text
            setTranscript(transcriptRef.current)
            setInterimTranscript('')
          } else {
            setInterimTranscript(text)
          }
        },
        onError: (err) => {
          setError(err)
          setIsListening(false)
        },
        onEnd: () => {
          setIsListening(false)
          setInterimTranscript('')
        },
      })

      if (!recognition) {
        setError('Speech recognition not supported')
        return
      }

      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    }
  }, [whisper])

  const stop = useCallback((): string | Promise<string> => {
    setIsListening(false)
    setInterimTranscript('')

    if (whisper && whisperRef.current) {
      // Whisper path — async, returns transcript after API call
      setIsTranscribing(true)
      const recorder = whisperRef.current
      whisperRef.current = null

      return recorder.stop().then((text) => {
        transcriptRef.current = text
        setTranscript(text)
        setIsTranscribing(false)
        return text
      }).catch((err) => {
        setError(err instanceof Error ? err.message : 'Transcription failed')
        setIsTranscribing(false)
        return ''
      })
    }

    // Native path — sync, transcript already accumulated
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    return transcriptRef.current
  }, [whisper])

  const reset = useCallback(() => {
    if (whisperRef.current) {
      whisperRef.current.cancel()
      whisperRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setIsTranscribing(false)
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    transcriptRef.current = ''
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isVoiceSupported(),
    isWhisper: whisper,
    isTranscribing,
    start,
    stop,
    reset,
    error,
  }
}
