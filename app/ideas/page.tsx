/**
 * Ideas list page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDate } from '@/lib/utils/dates'
import Link from 'next/link'
import NavBar from '@/components/layout/navbar'
import StatusBadge from '@/components/ui/status-badge'
import IdeaSearchFilters from '@/components/ideas/idea-search-filters'
import { Suspense } from 'react'

export default async function IdeasListPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string; sort?: string }
}) {
  const session = await requireAuth()
  const user = session?.user as any

  const search = searchParams.q?.trim() || undefined
  const status = searchParams.status?.trim() || undefined
  const category = searchParams.category?.trim() || undefined
  const sort = (searchParams.sort === 'oldest' ? 'oldest' : undefined) as 'oldest' | undefined

  const hasFilters = !!(search || status || category || searchParams.sort)

  const ideas = await ideaRepository.findBySubmitterWithFilters({
    submitterId: user.id,
    search,
    status,
    category,
    sort,
  })

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-text">My Ideas</h1>
            <p className="mt-0.5 text-sm text-text-muted">
              {hasFilters
                ? `${ideas.length} result${ideas.length !== 1 ? 's' : ''}`
                : `${ideas.length} idea${ideas.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/ideas/drafts"
              className="text-sm px-3 py-1.5 rounded-md border border-border text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
            >
              Drafts
            </Link>
            <Link
              href="/ideas/new"
              className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              New idea
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <Suspense>
          <IdeaSearchFilters />
        </Suspense>

        {ideas.length === 0 ? (
          <div className="bg-background rounded-lg border border-border p-12 text-center">
            <h2 className="text-base font-medium text-text mb-2">
              {hasFilters ? 'No ideas found' : 'No ideas yet'}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              {hasFilters
                ? 'No ideas match the current filters. Try adjusting your search.'
                : 'Submit your first innovation idea to share it with the team.'}
            </p>
            {!hasFilters && (
              <Link
                href="/ideas/new"
                className="inline-flex items-center text-sm font-medium bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Submit an idea
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-center justify-between gap-4 bg-background rounded-lg border border-border px-5 py-4 hover:border-primary/50 hover:bg-surface/50 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{idea.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {idea.category} &middot; {formatDate(idea.createdAt)}
                  </p>
                </div>
                <StatusBadge status={idea.status} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

