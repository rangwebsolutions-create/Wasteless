import { useState } from 'react'
import type { Hotspot } from '../types'

interface Props {
  hotspot: Hotspot
  t: (key: string, vars?: Record<string, string | number>) => string
  onSuccess: (id: string, update: Partial<Hotspot>) => void
  onDelete: (id: string) => void
  onCleanup: (hotspot: Hotspot) => void
  onClose: () => void
}

export function EditModal({ hotspot, t, onSuccess, onDelete, onCleanup, onClose }: Props) {
  const [description, setDescription] = useState(hotspot.description)
  const [severity, setSeverity] = useState(hotspot.severity_score)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPrivate, setIsPrivate] = useState(hotspot.cleanup_mode === 'private')

  function handleSave() {
    onSuccess(hotspot.id, {
      description: description.trim(),
      severity_score: severity,
      cleanup_mode: isPrivate ? 'private' : 'public',
    })
    onClose()
  }

  function handleDelete() {
    onDelete(hotspot.id)
    onClose()
  }

  function handleCleanup() {
    onCleanup(hotspot)
    onClose()
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal-card report-card">
        <div className="report-card__header">
          <h2 className="report-card__title">{t('editHotspot')}</h2>
          <button className="report-card__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {!showDeleteConfirm ? (
          <>
            <label className="auth-card__label" htmlFor="edit-description">
              {t('description')}
            </label>
            <textarea
              id="edit-description"
              className="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={280}
              placeholder={t('reportDescriptionPlaceholder')}
            />

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

            <button
              className={`stealth-toggle${isPrivate ? ' is-active' : ''}`}
              onClick={() => setIsPrivate(!isPrivate)}
              type="button"
            >
              {isPrivate ? '🔒 ' + t('privateReport') : '🌍 ' + t('publicReport')}
            </button>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleCleanup} type="button">
                {t('cleanup')}
              </button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(true)} type="button">
                {t('delete')}
              </button>
              <button className="deploy-btn" onClick={handleSave} type="button">
                {t('save')}
              </button>
            </div>
          </>
        ) : (
          <div className="delete-confirm">
            <p>{t('confirmDelete')}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} type="button">
                {t('cancel')}
              </button>
              <button className="btn-danger" onClick={handleDelete} type="button">
                {t('confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}