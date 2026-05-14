/**
 * Draft ideas list page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDate } from '@/lib/utils/dates'
import Link from 'next/link'

export default async function DraftIdeasPage() {
  const session = await requireAuth()
  const user = session?.user as any

  const drafts = await ideaRepository.findDraftsBySubmitterId(user.id)

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">My Drafts</h1>
            <div className="flex gap-4">
              <Link href="/ideas/new" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                New Idea
              </Link>
              <Link href="/ideas" className="text-primary hover:text-primary-dark">
                Back to Ideas
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {drafts.length === 0 ? (
          <div className="bg-background rounded-lg shadow-lg p-8 border border-border text-center">
            <h2 className="text-xl font-bold text-text mb-4">No Drafts Yet</h2>
            <p className="text-text-muted mb-6">You have no saved drafts.</p>
            <Link href="/ideas/new" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
              Create New Draft
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-background rounded-lg shadow-lg p-6 border border-border"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-2">{draft.title}</h3>
                    <p className="text-text-muted text-sm mb-3">{draft.description.substring(0, 150)}...</p>
                    <div className="flex gap-4 text-sm text-text-muted">
                      <span>Category: {draft.category}</span>
                      <span>Updated: {formatDate(draft.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/ideas/${draft.id}/edit`}
                      className="inline-block bg-warning-light text-white px-4 py-2 rounded-lg hover:bg-warning"
                    >
                      Edit Draft
                    </Link>
                    <Link
                      href={`/ideas/${draft.id}`}
                      className="inline-block bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
