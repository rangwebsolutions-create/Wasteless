interface Props { active: 'map' | 'review' | 'me'; t: (key: string) => string; onMap: () => void; onReview: () => void; onMe: () => void }

export function BottomNav({ active, t, onMap, onReview, onMe }: Props) {
  return <nav className="bottom-nav"><button className={`bottom-nav__item${active === 'review' ? ' is-active' : ''}`} onClick={onReview} type="button"><span className="bottom-nav__icon">✓</span><span className="bottom-nav__label">{t('review')}</span></button><button className={`bottom-nav__item bottom-nav__item--center${active === 'map' ? ' is-active' : ''}`} onClick={onMap} type="button"><span className="bottom-nav__icon">⌖</span><span className="bottom-nav__label">{t('map')}</span></button><button className={`bottom-nav__item${active === 'me' ? ' is-active' : ''}`} onClick={onMe} type="button"><span className="bottom-nav__icon">●</span><span className="bottom-nav__label">{t('me')}</span></button></nav>
}
