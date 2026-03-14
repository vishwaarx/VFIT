/** Prompts for extracting structured workout data from voice transcripts */

/** Per-exercise extraction: user spoke about a single exercise */
export function perExercisePrompt(exerciseName: string, targetSets: number): string {
  return `You are a workout logging assistant. Extract set data from the user's voice transcript for the exercise "${exerciseName}".

The user is expected to log up to ${targetSets} sets.

Rules:
- Extract weight (number) and reps (number) for each set mentioned
- Weight unit defaults to kg unless the user says "pounds" or "lbs"
- If the user says just a number for weight, assume it's the weight in kg
- If the user mentions "same" or "same weight", use the weight from the previous set
- Set numbers should be sequential starting from 1
- If only one set is mentioned, return just that one set
- Be generous with interpretation — gym speech is often informal

Return ONLY valid JSON in this format:
{
  "sets": [
    { "set": 1, "weight": 80, "reps": 10, "unit": "kg" }
  ]
}`
}

/** Full session extraction: user recapped entire workout */
export function fullSessionPrompt(exerciseNames: string[]): string {
  return `You are a workout logging assistant. Extract ALL exercise data from the user's voice transcript of their complete workout session.

The user's workout plan includes these exercises (in order):
${exerciseNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Rules:
- Match spoken exercise names to the plan exercises above (fuzzy match — "bench" = "Flat Bench Press", "incline" = "Incline Dumbbell Press", etc.)
- Extract weight and reps for each set of each exercise
- Weight unit defaults to kg unless the user says "pounds" or "lbs"
- If the user says "all sets" or "all three sets" with a single weight/rep, duplicate that for the number of sets mentioned
- If the user says "same" or "same weight", carry forward from previous set
- Set numbers should be sequential starting from 1 per exercise
- Only include exercises the user actually mentioned
- Be generous with interpretation — post-workout recaps are often informal and rushed

Return ONLY valid JSON in this format:
{
  "exercises": [
    {
      "name": "Flat Bench Press",
      "sets": [
        { "set": 1, "weight": 80, "reps": 10, "unit": "kg" },
        { "set": 2, "weight": 85, "reps": 8, "unit": "kg" }
      ]
    }
  ]
}`
}

/** Types for extraction results */
export interface ExtractedSet {
  set: number
  weight: number
  reps: number
  unit: string
}

export interface PerExerciseResult {
  sets: ExtractedSet[]
}

export interface FullSessionExercise {
  name: string
  sets: ExtractedSet[]
}

export interface FullSessionResult {
  exercises: FullSessionExercise[]
}
