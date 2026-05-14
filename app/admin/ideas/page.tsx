/**
 * Admin ideas queue page.
 */

import { requireRole } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatTimeAgo } from '@/lib/utils/dates'
import Link from 'next/link'
import NavBar from '@/components/layout/navbar'
import StatusBadge from '@/components/ui/status-badge'
import AdminQueueRefresher from '@/components/admin/admin-queue-refresher'
import AdminSearchBar from '@/components/admin/admin-search-bar'
import AdminFilters from '@/components/admin/admin-filters'
import AdminQueueTabs from '@/components/admin/admin-queue-tabs'
import { Suspense } from 'react'

export default async function AdminIdeasPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string; sort?: string; tab?: string }
}) {
  await requireRole('ADMIN')

  const search = searchParams.q?.trim() || undefined
  const status = searchParams.status?.trim() || undefined
  const category = searchParams.category?.trim() || undefined
  const sort = (searchParams.sort === 'oldest' ? 'oldest' : 'newest') as 'newest' | 'oldest'
  const tab = (searchParams.tab === 'closed' ? 'closed' : 'active') as 'active' | 'closed'

  const [ideas, activeIdeas, closedIdeas] = await Promise.all([
    ideaRepository.findAllWithFilters({ search, status, category, sort, tab }),
    ideaRepository.findAllWithFilters({ tab: 'active' }),
    ideaRepository.findAllWithFilters({ tab: 'closed' }),
  ])

  const hasFilters = !!(search || status || category || searchParams.sort)

  return (
    <AdminQueueRefresher>
      <div className="min-h-screen bg-surface">
        <NavBar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-text">Review Queue</h1>
              <p className="mt-0.5 text-sm text-text-muted">
                {hasFilters
                  ? `${ideas.length} result${ideas.length !== 1 ? 's' : ''}`
                  : `${ideas.length} idea${ideas.length !== 1 ? 's' : ''} in queue`}
              </p>
            </div>
            <Suspense>
              <AdminSearchBar />
            </Suspense>
          </div>

          {/* Filters row */}
          <div className="mb-6">
            <Suspense>
              <AdminFilters />
            </Suspense>
          </div>

          {/* Tabs */}
          <Suspense>
            <AdminQueueTabs activeCount={activeIdeas.length} closedCount={closedIdeas.length} />
          </Suspense>

          {ideas.length === 0 ? (
            <div className="bg-background rounded-lg border border-border p-12 text-center">
              <h2 className="text-base font-medium text-text mb-2">
                {hasFilters ? 'No ideas found' : 'Queue is empty'}
              </h2>
              <p className="text-sm text-text-muted">
                {hasFilters
                  ? 'No ideas match the current filters. Try adjusting your search or filters.'
                  : 'No ideas have been submitted yet. New submissions will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="bg-background rounded-lg border border-border overflow-hidden">
              <ul role="list" className="divide-y divide-border">
                {ideas.map((idea) => (
                  <li key={idea.id}>
                    <Link
                      href={`/admin/ideas/${idea.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-text truncate">{idea.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-dark text-text-muted border border-border shrink-0">
                            {idea.category}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {idea.blindReview && idea.status !== 'ACCEPTED' && idea.status !== 'REJECTED'
                            ? 'Anonymous'
                            : (idea.submitter?.name ?? 'Unknown')}{' '}
                          &middot; {formatTimeAgo(idea.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={idea.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </AdminQueueRefresher>
  )
}

