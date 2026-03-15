/** Haptic feedback via navigator.vibrate (Android + some PWAs)
 *  Silently no-ops on iOS (vibrate API not supported) */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'select'

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [30, 50, 30, 50, 30],
  select: 5,
}

export function haptic(type: HapticPattern = 'light') {
  try {
    navigator?.vibrate?.(patterns[type])
  } catch {
    // Silently ignore — vibrate not available
  }
}
