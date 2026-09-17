import type { Hotspot, Lang } from '../types'
import { BADGES, LEVELS } from '../lib/challenges'
import { getLevel, getProgressToNextLevel } from '../lib/challenges'

interface Props {
  hotspots: Hotspot[]
  xp: number
  lang: Lang
  t: (key: string) => string
  onLangChange: (lang: Lang) => void
  onClose: () => void
  reviewerId: string
  streak: number
  badges: string[]
  avatar: string
  onAvatarChange: (avatar: string) => void
}

export function ImpactSheet({ hotspots, xp, lang, t, onLangChange, onClose, reviewerId, streak, badges, avatar, onAvatarChange }: Props) {
  const resolved = hotspots.filter((hotspot) => hotspot.status === 'resolved').length
  const currentLevel = getLevel(xp) || LEVELS[0]
  const progress = getProgressToNextLevel(xp)

  // Filter user's own contributions
  const myReports = hotspots.filter((hotspot) => hotspot.created_by === reviewerId)
  const myCleanups = hotspots.filter((hotspot) =>
    hotspot.created_by === reviewerId && hotspot.after_photo_data !== null
  )
  const myReviews = hotspots.filter((hotspot) =>
    hotspot.verification_votes.some((vote) => vote.reviewerId === reviewerId)
  )

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <section className="bottom-sheet" role="dialog">
        <div className="bottom-sheet__handle" />
        <div className="report-card__header">
          <h2 className="report-card__title">{t('me')}</h2>
          <button className="report-card__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="me-profile">
          <div className="me-profile__avatar" onClick={() => {}}>{avatar}</div>
          <p className="me-profile__name">{t('myImpact')}</p>
          <div className="me-profile__level">
            <span className="me-profile__level-icon">{currentLevel?.icon || '🌱'}</span>
            <div>
              <strong>{currentLevel?.name || 'Volunteer'}</strong>
              <span>Level {currentLevel?.level || 1}</span>
            </div>
          </div>
          <div className="me-profile__xp">
            <span className="me-profile__xp-number">{xp}</span>
            <span className="me-profile__xp-label">XP</span>
          </div>
          <div className="me-progress-bar">
            <div className="me-progress-bar__fill" style={{ width: `${progress.progress}%` }} />
          </div>
          <p>{progress.current} / {progress.next} XP to next level</p>
          <p>{resolved} {t('cleanupsResolved')}</p>
        </div>

        <div className="me-avatar-picker">
          <strong>{t('changeAvatar')}</strong>
          <div className="me-avatar-grid">
            {['🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🦄', '🐙', '🦋', '🐸', '🦎', '🐢', '🦖', '🦕', '🐊', '🐳', '🦈', '🐬', '🦭', '🐅'].map((emoji) => (
              <button
                key={emoji}
                className={`me-avatar-option${avatar === emoji ? ' is-selected' : ''}`}
                onClick={() => onAvatarChange(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="me-stats">
          <div className="me-stat">
            <strong>{myReports.length}</strong>
            <span>{t('myReports')}</span>
          </div>
          <div className="me-stat">
            <strong>{myCleanups.length}</strong>
            <span>{t('myCleanups')}</span>
          </div>
          <div className="me-stat">
            <strong>{myReviews.length}</strong>
            <span>{t('myReviews')}</span>
          </div>
        </div>

        <div className="me-gamification">
          <div className="me-streak">
            <span className="me-streak__icon">🔥</span>
            <div>
              <strong>{streak}</strong>
              <span>{t('streak')}</span>
            </div>
          </div>
          <div className="me-badges">
            <strong>{t('badge')}</strong>
            <div className="me-badges__list">
              {badges.length === 0 ? (
                <span className="me-badges__empty">{t('badgeDescription')}</span>
              ) : (
                badges.map((badgeId) => {
                  const badge = BADGES.find((b) => b.id === badgeId)
                  return badge ? (
                    <div key={badge.id} className="me-badges__item" title={badge.description}>
                      <span>{badge.icon}</span>
                    </div>
                  ) : null
                })
              )}
            </div>
          </div>
        </div>

        <div className="me-lang">
          <span className="me-lang__label">
            {t('settings')} · {t('language')}
          </span>
          <div className="me-lang__options">
            {(['en', 'fr', 'ar'] as Lang[]).map((item) => (
              <button
                key={item}
                className={`me-lang__btn${lang === item ? ' is-active' : ''}`}
                onClick={() => onLangChange(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
