import { useState } from 'react'
import { LiveCamera, type CaptureResult } from './LiveCamera'
import type { Hotspot } from '../types'

interface Props {
  hotspot: Hotspot
  t: (key: string, vars?: Record<string, string | number>) => string
  onSuccess: (
    id: string,
    update: Pick<
      Hotspot,
      | 'after_photo_data'
      | 'photo_lat'
      | 'photo_lng'
      | 'photo_timestamp'
      | 'cleanup_mode'
      | 'cleanup_description'
    >
  ) => void
  onClose: () => void
  showToast: (message: string) => void
  onCameraError?: (error: string) => void
}

export function ClaimModal({ hotspot, t, onSuccess, onClose, onCameraError }: Props) {
  const [capture, setCapture] = useState<CaptureResult | null>(null)
  const [details, setDetails] = useState('')

  function submit() {
    if (capture)
      onSuccess(hotspot.id, {
        after_photo_data: capture.dataUrl,
        photo_lat: null,
        photo_lng: null,
        photo_timestamp: capture.timestamp,
        cleanup_mode: hotspot.cleanup_mode,
        cleanup_description: details.trim(),
      })
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal-card report-card">
        <div className="report-card__header">
          <h2 className="report-card__title">{t('claimCleanup')}</h2>
          <button className="report-card__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="upload-wrapper__caption">{t('reviewExplainer')}</p>
        <LiveCamera onCapture={setCapture} label={t('takeAfterPhoto')} onError={onCameraError} />
        <label className="auth-card__label" htmlFor="cleanup-details">
          {t('cleanupDetails')}
        </label>
        <textarea
          id="cleanup-details"
          className="report-description"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={280}
          placeholder={t('cleanupDetailsPlaceholder')}
        />
        <button className="deploy-btn" disabled={!capture} onClick={submit}>
          {t('sendForReview')}
        </button>
      </div>
    </div>
  )
}
