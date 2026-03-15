import { supabase } from '@/lib/supabase'

export const POST_WORKOUT_SYSTEM = `You are VFIT Coach doing a post-workout review. Analyze the workout just completed and provide:

1. Key highlights (PRs, volume changes, strong performances)
2. Any notable patterns (consistent weights, rep improvements, fatigue signs)
3. Brief encouragement or constructive observation
4. One actionable tip for next session

Keep it under 120 words. Be specific — reference actual exercises and numbers.
Do NOT make up data that isn't provided.`

export async function buildPostWorkoutContext(sessionId: string): Promise<string> {
  const [logsRes, sessionRes] = await Promise.all([
    supabase
      .from('workout_logs')
      .select('exercise_name, set_number, weight, reps, is_pr')
      .eq('session_id', sessionId)
      .order('exercise_name')
      .order('set_number'),
    supabase
      .from('workout_sessions')
      .select('date, workout_plan_id')
      .eq('id', sessionId)
      .single(),
  ])

  const logs = logsRes.data ?? []
  const session = sessionRes.data

  if (logs.length === 0) return 'No exercise data recorded for this session.'

  // Get plan label
  let planLabel = 'Workout'
  if (session?.workout_plan_id) {
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('day_label')
      .eq('id', session.workout_plan_id)
      .single()
    if (plan) planLabel = plan.day_label
  }

  // Group by exercise
  const exercises = new Map<string, { weight: number; reps: number; isPr: boolean }[]>()
  for (const log of logs) {
    if (!exercises.has(log.exercise_name)) exercises.set(log.exercise_name, [])
    exercises.get(log.exercise_name)!.push({ weight: log.weight, reps: log.reps, isPr: log.is_pr })
  }

  let summary = `Workout: ${planLabel}\n`
  for (const [name, sets] of exercises) {
    const setsStr = sets.map((s) => `${s.weight}kg x ${s.reps}${s.isPr ? ' PR!' : ''}`).join(', ')
    const volume = sets.reduce((v, s) => v + s.weight * s.reps, 0)
    summary += `${name}: ${setsStr} (volume: ${Math.round(volume)}kg)\n`
  }

  const totalVolume = logs.reduce((v, l) => v + l.weight * l.reps, 0)
  summary += `\nTotal volume: ${Math.round(totalVolume)}kg across ${exercises.size} exercises, ${logs.length} sets`

  return summary
}
