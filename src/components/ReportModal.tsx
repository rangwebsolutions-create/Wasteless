import { useState } from 'react'
import { LiveCamera, type CaptureResult } from './LiveCamera'
import type { Hotspot } from '../types'

interface Props {
  pendingLatLng: [number, number]
  t: (key: string, vars?: Record<string, string | number>) => string
  onSuccess: (hotspot: Hotspot) => void
  onClose: () => void
  onCameraError?: (error: string) => void
  reviewerId: string
}

export function ReportModal({ pendingLatLng, t, onSuccess, onClose, onCameraError, reviewerId }: Props) {
  const [capture, setCapture] = useState<CaptureResult | null>(null)
  const [severity, setSeverity] = useState(3)
  const [isPrivate, setPrivate] = useState(false)
  const [description, setDescription] = useState('')

  function submit() {
    if (!capture) return
    onSuccess({
      id: crypto.randomUUID(),
      lat: pendingLatLng[0],
      lng: pendingLatLng[1],
      severity_score: severity,
      status: 'open',
      created_at: new Date().toISOString(),
      photo_data: capture.dataUrl,
      after_photo_data: null,
      cleanup_mode: isPrivate ? 'private' : 'public',
      photo_lat: null,
      photo_lng: null,
      photo_timestamp: capture.timestamp,
      description: description.trim(),
      cleanup_description: null,
      verification_votes: [],
      comments: [],
      created_by: reviewerId,
    })
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal-card report-card">
        <div className="report-card__header">
          <h2 className="report-card__title">{t('reportHotspot')}</h2>
          <button className="report-card__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <LiveCamera onCapture={setCapture} label={t('takeBeforePhoto')} onError={onCameraError} />
        <label className="auth-card__label" htmlFor="report-description">
          {t('description')}
        </label>
        <textarea
          id="report-description"
          className="report-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={280}
          placeholder={t('reportDescriptionPlaceholder')}
        />
        <button
          className={`stealth-toggle${isPrivate ? ' is-active' : ''}`}
          onClick={() => setPrivate(!isPrivate)}
          type="button"
        >
          {isPrivate ? '🔒 ' + t('privateReport') : '🌍 ' + t('publicReport')}
        </button>
        <label className="auth-card__label">{t('severity')}</label>
        <select
          className="auth-card__select"
          value={severity}
          onChange={(event) => setSeverity(Number(event.target.value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}/5
            </option>
          ))}
        </select>
        <button className="deploy-btn" disabled={!capture} onClick={submit}>
          {t('submitReport')}
        </button>
      </div>
    </div>
  )
}
