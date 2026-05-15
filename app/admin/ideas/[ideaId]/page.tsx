/**
 * Admin idea detail and evaluation page.
 */

import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDateTime } from '@/lib/utils/dates'
import { getMetadataLabel } from '@/lib/utils/idea-metadata'
import { STATUS_LABELS, STATUS_FULL_LABELS } from '@/lib/utils/status'
import Breadcrumb from '@/components/ui/breadcrumb'
import StatusBadge from '@/components/ui/status-badge'
import NavBar from '@/components/layout/navbar'
import EvaluationForm from '@/components/admin/evaluation-form'
import { notFound } from 'next/navigation'

async function getIdea(ideaId: string) {
  return await ideaRepository.findById(ideaId)
}

export default async function AdminIdeaDetailPage({
  params,
}: {
  params: { ideaId: string }
}) {
  const idea = await getIdea(params.ideaId)

  if (!idea) {
    notFound()
  }

  // Parse description to extract metadata
  const description = idea.description
  const metadata = idea.categoryMetadata ? JSON.parse(idea.categoryMetadata) : null
  const attachments = Array.isArray(idea.attachments) ? idea.attachments : []
  const latestEvaluation = Array.isArray(idea.evaluations) && idea.evaluations.length > 0 ? idea.evaluations[0] : null
  const isFinalDecision = idea.status === 'ACCEPTED' || idea.status === 'REJECTED'
  const revealSubmitterIdentity = !idea.blindReview || isFinalDecision

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Review Queue', href: '/admin/ideas' }, { label: idea.title }]} />

        <div className="bg-background rounded-lg border border-border overflow-hidden">
          {/* Idea header */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-text">{idea.title}</h1>
                <p className="text-sm text-text-muted mt-1">{idea.category}</p>
                <p className="text-xs text-text-muted mt-1">
                  {revealSubmitterIdentity
                    ? `Submitted by ${idea.submitter?.name || 'Unknown'} (${idea.submitter?.email || ''})`
                    : 'Anonymous submission'}{' '}
                  &middot; {formatDateTime(idea.createdAt)}
                </p>
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

          {/* Previous comment */}
          {idea.currentComment && (
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Current Comment</h2>
              <p className="text-sm text-text whitespace-pre-wrap leading-relaxed bg-surface rounded-md border border-border p-4">
                {idea.currentComment}
              </p>
            </div>
          )}

          {/* Evaluation history */}
          {Array.isArray(idea.evaluations) && idea.evaluations.length > 0 && (
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Evaluation History</h2>
              <ol className="space-y-3">
                {idea.evaluations.map((ev: any) => (
                  <li key={ev.id} className="p-4 bg-surface rounded-md border border-border">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text">
                          {ev.evaluator?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-text-muted">
                          {STATUS_LABELS[ev.fromStatus] ?? ev.fromStatus} &rarr; {STATUS_LABELS[ev.toStatus] ?? ev.toStatus}
                        </span>
                        {ev.recommendation === 'APPROVE' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Approve
                          </span>
                        )}
                        {ev.recommendation === 'REJECT' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            Reject
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted shrink-0">{formatDateTime(ev.createdAt)}</span>
                    </div>
                    {ev.comment && (
                      <p className="text-sm text-text-muted whitespace-pre-wrap mt-1">{ev.comment}</p>
                    )}
                    {ev.score != null && (
                      <p className="text-xs text-text-muted mt-1">Score: {ev.score} / 5</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Evaluation form */}
          <div className="px-6 py-5">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Evaluation</h2>
            <EvaluationForm ideaId={params.ideaId} currentStatus={idea.status || 'SUBMITTED'} />
          </div>
        </div>
      </main>
    </div>
  )
}

