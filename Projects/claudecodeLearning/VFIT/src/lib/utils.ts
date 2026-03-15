import { format, formatDistanceToNow, isToday, isYesterday, startOfWeek, endOfWeek } from 'date-fns'

/** Brzycki formula for estimated 1RM */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (36 / (37 - reps)) * 10) / 10
}

/** Format weight with unit */
export function formatWeight(weight: number, unit: string = 'kg'): string {
  return `${weight}${unit}`
}

/** Format date for display */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEE, MMM d')
}

/** Format relative time */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/** Get current week bounds (Monday start) */
export function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  }
}

/** Get day of week (0=Monday, 6=Sunday) */
export function getDayOfWeek(date: Date = new Date()): number {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Generate a simple UUID v4 (with fallback for older Safari) */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
