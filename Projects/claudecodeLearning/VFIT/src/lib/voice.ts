/** Voice input with dual backend:
 *  1. Web Speech API (Chrome, Edge — free, real-time interim results)
 *  2. MediaRecorder + Azure Whisper (iOS Safari, Firefox — works everywhere)
 */

type SpeechRecognitionInstance = InstanceType<typeof SpeechRecognition>

interface VoiceOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult: (transcript: string, isFinal: boolean) => void
  onError: (error: string) => void
  onEnd: () => void
}

// Check if native Web Speech API is available
function hasNativeSpeech(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// Check if MediaRecorder is available (iOS 14.5+, all modern browsers)
function hasMediaRecorder(): boolean {
  return typeof MediaRecorder !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
}

/** Voice is supported if either native speech or MediaRecorder + Whisper is available */
export function isVoiceSupported(): boolean {
  return hasNativeSpeech() || hasMediaRecorder()
}

/** Returns true if we'll use the Whisper fallback (no interim results) */
export function isWhisperMode(): boolean {
  return !hasNativeSpeech() && hasMediaRecorder()
}

// ─── Native Web Speech API ───────────────────────────────────────

export function createRecognition(options: VoiceOptions): SpeechRecognitionInstance | null {
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionAPI) return null

  const recognition = new SpeechRecognitionAPI()
  recognition.lang = options.lang ?? 'en-US'
  recognition.continuous = options.continuous ?? true
  recognition.interimResults = options.interimResults ?? true

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = ''
    let final = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }

    if (final) options.onResult(final, true)
    else if (interim) options.onResult(interim, false)
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'no-speech') return
    options.onError(event.error)
  }

  recognition.onend = () => {
    options.onEnd()
  }

  return recognition
}

// ─── MediaRecorder + Whisper Fallback ────────────────────────────

export interface WhisperRecorder {
  start: () => void
  stop: () => Promise<string>
  cancel: () => void
  isRecording: boolean
}

export function createWhisperRecorder(options: {
  lang?: string
  onError: (error: string) => void
}): WhisperRecorder {
  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let stream: MediaStream | null = null
  let recording = false

  const recorder: WhisperRecorder = {
    get isRecording() { return recording },

    start: async () => {
      try {
        audioChunks = []
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000,
          },
        })

        // Use webm if available, fall back to mp4 for iOS Safari
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : ''

        mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data)
        }

        mediaRecorder.start(250) // Collect in 250ms chunks
        recording = true
      } catch (err) {
        options.onError(err instanceof Error ? err.message : 'Microphone access denied')
      }
    },

    stop: async (): Promise<string> => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') return ''

      return new Promise((resolve) => {
        mediaRecorder!.onstop = async () => {
          recording = false

          // Stop all tracks
          stream?.getTracks().forEach((t) => t.stop())
          stream = null

          if (audioChunks.length === 0) {
            resolve('')
            return
          }

          const audioBlob = new Blob(audioChunks, { type: mediaRecorder!.mimeType || 'audio/webm' })
          audioChunks = []

          try {
            const transcript = await transcribeWithGemini(audioBlob, options.lang ?? 'en')
            resolve(transcript)
          } catch (err) {
            options.onError(err instanceof Error ? err.message : 'Transcription failed')
            resolve('')
          }
        }

        mediaRecorder!.stop()
      })
    },

    cancel: () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      stream?.getTracks().forEach((t) => t.stop())
      stream = null
      audioChunks = []
      recording = false
    },
  }

  return recorder
}

async function transcribeWithGemini(audioBlob: Blob, lang: string): Promise<string> {
  // Convert blob to base64
  const buffer = await audioBlob.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

  const mimeType = audioBlob.type || 'audio/webm'

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: base64, mimeType, lang }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Transcription error (${response.status}): ${error}`)
  }

  const data = await response.json()
  return (data.text ?? '').trim()
}

// Extend Window for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
