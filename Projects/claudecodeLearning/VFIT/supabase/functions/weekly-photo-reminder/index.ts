// Weekly photo check-in reminder
// Triggered via pg_cron once per week on the user's configured photo_checkin_day (default Sunday=0)
// Reminds user to take a progress photo

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { sendPushNotification } from '../_shared/fcm.ts'
import { getSupabaseClient, getFCMToken } from '../_shared/supabase.ts'

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.includes('Bearer')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabase = getSupabaseClient()

    // Check if today is the user's photo check-in day
    const today = new Date()
    const dayOfWeek = today.getDay()

    const { data: settings } = await supabase
      .from('notification_settings')
      .select('photo_checkin_day, push_enabled, fcm_token')
      .single()

    if (!settings?.push_enabled || !settings?.fcm_token) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_token' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (dayOfWeek !== settings.photo_checkin_day) {
      return new Response(JSON.stringify({ sent: false, reason: 'not_photo_day' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if photo already taken this week
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const { data: photos } = await supabase
      .from('photo_checkins')
      .select('id')
      .gte('date', weekStartStr)
      .limit(1)

    if (photos && photos.length > 0) {
      return new Response(JSON.stringify({ sent: false, reason: 'already_taken' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sent = await sendPushNotification(settings.fcm_token, {
      title: 'Progress photo day! 📸',
      body: "Take a quick photo to track your visual progress. You'll thank yourself later!",
      data: { type: 'photo_reminder', route: '/coach' },
    })

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Photo reminder error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
