import type { VercelRequest, VercelResponse } from '@vercel/node'

const DEPLOYMENT_MAP: Record<string, string> = {
  'gpt-4o-mini': 'gpt-4.1',
  'gpt-4o': 'gpt-4o',
  'gpt-4.1': 'gpt-4.1',
}

const API_VERSION = '2024-08-01-preview'
const MAX_RETRIES = 2
const TIMEOUT_MS = 8000

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })

    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      const retryAfterHeader = response.headers.get('retry-after') ?? '1'
      const retryAfterMs = isNaN(Number(retryAfterHeader))
        ? Math.max(0, new Date(retryAfterHeader).getTime() - Date.now())
        : Number(retryAfterHeader) * 1000
      await new Promise(resolve => setTimeout(resolve, Math.max(retryAfterMs, 1000)))
      return fetchWithRetry(url, options, retries - 1)
    }

    return response
  } finally {
    clearTimeout(timeout)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_KEY

  if (!endpoint || !apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI not configured on server' })
  }

  const { model, messages, temperature, max_tokens, response_format } = req.body ?? {}

  if (!model || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required fields: model, messages' })
  }

  const deployment = DEPLOYMENT_MAP[model] ?? model
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${API_VERSION}`

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 1024,
        response_format,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message ?? 'Azure OpenAI error', details: data })
    }

    // Return full response including usage for client-side token tracking
    return res.status(200).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(502).json({ error: `Proxy error: ${message}` })
  }
}
