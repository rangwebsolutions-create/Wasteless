import { useCallback, useEffect, useRef, useState } from 'react'
import { makeTranslator } from './lib/i18n'
import { getReviewerId, loadHotspots, loadXp, saveHotspots, saveXp, loadAvatar, saveAvatar } from './lib/store'
import { loadActivity, loadClaimedChallenges, saveActivity, saveClaimedChallenges, checkAndAwardBadges, loadStreak, saveStreak, loadBadges, BADGES, updateStreak, type Activity } from './lib/challenges'
import { useNetworkStatus } from './lib/network'
import type { ActiveSheet, Hotspot, Lang, VerificationVote } from './types'
import { VERIFICATION_THRESHOLD, XP_PER_CLEANUP, XP_PER_REPORT, XP_PER_REVIEW } from './types'
import { Landing } from './components/Landing'
import { BottomNav } from './components/BottomNav'
import { ClaimModal } from './components/ClaimModal'
import { ChallengesSheet } from './components/ChallengesSheet'
import { EditModal } from './components/EditModal'
import { ImpactSheet } from './components/ImpactSheet'
import { MapView } from './components/MapView'
import { ReportModal } from './components/ReportModal'
import { ReviewSheet } from './components/ReviewSheet'
import { Toast } from './components/Toast'

type Screen = 'landing' | 'app'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [hotspots, setHotspots] = useState<Hotspot[]>(loadHotspots)
  const [xp, setXp] = useState(loadXp)
  const [lang, setLang] = useState<Lang>('en')
  const [sheet, setSheet] = useState<ActiveSheet>('none')
  const [activeNav, setActiveNav] = useState<'map' | 'review' | 'me'>('map')
  const [activity, setActivity] = useState<Activity>(loadActivity)
  const [claimedChallenges, setClaimedChallenges] = useState<string[]>(loadClaimedChallenges)
  const [streak, setStreak] = useState(loadStreak)
  const [badges, setBadges] = useState<string[]>(loadBadges)
  const [avatar, setAvatar] = useState(loadAvatar)
  const [claimHotspot, setClaimHotspot] = useState<Hotspot | null>(null)
  const [editHotspot, setEditHotspot] = useState<Hotspot | null>(null)
  const [reportPlacementActive, setReportPlacementActive] = useState(false)
  const [pendingLatLng, setPendingLatLng] = useState<[number, number] | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isOffline } = useNetworkStatus()
  const [filterSeverity, setFilterSeverity] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<'open' | 'pending_review' | 'resolved' | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const t = makeTranslator(lang)

  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr' }, [lang])
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current) }, [])
  useEffect(() => { saveHotspots(hotspots) }, [hotspots])
  useEffect(() => { saveXp(xp) }, [xp])
  useEffect(() => { saveActivity(activity) }, [activity])
  useEffect(() => { saveClaimedChallenges(claimedChallenges) }, [claimedChallenges])
  useEffect(() => { saveStreak(streak) }, [streak])
  useEffect(() => {
    const newBadges = checkAndAwardBadges(activity, streak)
    if (newBadges.length > 0) {
      setBadges((current) => [...current, ...newBadges])
      newBadges.forEach((badgeId) => {
        const badge = BADGES.find((b) => b.id === badgeId)
        if (badge) showToast(`🏆 Badge unlocked: ${badge.name}!`)
      })
    }
  }, [activity, streak])

  function showToast(message: string, duration = 2800) { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); setToast(message); toastTimerRef.current = setTimeout(() => setToast(null), duration) }
  function handleLocationError(error: string) { showToast(`Location error: ${error}`) }
  function handleLocationSuccess() { showToast('Location found!') }
  function handleCameraError(error: string) { showToast(`Camera error: ${error}`) }
  function addXp(amount: number) { setXp((current) => current + amount) }
  function addActivity(kind: keyof Activity) {
    setActivity((current) => ({ ...current, [kind]: current[kind] + 1 }))
    const newStreak = updateStreak()
    setStreak(newStreak)
  }
  const handleMapClick = useCallback((latlng: [number, number]) => { setPendingLatLng(latlng); setReportPlacementActive(false) }, [])
  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    const reviewerId = getReviewerId()
    const isOwnHotspot = hotspot.created_by === reviewerId

    if (hotspot.status === 'resolved') {
      showToast(t('alreadyResolved'))
    } else if (hotspot.status === 'pending_review') {
      showToast(t('awaitingCommunityReview'))
    } else if (isOwnHotspot && hotspot.status === 'open') {
      // For own hotspots (both private and public), show edit modal with cleanup option
      setEditHotspot(hotspot)
    } else {
      // For other people's hotspots, show claim modal
      setClaimHotspot(hotspot)
    }
  }, [t])

  const filteredHotspots = hotspots.filter((hotspot) => {
    if (filterSeverity !== null && hotspot.severity_score !== filterSeverity) return false
    if (filterStatus !== null && hotspot.status !== filterStatus) return false
    return true
  })
  function handleEditHotspot(id: string, update: Partial<Hotspot>) {
    setHotspots((items) => items.map((item) => {
      if (item.id === id) {
        return { ...item, ...update }
      }
      return item
    }))
    showToast(t('editReport'))
  }
  function handleDeleteHotspot(id: string) {
    setHotspots((items) => items.filter((item) => item.id !== id))
    showToast(t('deleteReport'))
  }
  function handleCleanupFromEdit(hotspot: Hotspot) {
    setClaimHotspot(hotspot)
  }
  function handleAvatarChange(newAvatar: string) {
    setAvatar(newAvatar)
    saveAvatar(newAvatar)
  }
  function handleReport(hotspot: Hotspot) {
    setHotspots((items) => [hotspot, ...items]); addActivity('reports'); addXp(XP_PER_REPORT); setPendingLatLng(null); showToast(t('reportSuccess', { xp: XP_PER_REPORT }))
  }
  function handleCleanupSubmitted(hotspotId: string, updated: Pick<Hotspot, 'after_photo_data' | 'photo_lat' | 'photo_lng' | 'photo_timestamp' | 'cleanup_mode' | 'cleanup_description'>) { setHotspots((items) => items.map((item) => item.id === hotspotId ? { ...item, ...updated, status: 'pending_review', verification_votes: [] } : item)); addActivity('cleanups'); addXp(XP_PER_CLEANUP); setClaimHotspot(null); showToast(t('cleanupSentForReview', { xp: XP_PER_CLEANUP })) }
  function handleVote(hotspotId: string, verdict: VerificationVote['verdict'], demoReviewerId?: string) {
    const reviewerId = demoReviewerId || getReviewerId(); let approved = false
    setHotspots((items) => items.map((item) => { if (item.id !== hotspotId || item.verification_votes.some((vote) => vote.reviewerId === reviewerId)) return item; const verification_votes = [...item.verification_votes, { reviewerId, verdict, createdAt: new Date().toISOString() }]; approved = verification_votes.filter((vote) => vote.verdict === 'clean').length >= VERIFICATION_THRESHOLD; return { ...item, verification_votes, status: approved ? 'resolved' : item.status } }))
    addActivity('reviews'); addXp(XP_PER_REVIEW); showToast(approved ? t('cleanupResolvedByCommunity') : t('voteRecorded', { xp: XP_PER_REVIEW }))
  }
  function handleComment(hotspotId: string, text: string) {
    const cleaned = text.trim()
    if (!cleaned) return
    setHotspots((items) => items.map((item) => item.id === hotspotId ? {
      ...item, comments: [...(item.comments ?? []), { id: crypto.randomUUID(), text: cleaned, createdAt: new Date().toISOString() }],
    } : item))
  }
  function toggleSheet(next: Exclude<ActiveSheet, 'none'>) { const open = sheet === next ? 'none' : next; setSheet(open); setActiveNav(open === 'review' ? 'review' : open === 'impact' ? 'me' : 'map') }
  function claimChallenge(id: string, reward: number) { if (claimedChallenges.includes(id)) return; setClaimedChallenges((current) => [...current, id]); addXp(reward); showToast(`Challenge complete! +${reward} XP`) }
  const resolvedCount = hotspots.filter((h) => h.status === 'resolved').length

  return <>
    {isOffline && <div className="network-status network-status--offline">⚠️ {t('offlineMode')}</div>}
    {screen === 'landing' && <Landing reported={filteredHotspots.length} verified={resolvedCount} t={t} onLaunch={() => setScreen('app')} onSettings={() => setSheet('impact')} />}
    {screen === 'app' && <><MapView hotspots={filteredHotspots} reportPlacementActive={reportPlacementActive} pendingLatLng={pendingLatLng} onMapClick={handleMapClick} onHotspotClick={handleHotspotClick} isEmpty={filteredHotspots.filter(h => h.status === 'open').length === 0} t={t} onLocationError={handleLocationError} onLocationSuccess={handleLocationSuccess} reviewerId={getReviewerId()} />
      <button className="app-home-btn" onClick={() => { setScreen('landing'); setSheet('none') }} type="button" aria-label="Back to home">⌂</button>
      <button className={`report-btn${reportPlacementActive ? ' report-btn--armed' : ''}`} onClick={() => { setSheet('none'); setReportPlacementActive((active) => !active); showToast(t('tapMapToReport')) }} type="button"><span className="report-btn__ring" /><span className="report-btn__ring report-btn__ring--delay" /><span className="report-btn__icon">⌖</span><span className="report-btn__label">{reportPlacementActive ? t('tapMapPlace') : t('reportHotspot')}</span></button>
      <button className="map-challenges-btn" onClick={() => { setSheet('challenges'); setActiveNav('map') }} type="button">✦ {t('challenges')}</button>
      <button className={`map-filter-toggle-btn${showFilters ? ' is-active' : ''}`} onClick={() => setShowFilters(!showFilters)} type="button" aria-label="Toggle filters">⚙</button>
      {showFilters && (
        <>
          <button className="map-filter-btn" onClick={() => { setFilterSeverity(null); setFilterStatus(null) }} type="button" aria-label="Clear filters" disabled={!filterSeverity && !filterStatus}>↺</button>
          <div className="map-filters">
            <p className="map-filters__label">{t('filterBySeverity')}</p>
            <select className="map-filter-select" value={filterSeverity ?? ''} onChange={(e) => setFilterSeverity(e.target.value ? Number(e.target.value) : null)}>
              <option value="">{t('allSeverities')}</option>
              {[1, 2, 3, 4, 5].map((severity) => (
                <option key={severity} value={severity}>{severity}/5</option>
              ))}
            </select>
            <p className="map-filters__label">{t('filterByStatus')}</p>
            <select className="map-filter-select" value={filterStatus ?? ''} onChange={(e) => setFilterStatus(e.target.value as 'open' | 'pending_review' | 'resolved' | null)}>
              <option value="">{t('allStatuses')}</option>
              <option value="open">{t('filterOpen')}</option>
              <option value="pending_review">{t('filterPending')}</option>
              <option value="resolved">{t('filterResolved')}</option>
            </select>
          </div>
        </>
      )}
      <BottomNav active={activeNav} t={t} onMap={() => { setSheet('none'); setActiveNav('map') }} onReview={() => toggleSheet('review')} onMe={() => toggleSheet('impact')} /></>}
    {pendingLatLng && <ReportModal pendingLatLng={pendingLatLng} t={t} onSuccess={handleReport} onClose={() => setPendingLatLng(null)} onCameraError={handleCameraError} reviewerId={getReviewerId()} />}
    {claimHotspot && <ClaimModal hotspot={claimHotspot} t={t} onSuccess={handleCleanupSubmitted} onClose={() => setClaimHotspot(null)} showToast={showToast} onCameraError={handleCameraError} />}
    {editHotspot && <EditModal hotspot={editHotspot} t={t} onSuccess={handleEditHotspot} onDelete={handleDeleteHotspot} onCleanup={handleCleanupFromEdit} onClose={() => setEditHotspot(null)} />}
    {sheet === 'review' && <ReviewSheet hotspots={hotspots} reviewerId={getReviewerId()} t={t} onVote={handleVote} onComment={handleComment} onClose={() => { setSheet('none'); setActiveNav('map') }} />}
    {sheet === 'impact' && <ImpactSheet hotspots={hotspots} xp={xp} lang={lang} t={t} onLangChange={setLang} onClose={() => { setSheet('none'); setActiveNav('map') }} reviewerId={getReviewerId()} streak={streak} badges={badges} avatar={avatar} onAvatarChange={handleAvatarChange} />}
    {sheet === 'challenges' && <ChallengesSheet activity={activity} claimed={claimedChallenges} onClaim={claimChallenge} onClose={() => { setSheet('none'); setActiveNav('map') }} />}
    <Toast message={toast} onDismiss={() => setToast(null)} />
  </>
}
