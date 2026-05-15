/**
 * Idea detail page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDateTime } from '@/lib/utils/dates'
import { getMetadataLabel } from '@/lib/utils/idea-metadata'
import { STATUS_FULL_LABELS } from '@/lib/utils/status'
import Breadcrumb from '@/components/ui/breadcrumb'
import NavBar from '@/components/layout/navbar'
import StatusBadge from '@/components/ui/status-badge'
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
  const description = idea.description
  const metadata = idea.categoryMetadata ? JSON.parse(idea.categoryMetadata) : null
  const attachments = Array.isArray(idea.attachments) ? idea.attachments : []
  const latestScoredEvaluation = Array.isArray(idea.evaluations)
    ? idea.evaluations.find((evaluation) => evaluation.score != null)
    : null

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'My Ideas', href: '/ideas' }, { label: idea.title }]} />

        <div className="bg-background rounded-lg border border-border overflow-hidden">
          {/* Idea header */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-text">{idea.title}</h1>
                <p className="text-sm text-text-muted mt-1">{idea.category}</p>
              </div>
              <StatusBadge status={idea.status} size="md" />
            </div>
          </div>

          {/* Description */}
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Description</h2>
            <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{description}</p>
          </div>

          {/* Category details */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Category Details</h2>
              <div className="space-y-3">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-text-muted mb-0.5">{getMetadataLabel(key)}</p>
                    <p className="text-sm text-text font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Attachments</h2>
              <ul className="space-y-2">
                {attachments.map((attachment) => {
                  const fileName = attachment.storagePath.split('/').pop() || attachment.storagePath
                  return (
                    <li
                      key={attachment.id}
                      className="flex items-center justify-between py-2 px-3 bg-surface rounded-md border border-border"
                    >
                      <div>
                        <p className="text-sm text-text font-medium">{attachment.originalName}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {(attachment.sizeBytes / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={`/uploads/${fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Download
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Evaluator feedback */}
          {(idea.currentComment || latestScoredEvaluation?.score != null) && (
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Evaluator Feedback</h2>
              <div className="bg-surface rounded-md border border-border p-4">
                {idea.currentComment && (
                  <p className="text-sm text-text leading-relaxed">{idea.currentComment}</p>
                )}
                {latestScoredEvaluation?.score != null && (
                  <p className="text-sm text-text-muted mt-2">
                    Score: <span className="font-medium text-text">{latestScoredEvaluation.score} / 5</span>
                  </p>
                )}
                {idea.reviewedAt && (
                  <p className="text-xs text-text-muted mt-2">
                    Reviewed {formatDateTime(idea.reviewedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="px-6 py-5">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Timeline</h2>
            <div className="space-y-1 text-xs text-text-muted">
              <p>Submitted {formatDateTime(idea.createdAt)}</p>
              {idea.updatedAt !== idea.createdAt && (
                <p>Last updated {formatDateTime(idea.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

