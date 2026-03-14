// Morning check-in push notification
// Triggered via pg_cron daily — sends a morning reminder to log weight and start the day
// Schedule: daily at the user's configured morning_checkin_time (default 07:00)

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { sendPushNotification } from '../_shared/fcm.ts'
import { getSupabaseClient, getFCMToken } from '../_shared/supabase.ts'

const morningMessages = [
  { title: 'Good morning! ☀️', body: "Time to weigh in and plan today's workout." },
  { title: 'Rise and grind! 💪', body: 'Log your weight and check your workout plan.' },
  { title: 'New day, new gains!', body: "Step on the scale and let's crush today." },
  { title: 'Morning check-in', body: "How are you feeling? Log your weight to track progress." },
  { title: 'Consistency wins 🏆', body: 'Quick weigh-in to keep your streak going.' },
]

serve(async (req) => {
  try {
    // Verify this is a cron or authorized call
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.includes('Bearer')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabase = getSupabaseClient()
    const fcmToken = await getFCMToken(supabase)

    if (!fcmToken) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_token' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if user has today's workout scheduled
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sunday
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('day_label, is_rest_day')
      .eq('day_of_week', dayOfWeek)
      .single()

    // Pick a random morning message
    const msg = morningMessages[Math.floor(Math.random() * morningMessages.length)]

    // Customize body if there's a workout today
    let body = msg.body
    if (plan && !plan.is_rest_day) {
      body = `${plan.day_label} day today. ${msg.body}`
    } else if (plan?.is_rest_day) {
      body = 'Rest day — still log your weight to keep tracking!'
    }

    const sent = await sendPushNotification(fcmToken, {
      title: msg.title,
      body,
      data: { type: 'morning_checkin', route: '/coach' },
    })

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Morning check-in error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
