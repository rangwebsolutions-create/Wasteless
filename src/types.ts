export type HotspotStatus = 'open' | 'pending_review' | 'resolved'

export interface VerificationVote {
  reviewerId: string
  verdict: 'clean' | 'needs_work'
  createdAt: string
}

export interface ReviewComment {
  id: string
  text: string
  createdAt: string
}

export interface Hotspot {
  id: string
  lat: number
  lng: number
  severity_score: number
  status: HotspotStatus
  created_at: string
  photo_data: string | null
  after_photo_data: string | null
  cleanup_mode: 'public' | 'private'
  photo_lat: number | null
  photo_lng: number | null
  photo_timestamp: string | null
  description: string
  cleanup_description: string | null
  verification_votes: VerificationVote[]
  comments: ReviewComment[]
  created_by: string | null
}

export type Lang = 'en' | 'fr' | 'ar'
export type ActiveSheet = 'none' | 'review' | 'impact' | 'challenges'

export const HOME_COORDS: [number, number] = [30.4278, -9.5981]
export const DEFAULT_ZOOM = 13
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [30.2, -9.8], // Southwest
  [30.6, -9.4], // Northeast
]
export const XP_PER_REPORT = 10
export const XP_PER_CLEANUP = 50
export const XP_PER_REVIEW = 5
export const VERIFICATION_THRESHOLD = 3
