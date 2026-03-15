export const COLORS = {
  bg: '#0A0A0A',
  surface: '#141414',
  card: '#1A1A1A',
  cardSolid: '#1A1A1A',
  cardHover: '#222222',
  cardElevated: '#242424',
  border: '#2A2A2A',
  borderStrong: '#3A3A3A',
  accent: '#FF4500',
  accentHover: '#FF5722',
  accentMuted: 'rgba(255, 69, 0, 0.12)',
  accentSoft: 'rgba(255, 69, 0, 0.13)',
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A8A',
  textTertiary: '#6A6A6A',
  textMuted: '#525252',
  success: '#32D74B',
  warning: '#FFD60A',
  error: '#FF453A',
  prGold: '#F59E0B',
} as const

/** Anime Warrior streak tier thresholds and image paths */
export const WARRIOR_TIERS = [
  { day: 0, name: 'Fresh Start', image: '/characters/warriors/day-0.png' },
  { day: 5, name: 'First Spark', image: '/characters/warriors/day-5.png' },
  { day: 10, name: 'Warming Up', image: '/characters/warriors/day-10.png' },
  { day: 15, name: 'Building', image: '/characters/warriors/day-15.png' },
  { day: 20, name: 'Rising', image: '/characters/warriors/day-20.png' },
  { day: 30, name: 'Ignited', image: '/characters/warriors/day-30.png' },
  { day: 60, name: 'Inferno', image: '/characters/warriors/day-60.png' },
  { day: 90, name: 'Ascended', image: '/characters/warriors/day-90.png' },
  { day: 120, name: 'Ethereal', image: '/characters/warriors/day-120.png' },
  { day: 180, name: 'Mythic', image: '/characters/warriors/day-180.png' },
  { day: 365, name: 'GOD MODE', image: '/characters/warriors/day-365.png' },
] as const

/** Pixel Hero power level tier thresholds and image paths */
export const HERO_TIERS = [
  { level: 0, name: 'Peasant', image: '/characters/heroes/pl-0.png' },
  { level: 1000, name: 'Squire', image: '/characters/heroes/pl-1k.png' },
  { level: 2500, name: 'Knight', image: '/characters/heroes/pl-2.5k.png' },
  { level: 5000, name: 'Dark Knight', image: '/characters/heroes/pl-5k.png' },
  { level: 10000, name: 'Champion', image: '/characters/heroes/pl-10k.png' },
  { level: 20000, name: 'Warlord', image: '/characters/heroes/pl-20k.png' },
  { level: 50000, name: 'Dragon Lord', image: '/characters/heroes/pl-50k.png' },
  { level: 100000, name: 'Mythic', image: '/characters/heroes/pl-100k.png' },
  { level: 250000, name: 'Legendary', image: '/characters/heroes/pl-250k.png' },
  { level: 500000, name: 'GOD TIER', image: '/characters/heroes/pl-500k.png' },
] as const

export const BADGE_DEFINITIONS = [
  { key: 'first_rep', name: 'First Rep', description: 'Log your first workout', icon: '💪' },
  { key: 'week_warrior', name: 'Week Warrior', description: 'Complete all workouts in a week', icon: '⚔️' },
  { key: 'streak_7', name: '7-Day Streak', description: '7 consecutive workout days', icon: '🔥' },
  { key: 'streak_14', name: '14-Day Streak', description: '14 consecutive workout days', icon: '🔥' },
  { key: 'streak_30', name: '30-Day Streak', description: '30 consecutive workout days', icon: '🔥' },
  { key: 'streak_60', name: '60-Day Streak', description: '60 consecutive workout days', icon: '🔥' },
  { key: 'streak_90', name: '90-Day Streak', description: '90 consecutive workout days', icon: '🔥' },
  { key: 'streak_365', name: '365-Day Streak', description: '365 consecutive workout days', icon: '👑' },
  { key: 'first_pr', name: 'First PR', description: 'Hit your first personal record', icon: '🏆' },
  { key: 'pr_machine', name: 'PR Machine', description: 'Hit 10 personal records', icon: '🏆' },
  { key: '100kg_club', name: '100kg Club', description: 'Lift 100kg on any exercise', icon: '🏋️' },
  { key: 'volume_king', name: 'Volume King', description: 'Highest weekly volume milestone', icon: '📈' },
  { key: 'consistency_champion', name: 'Consistency Champion', description: '4 weeks without missing a workout', icon: '🎯' },
  { key: 'photo_streak_4', name: 'Photo Streak (4 weeks)', description: '4 consecutive weekly photo check-ins', icon: '📸' },
  { key: 'photo_streak_12', name: 'Photo Streak (12 weeks)', description: '12 consecutive weekly photo check-ins', icon: '📸' },
  { key: 'challenge_completer', name: 'Challenge Completer', description: 'Complete a weekly challenge', icon: '✅' },
  { key: 'challenge_master', name: 'Challenge Master', description: 'Complete 10 weekly challenges', icon: '🏅' },
  { key: 'voice_logger', name: 'Voice Logger', description: 'Use voice logging 10 times', icon: '🎙️' },
  { key: 'early_bird', name: 'Early Bird', description: 'Log a workout before 8 AM', icon: '🌅' },
  { key: 'night_owl', name: 'Night Owl', description: 'Log a workout after 9 PM', icon: '🌙' },
  { key: 'protein_pro', name: 'Protein Pro', description: 'Hit protein goal 7 days in a row', icon: '🥩' },
] as const

export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365] as const

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
