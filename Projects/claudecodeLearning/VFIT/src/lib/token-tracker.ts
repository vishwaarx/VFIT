import { supabase } from './supabase'

interface TokenUsageEntry {
  model: string
  deployment: string
  feature: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export async function trackTokenUsage(entry: TokenUsageEntry) {
  try {
    await supabase.from('token_usage').insert(entry)
  } catch (err) {
    console.warn('Failed to track token usage:', err)
  }
}

// Cost per 1M tokens for deployed models
const COST_TABLE: Record<string, { input: number; output: number }> = {
  'gpt-4.1': { input: 2.0, output: 8.0 },
  'gpt-4o': { input: 2.5, output: 10.0 },
}

export function estimateCost(
  deployment: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const rates = COST_TABLE[deployment] ?? COST_TABLE['gpt-4.1']
  return (promptTokens / 1_000_000) * rates.input + (completionTokens / 1_000_000) * rates.output
}
