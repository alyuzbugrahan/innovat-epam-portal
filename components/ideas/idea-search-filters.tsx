'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils/status'

const STATUSES = Object.entries(STATUS_LABELS).filter(([key]) => key !== 'DRAFT')

const CATEGORIES = ['Technology', 'Process Improvement', 'Client Solution', 'Other']

export default function IdeaSearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? ''

  const hasFilters = !!(q || status || category || sort)

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => router.push(`?${params.toString()}`))
  }

  function clearAll() {
    startTransition(() => router.push('?'))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search by title…"
          defaultValue={q}
          onChange={(e) => update('q', e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        />
      </div>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => update('status', e.target.value)}
        className="text-sm px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
      >
        <option value="">All Statuses</option>
        {STATUSES.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => update('category', e.target.value)}
        className="text-sm px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => update('sort', e.target.value)}
        className="text-sm px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
      >
        <option value="">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
