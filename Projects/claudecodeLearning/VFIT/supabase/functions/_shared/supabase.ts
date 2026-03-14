// Shared Supabase client for edge functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
}

export async function getFCMToken(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  const { data } = await supabase
    .from('notification_settings')
    .select('fcm_token, push_enabled')
    .single()

  if (!data?.push_enabled || !data?.fcm_token) return null
  return data.fcm_token
}
