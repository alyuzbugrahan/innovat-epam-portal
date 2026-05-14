'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export default function AdminSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }

      startTransition(() => {
        router.push(`/admin/ideas?${params.toString()}`)
      })
    },
    [router, searchParams],
  )

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        size={15}
        aria-hidden="true"
      />
      <input
        type="search"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleChange}
        placeholder="Search by title…"
        aria-label="Search ideas by title"
        className={`w-full sm:w-72 pl-9 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-opacity ${isPending ? 'opacity-60' : ''}`}
      />
    </div>
  )
}
