/**
 * Draft ideas list page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDate } from '@/lib/utils/dates'
import { parseIdeaDescription } from '@/lib/utils/idea-metadata'
import Link from 'next/link'
import NavBar from '@/components/layout/navbar'

export default async function DraftIdeasPage() {
  const session = await requireAuth()
  const user = session?.user as any

  const drafts = await ideaRepository.findDraftsBySubmitterId(user.id)

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Drafts</h1>
            <p className="mt-0.5 text-sm text-text-muted">{drafts.length} saved draft{drafts.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/ideas/new"
            className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            New idea
          </Link>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-background rounded-lg border border-border p-12 text-center">
            <h2 className="text-base font-medium text-text mb-2">No drafts saved</h2>
            <p className="text-sm text-text-muted mb-6">
              Start writing an idea and save it as a draft to continue later.
            </p>
            <Link
              href="/ideas/new"
              className="inline-flex items-center text-sm font-medium bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create a draft
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft) => {
              const preview = parseIdeaDescription(draft.description).description
              return (
                <div
                  key={draft.id}
                  className="flex items-center justify-between gap-4 bg-background rounded-lg border border-border px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{draft.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {draft.category} &middot; Updated {formatDate(draft.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/ideas/${draft.id}/edit`}
                      className="text-sm px-3 py-1.5 rounded-md border border-border text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/ideas/${draft.id}`}
                      className="text-sm px-3 py-1.5 rounded-md text-primary hover:text-primary-dark transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
