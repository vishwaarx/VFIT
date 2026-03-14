import { useState, useCallback } from 'react'
import { chatCompletionJSON, setFeatureContext } from '@/lib/azure-openai'
import {
  perExercisePrompt,
  fullSessionPrompt,
  type PerExerciseResult,
  type FullSessionResult,
} from '@/prompts/voice-extraction'

interface UseVoiceExtractionReturn {
  extractPerExercise: (transcript: string, exerciseName: string, targetSets: number) => Promise<PerExerciseResult>
  extractFullSession: (transcript: string, exerciseNames: string[]) => Promise<FullSessionResult>
  extracting: boolean
  error: string | null
}

export function useVoiceExtraction(): UseVoiceExtractionReturn {
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractPerExercise = useCallback(async (
    transcript: string,
    exerciseName: string,
    targetSets: number,
  ): Promise<PerExerciseResult> => {
    setExtracting(true)
    setError(null)
    try {
      setFeatureContext('voice_extraction')
      const result = await chatCompletionJSON<PerExerciseResult>({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: perExercisePrompt(exerciseName, targetSets) },
          { role: 'user', content: transcript },
        ],
        temperature: 0.1,
        max_tokens: 512,
      })
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Extraction failed'
      setError(msg)
      throw err
    } finally {
      setExtracting(false)
    }
  }, [])

  const extractFullSession = useCallback(async (
    transcript: string,
    exerciseNames: string[],
  ): Promise<FullSessionResult> => {
    setExtracting(true)
    setError(null)
    try {
      setFeatureContext('voice_extraction')
      const result = await chatCompletionJSON<FullSessionResult>({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: fullSessionPrompt(exerciseNames) },
          { role: 'user', content: transcript },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      })
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Extraction failed'
      setError(msg)
      throw err
    } finally {
      setExtracting(false)
    }
  }, [])

  return { extractPerExercise, extractFullSession, extracting, error }
}
