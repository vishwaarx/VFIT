export interface Profile {
  id: string
  name: string
  goal_weight: number | null
  daily_protein_target: number
  weight_unit: 'kg' | 'lbs'
  created_at: string
}

export interface WorkoutPlan {
  id: string
  day_of_week: number // 0=Monday, 6=Sunday
  day_label: string
  order: number
  is_rest_day: boolean
}

export interface PlanExercise {
  id: string
  workout_plan_id: string
  exercise_name: string
  target_sets: number
  target_rep_min: number
  target_rep_max: number
  order: number
  notes: string | null
}

export interface WorkoutSession {
  id: string
  workout_plan_id: string
  date: string
  started_at: string
  completed_at: string | null
  notes: string | null
  voice_transcript: string | null
}

export interface WorkoutLog {
  id: string
  session_id: string
  exercise_name: string
  set_number: number
  weight: number
  reps: number
  unit: string
  is_pr: boolean
  created_at: string
}

export interface WeightLog {
  id: string
  date: string
  weight: number
  unit: string
  notes: string | null
}

export interface ProteinLog {
  id: string
  date: string
  grams: number
  meal_label: string | null
  created_at: string
}

export interface PersonalRecord {
  id: string
  exercise_name: string
  weight: number
  reps: number
  estimated_1rm: number
  achieved_date: string
  session_id: string
}

export interface Badge {
  id: string
  badge_key: string
  badge_name: string
  description: string
  icon: string
  earned_at: string
}

export interface Streak {
  id: string
  streak_type: 'workout' | 'photo'
  current_count: number
  longest_count: number
  last_active_date: string
}

export interface WeeklyChallenge {
  id: string
  week_start_date: string
  challenge_text: string
  target_value: number
  current_value: number
  is_completed: boolean
  completed_at: string | null
}

export interface PhotoCheckin {
  id: string
  date: string
  photo_count: number
  notes: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata: Record<string, unknown> | null
}

export interface NotificationSettings {
  id: string
  morning_checkin_time: string
  missed_workout_time: string
  photo_checkin_day: number
  push_enabled: boolean
  fcm_token: string | null
}
