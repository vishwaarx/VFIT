import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, MessageCircle, TrendingUp, Apple } from 'lucide-react'
import { haptic } from '@/lib/haptics'

const tabs = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts', end: false },
  { to: '/coach', icon: MessageCircle, label: 'Coach', end: false },
  { to: '/progress', icon: TrendingUp, label: 'Progress', end: false },
  { to: '/nutrition', icon: Apple, label: 'Nutrition', end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-4 mb-3 px-1 py-1 rounded-[36px] bg-card border border-border">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {tabs.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => haptic('select')}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[56px] min-h-[52px] transition-all duration-200 rounded-[26px] cursor-pointer ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className={`uppercase text-[10px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
