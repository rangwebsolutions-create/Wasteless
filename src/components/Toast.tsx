import { useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setVisible(false)
    } else {
      setVisible(true)
      const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300) }, 2600)
      return () => clearTimeout(t)
    }
  }, [message])

  return (
    <div className={`toast${visible ? ' visible' : ''}`} aria-live="polite">
      {message}
    </div>
  )
}
