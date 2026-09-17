interface Props {
  reported: number
  verified: number
  t: (key: string) => string
  onLaunch: () => void
  onSettings: () => void
}

export function Landing({ reported, verified, t, onLaunch, onSettings }: Props) {
  return (
    <main className="home-screen">
      <header className="home-nav">
        <div className="brand-mark" aria-hidden="true">
          <span>♻</span>
        </div>
        <strong>Wasteless</strong>
        <button
          className="home-settings-btn"
          onClick={onSettings}
          type="button"
          aria-label={t('settings')}
        >
          ⚙ <span>{t('settings')}</span>
        </button>
      </header>

      <section className="home-hero">
        <p className="home-eyebrow">{t('homeNetwork')}</p>
        <h1>
          {t('homeSmall')}
          <br />
          <em>{t('homeLasting')}</em>
        </h1>
        <p className="home-copy">{t('tagline')}</p>
        <button className="deploy-btn home-cta" onClick={onLaunch}>
          {t('launch')} <span>→</span>
        </button>
      </section>

      <section className="home-dashboard">
        <div className="home-dashboard__head">
          <span>{t('homeLiveImpact')}</span>
          <span className="live-dot">● LIVE</span>
        </div>
        <div className="home-metrics">
          <div>
            <strong>{reported}</strong>
            <span>{t('reported')}</span>
          </div>
          <div>
            <strong>{verified}</strong>
            <span>{t('verified')}</span>
          </div>
          <div>
            <strong>3</strong>
            <span>{t('homeVotes')}</span>
          </div>
        </div>
        <div className="impact-visual">
          <span className="impact-visual__leaf">❋</span>
          <p>{t('homeNature')}</p>
        </div>
      </section>

      <section className="home-how">
        <div>
          <span>01</span>
          <b>{t('featureReport')}</b>
          <p>{t('takeBeforePhoto')}</p>
        </div>
        <div>
          <span>02</span>
          <b>{t('featureVerify')}</b>
          <p>{t('reviewExplainer')}</p>
        </div>
        <div>
          <span>03</span>
          <b>{t('featureImpact')}</b>
          <p>{t('globalMission')}</p>
        </div>
      </section>
    </main>
  )
}
