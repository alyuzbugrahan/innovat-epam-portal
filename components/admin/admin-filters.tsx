'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { STATUS_LABELS } from '@/lib/utils/status'
import Link from 'next/link'

const STATUSES = [
  'SUBMITTED',
  'INITIAL_SCREENING',
  'TECHNICAL_REVIEW',
  'BUSINESS_REVIEW',
  'ACCEPTED',
  'REJECTED',
] as const

const CATEGORIES = [
  'Technology',
  'Process Improvement',
  'Client Solution',
  'Other',
] as const

const SELECT_CLASS =
  'text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'

export default function AdminFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const status = searchParams.get('status') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? ''

  const hasActiveFilters = !!(status || category || sort)

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/admin/ideas?${params.toString()}`)
      })
    },
    [router, searchParams],
  )

  const clearHref = (() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('category')
    params.delete('sort')
    const qs = params.toString()
    return `/admin/ideas${qs ? `?${qs}` : ''}`
  })()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status */}
      <select
        value={status}
        onChange={(e) => update('status', e.target.value)}
        aria-label="Filter by status"
        className={SELECT_CLASS}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </select>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => update('category', e.target.value)}
        aria-label="Filter by category"
        className={SELECT_CLASS}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => update('sort', e.target.value)}
        aria-label="Sort order"
        className={SELECT_CLASS}
      >
        <option value="">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <Link
          href={clearHref}
          className="text-sm text-text-muted hover:text-text transition-colors underline underline-offset-2"
        >
          Clear filters
        </Link>
      )}
    </div>
  )
}
