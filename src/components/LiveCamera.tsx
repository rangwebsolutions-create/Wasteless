import { useRef, useState, useCallback } from 'react'

export interface CaptureResult {
  file: File
  dataUrl: string
  gps: { lat: number; lng: number } | null
  timestamp: string
}

interface LiveCameraProps {
  onCapture: (result: CaptureResult) => void
  label?: string
  onError?: (error: string) => void
}

type CameraPhase = 'ready' | 'starting' | 'live' | 'captured' | 'unavailable'

export function LiveCamera({ onCapture, label, onError }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<CameraPhase>('ready')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }

  const start = useCallback(async () => {
    stop()
    setPhase('starting')
    setError(null)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setPhase('live')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      setPhase('unavailable')
      onError?.(errorMessage)
    }
  }, [])

  function capture() {
    const v = videoRef.current
    const c = canvasRef.current

    if (!v || !c) {
      setError('Camera not available')
      return
    }

    try {
      c.width = v.videoWidth || 1280
      c.height = v.videoHeight || 720

      const ctx = c.getContext('2d')
      if (!ctx) {
        setError('Failed to capture image')
        return
      }

      ctx.drawImage(v, 0, 0)

      c.toBlob(
        (blob) => {
          if (!blob) {
            setError('Failed to process captured image')
            return
          }

          const dataUrl = c.toDataURL('image/jpeg', 0.85)
          const file = new File([blob], `live_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })

          setPreview(dataUrl)
          setPhase('captured')
          stop()

          onCapture({
            file,
            dataUrl,
            gps: null,
            timestamp: new Date().toISOString(),
          })
        },
        'image/jpeg',
        0.85
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture photo'
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  if (phase === 'captured' && preview) {
    return (
      <div className="live-camera live-camera--captured">
        <img src={preview} className="live-camera__preview" alt="Captured" />
        <button
          className="live-camera__retake"
          onClick={() => {
            setPreview(null)
            setPhase('ready')
            setError(null)
          }}
          type="button"
        >
          Retake
        </button>
      </div>
    )
  }

  if (phase === 'ready' || phase === 'unavailable') {
    return (
      <div className="live-camera live-camera--denied">
        <span className="live-camera__denied-icon">📷</span>
        <p className="live-camera__denied-text">
          {phase === 'ready'
            ? 'Ready to take a live photo'
            : 'Camera access is blocked'}
        </p>
        {error && (
          <p className="live-camera__error" style={{ color: '#EF4444', fontSize: '0.875rem' }}>
            {error}
          </p>
        )}
        <p className="live-camera__denied-hint">
          {phase === 'ready'
            ? 'Use your camera only — gallery photos are not accepted.'
            : 'Allow camera access for this site, then try again.'}
        </p>
        <button className="deploy-btn" onClick={start} type="button">
          {label || 'Start Camera'}
        </button>
      </div>
    )
  }

  return (
    <div className="live-camera live-camera--live">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="live-camera__video"
      />
      <canvas ref={canvasRef} className="live-camera__canvas" style={{ display: 'none' }} />
      <button
        className="live-camera__capture"
        onClick={capture}
        type="button"
        aria-label="Capture photo"
      >
        ●
      </button>
    </div>
  )
}