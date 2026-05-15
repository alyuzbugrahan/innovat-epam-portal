'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DraftCardProps {
  id: string
  title: string
  category: string
  updatedAtFormatted: string
}

export default function DraftCard({ id, title, category, updatedAtFormatted }: DraftCardProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error?.message || 'Failed to delete draft')
        setDeleting(false)
        setConfirming(false)
      }
    } catch {
      setError('Failed to delete draft')
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-background rounded-lg border border-border px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">{title}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {category} &middot; Updated {updatedAtFormatted}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/ideas/${id}/edit`}
            className="text-sm px-3 py-1.5 rounded-md border border-border text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
          >
            Edit
          </Link>
          <Link
            href={`/ideas/${id}`}
            className="text-sm px-3 py-1.5 rounded-md text-primary hover:text-primary-dark transition-colors"
          >
            View
          </Link>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-sm px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="text-sm px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => { setConfirming(false); setError('') }}
                className="text-sm px-3 py-1.5 rounded-md border border-border text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {confirming && !deleting && (
        <p className="mt-3 text-xs text-text-muted">
          Are you sure? This cannot be undone.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
