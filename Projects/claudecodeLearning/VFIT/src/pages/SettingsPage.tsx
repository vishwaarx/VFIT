import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useSettings } from '@/hooks/useSettings'
import { useTokenUsage } from '@/hooks/useTokenUsage'
import { useTheme } from '@/lib/theme'
import { requestNotificationPermission } from '@/lib/firebase'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { profile, notifications, loading, saving, updateProfile, updateNotifications } = useSettings()
  const { usage, loading: usageLoading } = useTokenUsage()
  const { theme, toggle: toggleTheme } = useTheme()
  const [editName, setEditName] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [editProtein, setEditProtein] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [enabledPush, setEnabledPush] = useState(false)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  const handleSaveProfile = async () => {
    const updates: Record<string, unknown> = {}
    if (editName.trim()) updates.name = editName.trim()
    if (editGoal) updates.goal_weight = parseFloat(editGoal)
    if (editProtein) updates.daily_protein_target = parseInt(editProtein)
    if (Object.keys(updates).length > 0) {
      await updateProfile(updates as Parameters<typeof updateProfile>[0])
      setShowProfile(false)
    }
  }

  const handleEnablePush = async () => {
    const token = await requestNotificationPermission()
    if (token) {
      setEnabledPush(true)
      await updateNotifications({ push_enabled: true })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with back arrow and avatar */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2 safe-top">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center cursor-pointer hover:bg-card-hover transition-colors duration-200"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-base">{profile?.name?.[0]?.toUpperCase() ?? 'V'}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">{profile?.name || 'Settings'}</h1>
          <p className="text-xs text-text-muted">Manage your preferences</p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3.5">
        {/* Profile edit (inline toggle) */}
        <Card>
          <button
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => {
              setShowProfile(!showProfile)
              if (!showProfile && profile) {
                setEditName(profile.name)
                setEditGoal(profile.goal_weight?.toString() ?? '')
                setEditProtein(profile.daily_protein_target.toString())
              }
            }}
          >
            <p className="font-bold text-base">Edit Profile</p>
            <span className="text-xs text-accent font-semibold">{showProfile ? 'Close' : 'Edit'}</span>
          </button>
          {showProfile && (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
              <div>
                <label className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1 block">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:border-accent/40 min-h-[48px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1 block">Goal Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:border-accent/40 min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1 block">Protein Target (g)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editProtein}
                    onChange={(e) => setEditProtein(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:border-accent/40 min-h-[48px]"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile} loading={saving} className="w-full">
                Save Profile
              </Button>
            </div>
          )}
        </Card>

        {/* APPEARANCE section */}
        <p className="text-[9px] font-bold text-text-muted tracking-[2px] uppercase mt-2">APPEARANCE</p>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-base">Theme</p>
              <p className="text-sm text-text-muted">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer"
              style={{ backgroundColor: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-border)' }}
              aria-label="Toggle theme"
            >
              <div
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center"
                style={{ transform: theme === 'dark' ? 'translateX(28px)' : 'translateX(4px)' }}
              >
                {theme === 'dark' ? <Moon size={12} className="text-gray-800" /> : <Sun size={12} className="text-amber-500" />}
              </div>
            </button>
          </div>
        </Card>

        {/* NOTIFICATIONS section */}
        <p className="text-[9px] font-bold text-text-muted tracking-[2px] uppercase mt-2">NOTIFICATIONS</p>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-base">Push Notifications</p>
              <p className="text-sm text-text-muted">
                {notifications?.push_enabled || enabledPush ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
            {!notifications?.push_enabled && !enabledPush && (
              <Button size="sm" onClick={handleEnablePush}>Enable</Button>
            )}
            {(notifications?.push_enabled || enabledPush) && (
              <span className="text-xs text-success font-semibold bg-success-muted px-2.5 py-1 rounded-lg">Active</span>
            )}
          </div>
          {/* Time pickers */}
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            {[
              { label: 'Morning Check-in', time: '7:00 AM' },
              { label: 'Missed Workout', time: '7:00 PM' },
              { label: 'Weekly Photo', time: 'Sunday' },
            ].map(({ label, time }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{label}</span>
                <span className="text-sm font-semibold text-text-primary bg-card-elevated px-3 py-1.5 rounded-lg">{time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* GOALS & UNITS section */}
        <p className="text-[9px] font-bold text-text-muted tracking-[2px] uppercase mt-2">GOALS & UNITS</p>
        <Card>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-base text-text-secondary">Weight Goal</span>
              <span className="text-base font-semibold">{profile?.goal_weight ? `${profile.goal_weight} kg` : 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-base text-text-secondary">Daily Protein</span>
              <span className="text-base font-semibold">{profile?.daily_protein_target}g</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-base text-text-secondary">Weight Unit</span>
              <div className="flex gap-0 rounded-lg bg-card-elevated p-0.5">
                <button
                  onClick={() => updateProfile({ weight_unit: 'kg' })}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    (profile?.weight_unit ?? 'kg') === 'kg' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  kg
                </button>
                <button
                  onClick={() => updateProfile({ weight_unit: 'lbs' })}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    profile?.weight_unit === 'lbs' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* AI TOKEN USAGE section — flattened */}
        <p className="text-[9px] font-bold text-text-muted tracking-[2px] uppercase mt-2">AI TOKEN USAGE</p>
        <Card>
          {usageLoading ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-text-secondary">Today</span>
                <span className="text-sm font-semibold">{formatTokens(usage.todayTokens)} <span className="text-text-muted">(${usage.todayCost.toFixed(4)})</span></span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-text-secondary">Last 7 Days</span>
                <span className="text-sm font-semibold">{formatTokens(usage.last7DaysTokens)} <span className="text-text-muted">(${usage.last7DaysCost.toFixed(4)})</span></span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-text-secondary">All Time</span>
                <span className="text-sm font-semibold">{formatTokens(usage.totalTokens)} <span className="text-text-muted">(${usage.estimatedCost.toFixed(4)})</span></span>
              </div>
            </div>
          )}
        </Card>

        {/* App version */}
        <p className="text-center text-xs text-text-muted py-4">VFIT v1.0.0</p>
      </div>
    </div>
  )
}
