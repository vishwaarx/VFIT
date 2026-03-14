// Missed workout push notification
// Triggered via pg_cron daily at the user's missed_workout_time (default 19:00)
// Checks if today is a workout day and no session was logged — sends a nudge

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { sendPushNotification } from '../_shared/fcm.ts'
import { getSupabaseClient, getFCMToken } from '../_shared/supabase.ts'

const nudgeMessages = [
  { title: "Haven't worked out yet? 🏋️", body: "There's still time to get your session in today!" },
  { title: 'Your workout is waiting 💪', body: "Don't break the streak — even a quick session counts." },
  { title: 'Missed your workout?', body: "No worries, but try to squeeze one in before bed!" },
  { title: 'Stay on track! 🔥', body: "You've got a workout scheduled today. Let's go!" },
]

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.includes('Bearer')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabase = getSupabaseClient()

    // Check if today is a workout day
    const today = new Date()
    const dayOfWeek = today.getDay()
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('is_rest_day, day_label')
      .eq('day_of_week', dayOfWeek)
      .single()

    // Don't send on rest days
    if (!plan || plan.is_rest_day) {
      return new Response(JSON.stringify({ sent: false, reason: 'rest_day' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if a workout session exists for today
    const todayStr = today.toISOString().split('T')[0]
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('date', todayStr)
      .limit(1)

    if (sessions && sessions.length > 0) {
      return new Response(JSON.stringify({ sent: false, reason: 'already_worked_out' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // No workout today — send nudge
    const fcmToken = await getFCMToken(supabase)
    if (!fcmToken) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_token' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const msg = nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)]
    const sent = await sendPushNotification(fcmToken, {
      title: msg.title,
      body: `${plan.day_label}: ${msg.body}`,
      data: { type: 'missed_workout', route: '/workouts' },
    })

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Missed workout error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
