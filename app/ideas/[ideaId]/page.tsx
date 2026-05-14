/**
 * Idea detail page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDateTime } from '@/lib/utils/dates'
import { parseIdeaDescription, getMetadataLabel } from '@/lib/utils/idea-metadata'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function IdeaDetailPage({
  params,
}: {
  params: { ideaId: string }
}) {
  const session = await requireAuth()
  const user = session?.user as any

  const idea = await ideaRepository.findById(params.ideaId)

  if (!idea || idea.submitterId !== user.id) {
    notFound()
  }

  // Parse description to extract metadata
  const { description, metadata } = parseIdeaDescription(idea.description)

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">Idea Details</h1>
            <Link href="/ideas" className="text-primary hover:text-primary-dark">
              Back to My Ideas
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{idea.title}</h1>
              <p className="text-text-muted">Category: {idea.category}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${getStatusColor(idea.status)}`}>
              {formatStatus(idea.status)}
            </span>
          </div>

          <div className="border-t border-border pt-6 mb-6">
            <h2 className="text-lg font-bold text-text mb-4">Description</h2>
            <p className="text-text-muted whitespace-pre-wrap">{description}</p>
          </div>

          {metadata && Object.keys(metadata).length > 0 && (
            <div className="border-t border-border pt-6 mb-6">
              <h2 className="text-lg font-bold text-text mb-4">Category Details</h2>
              <div className="space-y-3">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="bg-surface-dark rounded-lg p-3 border border-border">
                    <p className="text-sm text-text-muted">{getMetadataLabel(key)}</p>
                    <p className="text-text font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {idea.attachment && (
            <div className="border-t border-border pt-6 mb-6">
              <h2 className="text-lg font-bold text-text mb-4">Attachment</h2>
              <a
                href={`/${idea.attachment.storagePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Download: {idea.attachment.originalName}
              </a>
            </div>
          )}

          {idea.currentComment && (
            <div className="border-t border-border pt-6 mb-6">
              <h2 className="text-lg font-bold text-text mb-4">Evaluator Comment</h2>
              <div className="bg-surface-dark rounded-lg p-4 border border-border">
                <p className="text-text">{idea.currentComment}</p>
                {idea.reviewedAt && (
                  <p className="text-sm text-text-muted mt-2">
                    Reviewed: {formatDateTime(idea.reviewedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-text mb-4">Timeline</h2>
            <div className="space-y-2 text-sm text-text-muted">
              <p>Submitted: {formatDateTime(idea.createdAt)}</p>
              {idea.updatedAt !== idea.createdAt && (
                <p>Last Updated: {formatDateTime(idea.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-secondary'
    case 'UNDER_REVIEW':
      return 'bg-warning-light'
    case 'ACCEPTED':
      return 'bg-success'
    case 'REJECTED':
      return 'bg-error'
    default:
      return 'bg-secondary'
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ')
}
