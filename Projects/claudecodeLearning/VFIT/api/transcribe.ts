import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_TIMEOUT_MS = 15000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const geminiKey = process.env.GEMINI_API_KEY

  if (!geminiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' })
  }

  const { audio, mimeType, lang } = req.body ?? {}

  if (!audio || !mimeType) {
    return res.status(400).json({ error: 'Missing required fields: audio (base64), mimeType' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: audio,
                },
              },
              {
                text: `Transcribe this audio to text. Language: ${lang ?? 'en'}. Return ONLY the transcribed text, nothing else. No quotes, no labels, no explanation.`,
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({ error: `Gemini error: ${error}` })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return res.status(200).json({ text: text.trim() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(502).json({ error: `Transcription proxy error: ${message}` })
  } finally {
    clearTimeout(timeout)
  }
}
