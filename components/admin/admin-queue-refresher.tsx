'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminQueueRefresher({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30_000)

    return () => clearInterval(interval)
  }, [router])

  return <>{children}</>
}
