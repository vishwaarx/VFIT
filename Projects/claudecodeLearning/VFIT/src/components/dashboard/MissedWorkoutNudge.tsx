import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { getDayOfWeek } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MissedWorkoutNudge() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkMissed()
  }, [])

  async function checkMissed() {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 19) return

    const dayOfWeek = getDayOfWeek()
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('is_rest_day')
      .eq('day_of_week', dayOfWeek)
      .maybeSingle()

    if (!plan || plan.is_rest_day) return

    const today = now.toISOString().split('T')[0]
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('date', today)
      .not('completed_at', 'is', null)
      .limit(1)

    if (!sessions?.length) {
      setShow(true)
    }
  }

  if (!show) return null

  return (
    <Card
      hover
      variant="accent"
      className="!border-warning/15 !bg-warning/[0.04]"
      onClick={() => navigate('/coach')}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-warning-muted flex items-center justify-center flex-shrink-0">
          <MessageCircle size={16} className="text-warning" />
        </div>
        <div>
          <p className="text-base font-semibold">Haven&apos;t hit the gym yet?</p>
          <p className="text-sm text-text-muted">Consistency beats perfection. Tap to chat with coach.</p>
        </div>
      </div>
    </Card>
  )
}
