import type { WorkoutDay } from '@/hooks/useWorkoutPlan'
import { DAYS_OF_WEEK } from '@/lib/constants'

interface DaySelectorProps {
  days: WorkoutDay[]
  selectedDayId: string | null
  todayIdx: number
  onSelect: (dayId: string) => void
}

export function DaySelector({ days, selectedDayId, todayIdx, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {days.map((day) => {
        const isActive = day.id === selectedDayId
        const isToday = day.day_of_week === todayIdx
        const abbrev = DAYS_OF_WEEK[day.day_of_week]?.slice(0, 3) ?? ''
        const muscle = day.is_rest_day ? 'Rest' : day.day_label?.split(' ')[0] ?? ''

        return (
          <button
            key={day.id}
            onClick={() => onSelect(day.id)}
            className={`flex-shrink-0 h-12 px-4 rounded-[12px] border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-accent border-accent text-white'
                : 'bg-card border-border text-text-secondary hover:bg-card-hover'
            }`}
          >
            <span className={`text-[11px] font-bold ${isActive ? 'text-white' : isToday ? 'text-accent' : ''}`}>
              {abbrev}
            </span>
            <span className={`text-[9px] ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
              {muscle}
            </span>
          </button>
        )
      })}
    </div>
  )
}
