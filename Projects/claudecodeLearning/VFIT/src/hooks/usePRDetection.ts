import { supabase } from '@/lib/supabase'
import { calculate1RM } from '@/lib/utils'
import type { PersonalRecord } from '@/types/database'

interface PRCheckResult {
  isPR: boolean
  type: 'weight' | 'reps' | '1rm' | null
  record: { exercise_name: string; weight: number; reps: number; estimated_1rm: number } | null
}

export async function checkAndRecordPR(
  exerciseName: string,
  weight: number,
  reps: number,
  sessionId: string,
): Promise<PRCheckResult> {
  if (weight <= 0 || reps <= 0) return { isPR: false, type: null, record: null }

  const est1rm = calculate1RM(weight, reps)

  // Get existing PRs for this exercise
  const { data: existing } = await supabase
    .from('personal_records')
    .select('*')
    .eq('exercise_name', exerciseName)
    .order('estimated_1rm', { ascending: false })
    .limit(1)

  const currentBest = existing?.[0] as PersonalRecord | undefined

  let isPR = false
  let prType: 'weight' | 'reps' | '1rm' | null = null

  if (!currentBest) {
    // First ever record for this exercise
    isPR = true
    prType = '1rm'
  } else if (est1rm > currentBest.estimated_1rm) {
    isPR = true
    prType = '1rm'
  } else if (weight > currentBest.weight) {
    isPR = true
    prType = 'weight'
  } else if (weight === currentBest.weight && reps > currentBest.reps) {
    isPR = true
    prType = 'reps'
  }

  if (isPR) {
    await supabase.from('personal_records').insert({
      exercise_name: exerciseName,
      weight,
      reps,
      estimated_1rm: est1rm,
      achieved_date: new Date().toISOString().split('T')[0],
      session_id: sessionId,
    })

    return {
      isPR: true,
      type: prType,
      record: { exercise_name: exerciseName, weight, reps, estimated_1rm: est1rm },
    }
  }

  return { isPR: false, type: null, record: null }
}

export async function getAllPRs(): Promise<PersonalRecord[]> {
  const { data } = await supabase
    .from('personal_records')
    .select('*')
    .order('achieved_date', { ascending: false })

  return data ?? []
}

/** Get best PR per exercise (highest est 1RM) */
export async function getBestPRsByExercise(): Promise<Map<string, PersonalRecord>> {
  const all = await getAllPRs()
  const best = new Map<string, PersonalRecord>()

  for (const pr of all) {
    const existing = best.get(pr.exercise_name)
    if (!existing || pr.estimated_1rm > existing.estimated_1rm) {
      best.set(pr.exercise_name, pr)
    }
  }

  return best
}
