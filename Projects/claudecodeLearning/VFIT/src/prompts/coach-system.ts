import { supabase } from '@/lib/supabase'
import { format, subDays } from 'date-fns'

export const COACH_PERSONALITY = `You are VFIT Coach — a supportive, knowledgeable, and direct fitness companion. Your personality:

- Supportive but honest — celebrate wins, acknowledge struggles without sugarcoating
- Direct and concise — gym people don't want essays. Keep responses punchy.
- Knowledgeable — you understand progressive overload, periodization, recovery, nutrition
- Motivating without being cheesy — no "you got this champ!" energy, more like a training partner who genuinely cares
- Safety-conscious — always recommend consulting a doctor/physio for injuries or pain
- You use the user's actual data to personalize every response

IMPORTANT RULES:
- Never invent or hallucinate workout data. Only reference data provided in context.
- For injury/pain questions, always suggest professional help alongside your advice.
- Keep responses under 150 words unless the user asks a detailed question.
- Use metric units (kg) by default.`

interface CoachContext {
  recentWorkouts: string
  weightTrend: string
  streakInfo: string
  challengeInfo: string
  todayPlan: string
  proteinInfo: string
}

export async function buildCoachContext(): Promise<CoachContext> {
  const today = new Date()
  const weekAgo = subDays(today, 7)
  const todayStr = format(today, 'yyyy-MM-dd')
  const weekAgoStr = format(weekAgo, 'yyyy-MM-dd')
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1

  const [sessionsRes, weightRes, streakRes, challengeRes, planRes, proteinRes] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('date, completed_at, workout_plan_id')
      .not('completed_at', 'is', null)
      .gte('date', weekAgoStr)
      .order('date', { ascending: false })
      .limit(7),
    supabase
      .from('weight_logs')
      .select('date, weight, unit')
      .order('date', { ascending: false })
      .limit(7),
    supabase.from('streaks').select('*').eq('streak_type', 'workout').limit(1).maybeSingle(),
    supabase.from('weekly_challenges').select('*').eq('is_completed', false).order('week_start_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('workout_plans').select('day_label, is_rest_day').eq('day_of_week', dayOfWeek).maybeSingle(),
    supabase
      .from('protein_logs')
      .select('date, grams')
      .eq('date', todayStr),
  ])

  // Recent workouts
  const sessions = sessionsRes.data ?? []
  const recentWorkouts = sessions.length > 0
    ? `Completed ${sessions.length} workouts this week: ${sessions.map(s => format(new Date(s.date), 'EEE')).join(', ')}`
    : 'No workouts completed this week yet.'

  // Weight trend
  const weights = weightRes.data ?? []
  let weightTrend = 'No weight data logged yet.'
  if (weights.length >= 2) {
    const latest = weights[0]
    const avg = weights.slice(1).reduce((s, w) => s + w.weight, 0) / (weights.length - 1)
    const diff = latest.weight - avg
    weightTrend = `Latest weight: ${latest.weight}${latest.unit} (${diff > 0 ? '+' : ''}${diff.toFixed(1)}${latest.unit} vs 7-day avg)`
  } else if (weights.length === 1) {
    weightTrend = `Latest weight: ${weights[0].weight}${weights[0].unit} (only one reading)`
  }

  // Streak
  const streak = streakRes.data
  const streakInfo = streak
    ? `Current workout streak: ${streak.current_count} days (best: ${streak.longest_count})`
    : 'No streak data.'

  // Challenge
  const challenge = challengeRes.data
  const challengeInfo = challenge
    ? `Active challenge: "${challenge.challenge_text}" — ${challenge.current_value}/${challenge.target_value}`
    : 'No active challenge this week.'

  // Today's plan
  const plan = planRes.data
  const todayPlan = plan
    ? plan.is_rest_day ? 'Today is a rest day.' : `Today\'s workout: ${plan.day_label}`
    : 'No workout plan for today.'

  // Protein
  const proteinLogs = proteinRes.data ?? []
  const todayProtein = proteinLogs.reduce((sum, p) => sum + p.grams, 0)
  const proteinInfo = todayProtein > 0
    ? `Protein logged today: ${todayProtein}g`
    : 'No protein logged today.'

  return { recentWorkouts, weightTrend, streakInfo, challengeInfo, todayPlan, proteinInfo }
}

export function formatContextForPrompt(ctx: CoachContext): string {
  return `--- USER CONTEXT ---
${ctx.todayPlan}
${ctx.recentWorkouts}
${ctx.weightTrend}
${ctx.streakInfo}
${ctx.challengeInfo}
${ctx.proteinInfo}
--- END CONTEXT ---`
}
