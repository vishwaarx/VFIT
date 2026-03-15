import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { chatCompletion, setFeatureContext, type AzureModel } from '@/lib/azure-openai'
import {
  COACH_PERSONALITY,
  buildCoachContext,
  formatContextForPrompt,
} from '@/prompts/coach-system'
import {
  POST_WORKOUT_SYSTEM,
  buildPostWorkoutContext,
} from '@/prompts/post-workout-review'
import type { ChatMessage } from '@/types/database'

interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  triggerPostWorkoutReview: (sessionId: string) => Promise<void>
  triggerWeightCheckin: (weight: number, unit: string) => Promise<void>
  reload: () => void
}

/** Detect if a message needs gpt-4o (deep reasoning) vs gpt-4o-mini */
function selectModel(message: string): AzureModel {
  const deepPatterns = [
    /injur/i, /pain/i, /hurt/i, /form\s/i, /technique/i,
    /program/i, /periodiz/i, /deload/i, /plateau/i,
    /why\s+(should|do|does|is|am|are)/i, /explain/i, /how\s+does/i,
    /alternative/i, /substitute/i, /replace/i,
  ]
  if (deepPatterns.some((p) => p.test(message))) return 'gpt-4o'
  return 'gpt-4o-mini'
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contextRef = useRef<string>('')

  // Load messages and context
  const loadMessages = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages(data ?? [])

    // Pre-load coach context
    try {
      const ctx = await buildCoachContext()
      contextRef.current = formatContextForPrompt(ctx)
    } catch {
      contextRef.current = '--- No context available ---'
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const persistMessage = async (role: 'user' | 'assistant', content: string, metadata?: Record<string, unknown>) => {
    const { data } = await supabase
      .from('chat_messages')
      .insert({ role, content, metadata: metadata ?? null })
      .select()
      .single()
    return data as ChatMessage | null
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return

    setSending(true)
    setError(null)

    // Save user message
    const userMsg = await persistMessage('user', content)
    if (userMsg) setMessages((prev) => [...prev, userMsg])

    try {
      const model = selectModel(content)

      // Build conversation history (last 20 messages for context window)
      const recentMessages = [...messages.slice(-20)]
      if (userMsg) recentMessages.push(userMsg)

      const apiMessages = [
        { role: 'system' as const, content: `${COACH_PERSONALITY}\n\n${contextRef.current}` },
        ...recentMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ]

      setFeatureContext('coach_chat')
      const response = await chatCompletion({
        model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 512,
      })

      const assistantContent = response.choices[0].message.content

      const assistantMsg = await persistMessage('assistant', assistantContent, { model })
      if (assistantMsg) setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get response'
      setError(msg)
      // Save error as assistant message so user sees it
      const errorMsg = await persistMessage('assistant', `Sorry, I couldn't respond right now. (${msg})`)
      if (errorMsg) setMessages((prev) => [...prev, errorMsg])
    } finally {
      setSending(false)
    }
  }, [messages, sending])

  const triggerPostWorkoutReview = useCallback(async (sessionId: string) => {
    setSending(true)
    setError(null)

    try {
      const workoutContext = await buildPostWorkoutContext(sessionId)

      const apiMessages = [
        { role: 'system' as const, content: POST_WORKOUT_SYSTEM },
        { role: 'user' as const, content: workoutContext },
      ]

      setFeatureContext('post_workout_review')
      const response = await chatCompletion({
        model: 'gpt-4o',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 512,
      })

      const reviewContent = response.choices[0].message.content
      const assistantMsg = await persistMessage('assistant', reviewContent, { type: 'post_workout_review', session_id: sessionId })
      if (assistantMsg) setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate review')
    } finally {
      setSending(false)
    }
  }, [])

  const triggerWeightCheckin = useCallback(async (weight: number, unit: string) => {
    setSending(true)
    setError(null)

    try {
      // Log weight
      await supabase.from('weight_logs').insert({
        date: new Date().toISOString().split('T')[0],
        weight,
        unit,
      })

      // Save user message
      const userMsg = await persistMessage('user', `My weight today is ${weight}${unit}`, { type: 'weight_checkin' })
      if (userMsg) setMessages((prev) => [...prev, userMsg])

      // Refresh context with new weight
      const ctx = await buildCoachContext()
      contextRef.current = formatContextForPrompt(ctx)

      setFeatureContext('weight_checkin')
      const response = await chatCompletion({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `${COACH_PERSONALITY}\n\n${contextRef.current}\n\nThe user just logged their weight. Acknowledge it, comment briefly on the trend if available, and remind them of today's plan. Keep it under 60 words.` },
          { role: 'user', content: `I weighed in at ${weight}${unit} today.` },
        ],
        temperature: 0.7,
        max_tokens: 256,
      })

      const assistantContent = response.choices[0].message.content
      const assistantMsg = await persistMessage('assistant', assistantContent, { type: 'weight_checkin_response' })
      if (assistantMsg) setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process weight')
    } finally {
      setSending(false)
    }
  }, [])

  return { messages, loading, sending, error, sendMessage, triggerPostWorkoutReview, triggerWeightCheckin, reload: loadMessages }
}
