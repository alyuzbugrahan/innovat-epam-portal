'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Toast } from '@/components/ui/toast'
import type { ToastVariant } from '@/components/ui/toast'

interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant) => void
  hideToast: () => void
}

export const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hideToast = useCallback(() => {
    setToast(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setToast({ message, variant })
      timerRef.current = setTimeout(hideToast, 3000)
    },
    [hideToast],
  )

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={hideToast} />
      )}
    </ToastContext.Provider>
  )
}
