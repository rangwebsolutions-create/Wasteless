import { useState } from 'react'
import type { Hotspot, VerificationVote } from '../types'
import { VERIFICATION_THRESHOLD } from '../types'

<<<<<<< Updated upstream
<<<<<<< Updated upstream
interface Props { hotspots: Hotspot[]; reviewerId: string; t: (key: string, vars?: Record<string, string | number>) => string; onVote: (id: string, verdict: VerificationVote['verdict']) => void; onComment: (id: string, text: string) => void; onClose: () => void }

export function ReviewSheet({ hotspots, reviewerId, t, onVote, onComment, onClose }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const items = hotspots.filter((hotspot) => hotspot.status === 'pending_review' || hotspot.status === 'open')
  return <section className="review-screen" role="dialog"><header className="review-screen__header"><div><p>{t('communityCheck')}</p><h2>{t('communityReview')}</h2></div><button onClick={onClose} className="review-close-btn" aria-label={t('map')}>← <span>{t('map')}</span></button></header><div className="review-feed">{items.length === 0 ? <div className="review-empty"><span>✦</span><h3>{t('nothingToReview')}</h3><p>{t('nothingToReviewHint')}</p></div> : items.map((hotspot) => {
    const comments = hotspot.comments ?? []; const isCleanup = hotspot.status === 'pending_review'; const voted = hotspot.verification_votes.some((vote) => vote.reviewerId === reviewerId); const clean = hotspot.verification_votes.filter((vote) => vote.verdict === 'clean').length
    return <article className="review-card" key={hotspot.id}><div className="review-card__meta"><span>{isCleanup ? t('cleanupReview') : t('reportedWaste')} #{hotspot.id.slice(0, 5)}</span><b>{isCleanup ? `${clean}/${VERIFICATION_THRESHOLD} ${t('approvals')}` : t('needsCleanup')}</b></div>{hotspot.description && <div className="review-details"><strong>{t('reportDescription')}</strong><p>{hotspot.description}</p></div>}<div className="review-photos"><figure>{hotspot.photo_data ? <img src={hotspot.photo_data} alt={t('before')} /> : <div className="review-photo-placeholder">{t('noBeforePhoto')}</div>}<figcaption>{t('before')}</figcaption></figure><span className="review-arrow">→</span><figure>{hotspot.after_photo_data ? <img src={hotspot.after_photo_data} alt={t('after')} /> : <div className="review-photo-placeholder">{t('notCleanedYet')}</div>}<figcaption>{t('after')}</figcaption></figure></div>{isCleanup && <>{hotspot.cleanup_description && <div className="review-details review-details--cleanup"><strong>{t('cleanupDetails')}</strong><p>{hotspot.cleanup_description}</p></div>}{voted ? <p className="review-voted">✓ {t('alreadyVoted')}</p> : <div className="review-actions"><button onClick={() => onVote(hotspot.id, 'needs_work')} type="button">{t('needsWork')}</button><button className="deploy-btn" onClick={() => onVote(hotspot.id, 'clean')} type="button">✓ {t('looksClean')}</button></div>}</>}<div className="review-comments"><h3>{t('comments')} <span>{comments.length}</span></h3>{comments.map((comment) => <p key={comment.id}>💬 {comment.text}</p>)}<form onSubmit={(event) => { event.preventDefault(); onComment(hotspot.id, drafts[hotspot.id] ?? ''); setDrafts({ ...drafts, [hotspot.id]: '' }) }}><input value={drafts[hotspot.id] ?? ''} onChange={(event) => setDrafts({ ...drafts, [hotspot.id]: event.target.value })} maxLength={240} placeholder={t('commentPlaceholder')} /><button type="submit">{t('send')}</button></form></div></article>
=======
=======
>>>>>>> Stashed changes
interface Props { hotspots: Hotspot[]; reviewerId: string; t: (key: string, vars?: Record<string, string | number>) => string; onVote: (id: string, verdict: VerificationVote['verdict'], demoReviewerId?: string) => void; onComment: (id: string, text: string) => void; onClose: () => void }

export function ReviewSheet({ hotspots, reviewerId, t, onVote, onComment, onClose }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [demoReviewer, setDemoReviewer] = useState<number>(1)
  const items = hotspots.filter((hotspot) => hotspot.status === 'pending_review' || hotspot.status === 'open')
  
  const getDemoReviewerId = (num: number): string => {
    const realId = reviewerId
    return `demo-${num}-${realId.slice(0, 8)}`
  }
  
  const currentDemoReviewerId = getDemoReviewerId(demoReviewer)
  
  return <section className="review-screen" role="dialog"><header className="review-screen__header"><div><p>{t('communityCheck')}</p><h2>{t('communityReview')}</h2></div><button onClick={onClose} className="review-close-btn" aria-label={t('map')}>← <span>{t('map')}</span></button></header><div className="demo-reviewer-switcher"><span className="demo-reviewer-label">Voting as:</span><div className="demo-reviewer-buttons"><button className={demoReviewer === 1 ? 'demo-reviewer-btn active' : 'demo-reviewer-btn'} onClick={() => setDemoReviewer(1)} type="button">Reviewer 1</button><button className={demoReviewer === 2 ? 'demo-reviewer-btn active' : 'demo-reviewer-btn'} onClick={() => setDemoReviewer(2)} type="button">Reviewer 2</button><button className={demoReviewer === 3 ? 'demo-reviewer-btn active' : 'demo-reviewer-btn'} onClick={() => setDemoReviewer(3)} type="button">Reviewer 3</button></div></div><div className="review-feed">{items.length === 0 ? <div className="review-empty"><span>✦</span><h3>{t('nothingToReview')}</h3><p>{t('nothingToReviewHint')}</p></div> : items.map((hotspot) => {
    const comments = hotspot.comments ?? []; const isCleanup = hotspot.status === 'pending_review'; const voted = hotspot.verification_votes.some((vote) => vote.reviewerId === currentDemoReviewerId); const clean = hotspot.verification_votes.filter((vote) => vote.verdict === 'clean').length
    return <article className="review-card" key={hotspot.id}><div className="review-card__meta"><span>{isCleanup ? t('cleanupReview') : t('reportedWaste')} #{hotspot.id.slice(0, 5)}</span><b>{isCleanup ? `${clean}/${VERIFICATION_THRESHOLD} ${t('approvals')}` : t('needsCleanup')}</b></div>{hotspot.description && <div className="review-details"><strong>{t('reportDescription')}</strong><p>{hotspot.description}</p></div>}<div className="review-photos"><figure>{hotspot.photo_data ? <img src={hotspot.photo_data} alt={t('before')} /> : <div className="review-photo-placeholder">{t('noBeforePhoto')}</div>}<figcaption>{t('before')}</figcaption></figure><span className="review-arrow">→</span><figure>{hotspot.after_photo_data ? <img src={hotspot.after_photo_data} alt={t('after')} /> : <div className="review-photo-placeholder">{t('notCleanedYet')}</div>}<figcaption>{t('after')}</figcaption></figure></div>{isCleanup && <>{hotspot.cleanup_description && <div className="review-details review-details--cleanup"><strong>{t('cleanupDetails')}</strong><p>{hotspot.cleanup_description}</p></div>}{voted ? <p className="review-voted">✓ {t('alreadyVoted')}</p> : <div className="review-actions"><button onClick={() => onVote(hotspot.id, 'needs_work', currentDemoReviewerId)} type="button">{t('needsWork')}</button><button className="deploy-btn" onClick={() => onVote(hotspot.id, 'clean', currentDemoReviewerId)} type="button">✓ {t('looksClean')}</button></div>}</>}<div className="review-comments"><h3>{t('comments')} <span>{comments.length}</span></h3>{comments.map((comment) => <p key={comment.id}>💬 {comment.text}</p>)}<form onSubmit={(event) => { event.preventDefault(); onComment(hotspot.id, drafts[hotspot.id] ?? ''); setDrafts({ ...drafts, [hotspot.id]: '' }) }}><input value={drafts[hotspot.id] ?? ''} onChange={(event) => setDrafts({ ...drafts, [hotspot.id]: event.target.value })} maxLength={240} placeholder={t('commentPlaceholder')} /><button type="submit">{t('send')}</button></form></div></article>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  })}</div></section>
}
