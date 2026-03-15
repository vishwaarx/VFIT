import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { checkAndRecordPR } from '@/hooks/usePRDetection'
import type { WorkoutSession } from '@/types/database'
import type { PlanExercise } from '@/types/database'

interface SetData {
  weight: number
  reps: number
  logged: boolean
}

interface ExerciseState {
  exercise: PlanExercise
  sets: SetData[]
  previousSets: { weight: number; reps: number }[]
}

interface PRAlert {
  exerciseName: string
  weight: number
  reps: number
  type: 'weight' | 'reps' | '1rm' | null
}

interface SessionState {
  session: WorkoutSession | null
  exercises: ExerciseState[]
  isActive: boolean
  saving: boolean
  starting: boolean
  error: string | null
  prAlert: PRAlert | null

  startSession: (planId: string, exercises: PlanExercise[]) => Promise<void>
  loadPreviousPerformance: (exerciseNames: string[]) => Promise<void>
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<SetData>) => void
  logSet: (exerciseIndex: number, setIndex: number) => Promise<void>
  bulkLogSets: (exerciseIndex: number, sets: { weight: number; reps: number }[]) => Promise<void>
  applyVoiceSession: (exercises: { name: string; sets: { weight: number; reps: number }[] }[], transcript?: string) => Promise<void>
  completeSession: () => Promise<WorkoutSession | null>
  resetSession: () => void
  clearError: () => void
  dismissPR: () => void
}

export const useWorkoutSession = create<SessionState>((set, get) => ({
  session: null,
  exercises: [],
  isActive: false,
  saving: false,
  starting: false,
  error: null,
  prAlert: null,

  startSession: async (planId, exercises) => {
    // Guard against double-start race condition (C4)
    if (get().starting) return
    set({ starting: true, error: null })

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({ workout_plan_id: planId, date: new Date().toISOString().split('T')[0] })
      .select()
      .single()

    if (error || !data) {
      set({ starting: false, error: error?.message ?? 'Failed to create session' })
      return
    }

    const exerciseStates: ExerciseState[] = exercises.map((ex) => ({
      exercise: ex,
      sets: Array.from({ length: ex.target_sets }, () => ({ weight: 0, reps: 0, logged: false })),
      previousSets: [],
    }))

    set({ session: data, exercises: exerciseStates, isActive: true, starting: false })

    // Load previous performance in background
    get().loadPreviousPerformance(exercises.map((e) => e.exercise_name))
  },

  loadPreviousPerformance: async (exerciseNames) => {
    // W7: Limit query to recent logs only (last 200 rows across these exercises)
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('exercise_name, set_number, weight, reps, session_id')
      .in('exercise_name', exerciseNames)
      .order('created_at', { ascending: false })
      .limit(200)

    if (!logs?.length) return

    // Get the most recent session_id per exercise, then collect its logs
    const latestSessionByExercise = new Map<string, string>()
    for (const log of logs) {
      if (!latestSessionByExercise.has(log.exercise_name)) {
        latestSessionByExercise.set(log.exercise_name, log.session_id)
      }
    }

    const latestByExercise = new Map<string, { weight: number; reps: number }[]>()
    for (const log of logs) {
      if (log.session_id === latestSessionByExercise.get(log.exercise_name)) {
        if (!latestByExercise.has(log.exercise_name)) {
          latestByExercise.set(log.exercise_name, [])
        }
        latestByExercise.get(log.exercise_name)!.push({ weight: log.weight, reps: log.reps })
      }
    }

    set((state) => ({
      exercises: state.exercises.map((ex) => ({
        ...ex,
        previousSets: latestByExercise.get(ex.exercise.exercise_name) ?? [],
      })),
    }))
  },

  updateSet: (exerciseIndex, setIndex, data) => {
    set((state) => {
      const exercises = [...state.exercises]
      const exercise = { ...exercises[exerciseIndex] }
      const sets = [...exercise.sets]
      sets[setIndex] = { ...sets[setIndex], ...data }
      exercise.sets = sets
      exercises[exerciseIndex] = exercise
      return { exercises }
    })
  },

  logSet: async (exerciseIndex, setIndex) => {
    const state = get()
    if (!state.session) return

    const ex = state.exercises[exerciseIndex]
    const setData = ex.sets[setIndex]

    // W11: Guard against double-logging
    if (setData.logged) return
    if (setData.weight <= 0 && setData.reps <= 0) return

    set({ saving: true, error: null })

    const { error } = await supabase.from('workout_logs').insert({
      session_id: state.session.id,
      exercise_name: ex.exercise.exercise_name,
      set_number: setIndex + 1,
      weight: setData.weight,
      reps: setData.reps,
      unit: 'kg',
      is_pr: false,
    })

    if (error) {
      set({ saving: false, error: error.message })
      return
    }

    // Mark as logged
    state.updateSet(exerciseIndex, setIndex, { logged: true })

    // Check for PR in the background
    const prResult = await checkAndRecordPR(
      ex.exercise.exercise_name,
      setData.weight,
      setData.reps,
      state.session!.id,
    )

    if (prResult.isPR && prResult.record) {
      // Update the workout_log to mark is_pr = true
      await supabase
        .from('workout_logs')
        .update({ is_pr: true })
        .eq('session_id', state.session!.id)
        .eq('exercise_name', ex.exercise.exercise_name)
        .eq('set_number', setIndex + 1)

      set({
        saving: false,
        prAlert: {
          exerciseName: prResult.record.exercise_name,
          weight: prResult.record.weight,
          reps: prResult.record.reps,
          type: prResult.type,
        },
      })
    } else {
      set({ saving: false })
    }
  },

  bulkLogSets: async (exerciseIndex, setsData) => {
    const state = get()
    if (!state.session) return

    const ex = state.exercises[exerciseIndex]
    set({ saving: true, error: null })

    const inserts = setsData.map((s, i) => ({
      session_id: state.session!.id,
      exercise_name: ex.exercise.exercise_name,
      set_number: i + 1,
      weight: s.weight,
      reps: s.reps,
      unit: 'kg',
      is_pr: false,
    }))

    const { error } = await supabase.from('workout_logs').insert(inserts)

    if (error) {
      set({ saving: false, error: error.message })
      return
    }

    set((prev) => ({
      saving: false,
      exercises: prev.exercises.map((e, ei) => {
        if (ei !== exerciseIndex) return e
        const newSets = [...e.sets]
        setsData.forEach((s, i) => {
          if (i < newSets.length) {
            newSets[i] = { weight: s.weight, reps: s.reps, logged: true }
          }
        })
        return { ...e, sets: newSets }
      }),
    }))
  },

  applyVoiceSession: async (voiceExercises, transcript) => {
    const state = get()
    if (!state.session) return

    set({ saving: true, error: null })

    const inserts: { session_id: string; exercise_name: string; set_number: number; weight: number; reps: number; unit: string; is_pr: boolean }[] = []

    for (const ve of voiceExercises) {
      // C1: Use enumeration index for set_number, not indexOf
      ve.sets.forEach((s, i) => {
        inserts.push({
          session_id: state.session!.id,
          exercise_name: ve.name,
          set_number: i + 1,
          weight: s.weight,
          reps: s.reps,
          unit: 'kg',
          is_pr: false,
        })
      })
    }

    if (inserts.length > 0) {
      const { error } = await supabase.from('workout_logs').insert(inserts)
      if (error) {
        set({ saving: false, error: error.message })
        return
      }
    }

    // Save voice transcript to session (G3)
    if (transcript) {
      await supabase
        .from('workout_sessions')
        .update({ voice_transcript: transcript })
        .eq('id', state.session!.id)
    }

    // Update local state to reflect voice-logged sets
    set((prev) => ({
      saving: false,
      exercises: prev.exercises.map((e) => {
        const voiceEx = voiceExercises.find(
          (ve) => ve.name.toLowerCase() === e.exercise.exercise_name.toLowerCase()
        )
        if (!voiceEx) return e

        const newSets = [...e.sets]
        voiceEx.sets.forEach((vs, i) => {
          if (i < newSets.length) {
            newSets[i] = { weight: vs.weight, reps: vs.reps, logged: true }
          }
        })
        return { ...e, sets: newSets }
      }),
    }))
  },

  completeSession: async () => {
    const state = get()
    if (!state.session) return null

    set({ error: null })

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', state.session.id)
      .select()
      .single()

    if (error) {
      set({ error: error.message })
      return null
    }

    set({ session: data, isActive: false })
    return data
  },

  resetSession: () => {
    set({ session: null, exercises: [], isActive: false, saving: false, starting: false, error: null })
  },

  clearError: () => set({ error: null }),
  dismissPR: () => set({ prAlert: null }),
}))
