import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useProtein } from '@/hooks/useProtein'
import { formatDate } from '@/lib/utils'
import { Settings } from 'lucide-react'

export function NutritionPage() {
  const navigate = useNavigate()
  const { todayTotal, todayLogs, weeklyAvg, recentDays, target, loading, saving, logProtein } = useProtein()
  const [customAmount, setCustomAmount] = useState('')

  const percentage = target > 0 ? Math.min((todayTotal / target) * 100, 100) : 0

  const handleQuickAdd = (grams: number) => {
    logProtein(grams)
  }

  const handleCustomSubmit = () => {
    const g = parseInt(customAmount)
    if (g > 0) {
      logProtein(g)
      setCustomAmount('')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Custom inline header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 safe-top">
        <h1 className="text-[28px] font-bold font-[family-name:var(--font-display)] tracking-tight">Nutrition</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-secondary">Today</span>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-card-hover transition-colors duration-200 cursor-pointer"
          >
            <Settings size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3.5">
        {/* Protein Goal — redesigned */}
        <Card variant="elevated" className="py-6">
          <p className="text-[11px] font-bold text-accent tracking-[2px] uppercase mb-2">DAILY PROTEIN</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-[48px] font-bold font-[family-name:var(--font-display)] leading-none">{todayTotal}</span>
            <span className="text-text-muted text-lg">/ {target}g</span>
            <span className="text-accent font-bold text-lg ml-1">{Math.round(percentage)}%</span>
          </div>
          <div className="h-[10px] bg-subtle-hover rounded-[5px] overflow-hidden">
            <div
              className={`h-full rounded-[5px] transition-all duration-500 ${
                percentage >= 100
                  ? 'bg-gradient-to-r from-success to-success/80'
                  : 'bg-gradient-to-r from-accent to-accent-hover'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {percentage >= 100 && (
            <p className="text-xs text-success font-semibold mt-2">Goal reached!</p>
          )}
        </Card>

        {/* Quick Add — 3 buttons with labels */}
        <Card>
          <p className="font-bold text-sm font-[family-name:var(--font-display)] tracking-tight mb-3">Quick Add</p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { grams: 20, label: 'Snack' },
              { grams: 30, label: 'Meal' },
              { grams: 50, label: 'Shake' },
            ].map(({ grams, label }) => (
              <button
                key={grams}
                onClick={() => handleQuickAdd(grams)}
                disabled={saving}
                className="flex flex-col items-center justify-center gap-1 min-h-[56px] bg-card-elevated border border-border rounded-[12px] hover:bg-card-hover transition-colors duration-200 cursor-pointer disabled:opacity-40"
              >
                <span className="text-base font-bold">+{grams}g</span>
                <span className="text-[10px] text-text-muted">{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Inline custom amount */}
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom grams"
            className="flex-1 h-11 bg-card border border-border rounded-[12px] px-4 text-base font-semibold placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customAmount || parseInt(customAmount) <= 0 || saving}
            className="h-11 px-5 bg-accent text-white rounded-[12px] font-bold text-sm disabled:opacity-40 cursor-pointer hover:bg-accent-hover transition-colors duration-200"
          >
            Add
          </button>
        </div>

        {/* Weekly Average — simplified row */}
        <div className="flex items-center justify-between py-3 px-1">
          <span className="text-base text-text-secondary">7-Day Average</span>
          <span className="text-base font-bold font-[family-name:var(--font-display)]">
            {weeklyAvg !== null ? `${weeklyAvg}g / day` : '--'}
          </span>
        </div>

        {/* Today's Logs */}
        {todayLogs.length > 0 && (
          <div>
            <p className="text-sm font-bold font-[family-name:var(--font-display)] tracking-tight text-text-secondary mb-3">Today</p>
            <div className="flex flex-col gap-1.5">
              {todayLogs.map((log) => (
                <Card key={log.id} padding="sm" className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-semibold">+{log.grams}g</span>
                    {log.meal_label && <span className="text-sm text-text-muted ml-2">{log.meal_label}</span>}
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Days */}
        {recentDays.length > 0 && (
          <div>
            <p className="text-sm font-bold font-[family-name:var(--font-display)] tracking-tight text-text-secondary mb-3">This Week</p>
            <div className="flex flex-col gap-1.5">
              {recentDays.map((day) => (
                <Card key={day.date} padding="sm" className="flex items-center justify-between">
                  <span className="text-base text-text-secondary">{formatDate(day.date)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${day.total >= target ? 'text-success' : ''}`}>
                      {day.total}g
                    </span>
                    <div className="w-16 h-1.5 bg-subtle-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${day.total >= target ? 'bg-success' : 'bg-accent'}`}
                        style={{ width: `${Math.min((day.total / target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
