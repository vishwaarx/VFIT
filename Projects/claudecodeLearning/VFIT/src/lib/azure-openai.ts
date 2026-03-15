import { trackTokenUsage } from './token-tracker'

// Current feature context — set before each call to tag usage
let _currentFeature = 'unknown'
export function setFeatureContext(feature: string) {
  _currentFeature = feature
}

export type AzureModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4.1'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionOptions {
  model: AzureModel
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' }
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const CLIENT_TIMEOUT_MS = 20000

export async function chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS)

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
        response_format: options.response_format,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI service error (${response.status}): ${error}`)
    }

    const data: ChatCompletionResponse = await response.json()

    // Track token usage in background (non-blocking)
    if (data.usage) {
      trackTokenUsage({
        model: options.model,
        deployment: options.model,
        feature: _currentFeature,
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      })
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

export async function chatCompletionJSON<T>(options: ChatCompletionOptions): Promise<T> {
  const response = await chatCompletion({
    ...options,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content) as T
}
