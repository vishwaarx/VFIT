// Weekly challenge generation + push notification
// Triggered via pg_cron every Monday morning
// Generates a new weekly challenge based on recent workout data, stores it, and notifies the user

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { sendPushNotification } from '../_shared/fcm.ts'
import { getSupabaseClient, getFCMToken } from '../_shared/supabase.ts'

const challenges = [
  { text: 'Complete all scheduled workouts this week', target: 5 },
  { text: 'Log protein every day this week', target: 7 },
  { text: 'Hit your protein target 5 out of 7 days', target: 5 },
  { text: 'Set a new personal record on any exercise', target: 1 },
  { text: 'Do at least 20 total sets in one session', target: 1 },
  { text: 'Log your weight every day this week', target: 7 },
  { text: 'Complete a workout in under 60 minutes', target: 1 },
  { text: 'Increase weight on 3 different exercises', target: 3 },
  { text: 'Take a progress photo this week', target: 1 },
  { text: 'Maintain your workout streak for 7 days', target: 7 },
  { text: 'Log every set with voice commands', target: 1 },
  { text: 'Do an extra set on your weakest exercise', target: 1 },
]

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.includes('Bearer')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabase = getSupabaseClient()

    // Calculate this week's Monday
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const weekStart = monday.toISOString().split('T')[0]

    // Check if challenge already exists for this week
    const { data: existing } = await supabase
      .from('weekly_challenges')
      .select('id')
      .eq('week_start_date', weekStart)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ created: false, reason: 'already_exists' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Pick a random challenge (in production, use Azure OpenAI for personalized challenges)
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]

    // Insert the challenge
    const { data: inserted, error } = await supabase
      .from('weekly_challenges')
      .insert({
        week_start_date: weekStart,
        challenge_text: challenge.text,
        target_value: challenge.target,
        current_value: 0,
        is_completed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert challenge error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Send push notification
    const fcmToken = await getFCMToken(supabase)
    let sent = false

    if (fcmToken) {
      sent = await sendPushNotification(fcmToken, {
        title: 'New Weekly Challenge! 🎯',
        body: challenge.text,
        data: { type: 'weekly_challenge', route: '/', challenge_id: inserted.id },
      })
    }

    return new Response(JSON.stringify({ created: true, challenge: inserted, notified: sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Weekly challenge error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
