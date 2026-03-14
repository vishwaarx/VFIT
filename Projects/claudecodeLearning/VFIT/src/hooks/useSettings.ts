import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, NotificationSettings } from '@/types/database'

export function useSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [profileRes, notifRes] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('notification_settings').select('*').single(),
    ])
    setProfile(profileRes.data ?? null)
    setNotifications(notifRes.data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, 'name' | 'goal_weight' | 'daily_protein_target' | 'weight_unit'>>) => {
    if (!profile) return
    setSaving(true)
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single()
    if (data) setProfile(data)
    setSaving(false)
  }, [profile])

  const updateNotifications = useCallback(async (updates: Partial<Pick<NotificationSettings, 'push_enabled' | 'morning_checkin_time' | 'missed_workout_time' | 'photo_checkin_day'>>) => {
    if (!notifications) return
    setSaving(true)
    const { data } = await supabase
      .from('notification_settings')
      .update(updates)
      .eq('id', notifications.id)
      .select()
      .single()
    if (data) setNotifications(data)
    setSaving(false)
  }, [notifications])

  return { profile, notifications, loading, saving, updateProfile, updateNotifications, reload: load }
}
