'use client'

import { useEffect, useState } from 'react'

export type ToastVariant = 'success' | 'error'

interface ToastProps {
  message: string
  variant: ToastVariant
  onDismiss: () => void
}

export function Toast({ message, variant, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-up on mount
    const enterFrame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(enterFrame)
  }, [])

  const base =
    'fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-lg shadow-lg text-sm text-white max-w-sm transition-all duration-300'
  const color = variant === 'success' ? 'bg-success' : 'bg-error'
  const transform = visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'

  return (
    <div className={`${base} ${color} ${transform}`} role="alert">
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 shrink-0 opacity-75 hover:opacity-100 leading-none text-lg"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
