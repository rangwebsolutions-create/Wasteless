import type { Hotspot } from '../types'

const HOTSPOTS_KEY = 'wasteless.hotspots.v1'
const XP_KEY = 'wasteless.xp.v1'
const REVIEWER_KEY = 'wasteless.reviewer.v1'
const DEMO_DATA_LOADED_KEY = 'wasteless.demo-loaded.v1'
const AVATAR_KEY = 'wasteless.avatar.v1'
const demoPhoto = (label: string, color: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="${color}"/><path d="M0 310 Q170 260 340 320 T800 300V500H0Z" fill="#d8c39a"/><circle cx="155" cy="295" r="38" fill="#f05c45"/><rect x="300" y="265" width="85" height="58" rx="10" fill="#3f78a8"/><text x="400" y="80" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="white">${label}</text></svg>`)}`

const demoHotspots: Hotspot[] = [
  {
    id: 'demo-agadir-beach', lat: 30.4258, lng: -9.6102, severity_score: 4,
    status: 'open', created_at: '2026-09-10T10:00:00.000Z',
    photo_data: demoPhoto('Waste reported', '#6d8f74'), after_photo_data: null, cleanup_mode: 'public',
    photo_lat: null, photo_lng: null, photo_timestamp: null, description: 'Litter collected along the beach path.', cleanup_description: null, verification_votes: [], comments: [], created_by: null,
  },
  {
    id: 'demo-marina-review', lat: 30.4217, lng: -9.6083, severity_score: 3,
    status: 'pending_review', created_at: '2026-09-11T10:00:00.000Z',
    photo_data: demoPhoto('Before cleanup', '#788e68'), after_photo_data: demoPhoto('After cleanup', '#49906c'), cleanup_mode: 'public',
    photo_lat: null, photo_lng: null, photo_timestamp: null, description: 'Plastic bottles and packaging by the marina.', cleanup_description: 'Collected the visible plastic bottles and packaging. Two bags were removed.', verification_votes: [], comments: [{ id: 'demo-comment', text: 'The area looks much better. Please check the edge near the path too.', createdAt: '2026-09-12T10:00:00.000Z' }], created_by: null,
  },
<<<<<<< Updated upstream
=======
  {
    id: 'demo-park-open', lat: 30.4350, lng: -9.5850, severity_score: 2,
    status: 'open', created_at: '2026-09-13T10:00:00.000Z',
    photo_data: demoPhoto('Park waste', '#8f7a6d'), after_photo_data: null, cleanup_mode: 'public',
    photo_lat: null, photo_lng: null, photo_timestamp: null, description: 'Scattered plastic and paper waste near the park benches.', cleanup_description: null, verification_votes: [], comments: [], created_by: null,
  },
  {
    id: 'demo-near-resolution', lat: 30.4150, lng: -9.5950, severity_score: 3,
    status: 'pending_review', created_at: '2026-09-14T10:00:00.000Z',
    photo_data: demoPhoto('Before cleanup', '#7a6d8f'), after_photo_data: demoPhoto('After cleanup', '#6d8f7a'), cleanup_mode: 'public',
    photo_lat: null, photo_lng: null, photo_timestamp: null, description: 'Construction debris and packaging materials near the roadside.', cleanup_description: 'Removed all construction debris and sorted recyclable materials. Area is now clear.', verification_votes: [
      { reviewerId: 'demo-fake-reviewer-1', verdict: 'clean', createdAt: '2026-09-14T11:00:00.000Z' },
      { reviewerId: 'demo-fake-reviewer-2', verdict: 'clean', createdAt: '2026-09-14T12:00:00.000Z' },
    ], comments: [], created_by: null,
  },
  {
    id: 'demo-resolved-beach', lat: 30.4300, lng: -9.6200, severity_score: 4,
    status: 'resolved', created_at: '2026-09-08T10:00:00.000Z',
    photo_data: demoPhoto('Before cleanup', '#8f6d6d'), after_photo_data: demoPhoto('After cleanup', '#6d8f6d'), cleanup_mode: 'public',
    photo_lat: null, photo_lng: null, photo_timestamp: null, description: 'Heavy litter accumulation near beach access point.', cleanup_description: 'Complete cleanup performed. Removed 3 large bags of mixed waste including plastics, glass, and food packaging.', verification_votes: [
      { reviewerId: 'demo-fake-reviewer-1', verdict: 'clean', createdAt: '2026-09-09T10:00:00.000Z' },
      { reviewerId: 'demo-fake-reviewer-2', verdict: 'clean', createdAt: '2026-09-09T11:00:00.000Z' },
      { reviewerId: 'demo-fake-reviewer-3', verdict: 'clean', createdAt: '2026-09-09T12:00:00.000Z' },
    ], comments: [{ id: 'demo-resolved-comment', text: 'Great work! The beach looks pristine now.', createdAt: '2026-09-09T13:00:00.000Z' }], created_by: null,
  },
>>>>>>> Stashed changes
]

export function loadHotspots(): Hotspot[] {
  try {
    const stored = localStorage.getItem(HOTSPOTS_KEY)
    if (stored) {
      return JSON.parse(stored) as Hotspot[]
    }

    // Only load demo data if it hasn't been loaded before
    const demoLoaded = localStorage.getItem(DEMO_DATA_LOADED_KEY)
    if (!demoLoaded) {
      localStorage.setItem(DEMO_DATA_LOADED_KEY, 'true')
      return demoHotspots
    }

    return []
  } catch { return demoHotspots }
}

export function saveHotspots(hotspots: Hotspot[]) {
  localStorage.setItem(HOTSPOTS_KEY, JSON.stringify(hotspots))
}

export function loadXp() { return Number(localStorage.getItem(XP_KEY) ?? 0) || 0 }
export function saveXp(xp: number) { localStorage.setItem(XP_KEY, String(xp)) }

export function getReviewerId() {
  let id = localStorage.getItem(REVIEWER_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(REVIEWER_KEY, id)
  }
  return id
}

export function loadDemoData(): Hotspot[] {
  localStorage.setItem(DEMO_DATA_LOADED_KEY, 'true')
  return demoHotspots
}

export function clearDemoDataFlag(): void {
  localStorage.removeItem(DEMO_DATA_LOADED_KEY)
}

const AVATARS = ['🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🦄', '🐙', '🦋', '🐸', '🦎', '🐢', '🦖', '🦕', '🐊', '🐳', '🦈', '🐬', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🦭', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐅', '🐆', '🐴', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🐘', '🦣', '🦏', '🐍', '🦎', '🐢', '🐊', '🐸', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🦭', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛']

export function loadAvatar(): string {
  const saved = localStorage.getItem(AVATAR_KEY)
  if (saved) return saved

  // Assign random avatar to new users
  const randomAvatar = getRandomAvatar()
  localStorage.setItem(AVATAR_KEY, randomAvatar)
  return randomAvatar
}

export function getRandomAvatar(): string {
  const index = Math.floor(Math.random() * AVATARS.length)
  return AVATARS[index] || '🦁'
}

export function saveAvatar(avatar: string): void {
  localStorage.setItem(AVATAR_KEY, avatar)
}
