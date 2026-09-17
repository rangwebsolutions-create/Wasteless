export type ActivityKind = 'reports' | 'cleanups' | 'reviews'
export type Activity = Record<ActivityKind, number>

const ACTIVITY_KEY = 'wasteless.activity.v1'
const CLAIMED_KEY = 'wasteless.claimed-challenges.v1'
const STREAK_KEY = 'wasteless.streak.v1'
const BADGES_KEY = 'wasteless.badges.v1'
const LAST_ACTIVITY_DATE_KEY = 'wasteless.last-activity-date.v1'

export const CHALLENGES = [
  { id: 'first-alerts', kind: 'reports' as const, target: 3, reward: 25, icon: '📍', title: 'Neighbourhood Scout', description: 'Report 3 waste hotspots' },
  { id: 'cleanup-crew', kind: 'cleanups' as const, target: 2, reward: 75, icon: '🧤', title: 'Hands-on Helper', description: 'Submit 2 cleanups for review' },
  { id: 'trusted-eye', kind: 'reviews' as const, target: 5, reward: 40, icon: '👀', title: 'Trusted Eye', description: 'Complete 5 community reviews' },
]

export const BADGES = [
  { id: 'first-report', name: 'First Report', icon: '🎯', description: 'Report your first waste hotspot', condition: (_activity: Activity) => false },
  { id: 'community-hero', name: 'Community Hero', icon: '🦸', description: 'Report 10 waste hotspots', condition: (activity: Activity) => activity.reports >= 10 },
  { id: 'dedicated-cleaner', name: 'Dedicated Cleaner', icon: '🧹', description: 'Complete 5 cleanups', condition: (activity: Activity) => activity.cleanups >= 5 },
  { id: 'trusted-reviewer', name: 'Trusted Reviewer', icon: '✅', description: 'Complete 20 reviews', condition: (activity: Activity) => activity.reviews >= 20 },
  { id: 'streak-master', name: 'Streak Master', icon: '🔥', description: 'Maintain a 7-day activity streak', condition: (_activity: Activity, streak: number) => streak >= 7 },
  { id: 'cleanup-legend', name: 'Cleanup Legend', icon: '🏆', description: 'Complete 15 cleanups', condition: (activity: Activity) => activity.cleanups >= 15 },
  { id: 'review-expert', name: 'Review Expert', icon: '👁️', description: 'Complete 50 reviews', condition: (activity: Activity) => activity.reviews >= 50 },
  { id: 'elite-reporter', name: 'Elite Reporter', icon: '📢', description: 'Report 25 waste hotspots', condition: (activity: Activity) => activity.reports >= 25 },
]

export const LEVELS = [
  { level: 1, name: 'Volunteer', xp: 0, icon: '🌱' },
  { level: 2, name: 'Helper', xp: 50, icon: '🌿' },
  { level: 3, name: 'Active', xp: 150, icon: '🌳' },
  { level: 4, name: 'Leader', xp: 300, icon: '🌲' },
  { level: 5, name: 'Champion', xp: 500, icon: '🏅' },
  { level: 6, name: 'Hero', xp: 750, icon: '🦸' },
  { level: 7, name: 'Legend', xp: 1000, icon: '👑' },
]

export function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export function getNextLevel(xp: number) {
  const currentLevel = getLevel(xp)
  const currentIndex = LEVELS.findIndex((l) => l.level === currentLevel.level)
  if (currentIndex >= 0 && currentIndex < LEVELS.length - 1) {
    return LEVELS[currentIndex + 1]
  }
  return currentLevel
}

export function getProgressToNextLevel(xp: number): { current: number; next: number; progress: number } {
  const currentLevel = getLevel(xp)
  const nextLevel = getNextLevel(xp)

  if (currentLevel.level === nextLevel.level) {
    return { current: xp, next: xp, progress: 100 }
  }

  const progress = ((xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100

  return {
    current: currentLevel.xp,
    next: nextLevel.xp,
    progress: Math.min(100, Math.max(0, progress)),
  }
}

export function loadActivity(): Activity {
  try { return { reports: 0, cleanups: 0, reviews: 0, ...JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{}') } } catch { return { reports: 0, cleanups: 0, reviews: 0 } }
}
export function saveActivity(activity: Activity) { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)) }
export function loadClaimedChallenges(): string[] { try { return JSON.parse(localStorage.getItem(CLAIMED_KEY) ?? '[]') as string[] } catch { return [] } }
export function saveClaimedChallenges(ids: string[]) { localStorage.setItem(CLAIMED_KEY, JSON.stringify(ids)) }

export function loadStreak(): number {
  try { return Number(localStorage.getItem(STREAK_KEY) ?? '0') } catch { return 0 }
}
export function saveStreak(streak: number) { localStorage.setItem(STREAK_KEY, String(streak)) }

export function loadBadges(): string[] {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) ?? '[]') as string[] } catch { return [] }
}
export function saveBadges(badges: string[]) { localStorage.setItem(BADGES_KEY, JSON.stringify(badges)) }

export function checkAndAwardBadges(activity: Activity, streak: number): string[] {
  const currentBadges = loadBadges()
  const newBadges: string[] = []

  BADGES.forEach((badge) => {
    if (!currentBadges.includes(badge.id)) {
      // Handle badges that need streak parameter
      if (badge.id === 'streak-master') {
        const condition = badge.condition as (activity: Activity, streak: number) => boolean
        if (condition(activity, streak)) {
          newBadges.push(badge.id)
        }
      } else {
        const condition = badge.condition as (activity: Activity) => boolean
        if (condition(activity)) {
          newBadges.push(badge.id)
        }
      }
    }
  })

  if (newBadges.length > 0) {
    saveBadges([...currentBadges, ...newBadges])
  }

  return newBadges
}

export function updateStreak(): number {
  const today = new Date().toDateString()
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_DATE_KEY)
  const currentStreak = loadStreak()

  if (lastActivity === today) {
    return currentStreak
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (lastActivity === yesterday.toDateString()) {
    const newStreak = currentStreak + 1
    saveStreak(newStreak)
    localStorage.setItem(LAST_ACTIVITY_DATE_KEY, today)
    return newStreak
  } else if (lastActivity !== today) {
    saveStreak(1)
    localStorage.setItem(LAST_ACTIVITY_DATE_KEY, today)
    return 1
  }

  return currentStreak
}
