/**
 * Admin idea detail and evaluation page.
 */

import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDateTime } from '@/lib/utils/dates'
import { parseIdeaDescription, getMetadataLabel } from '@/lib/utils/idea-metadata'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EvaluationForm from './_components/evaluation-form'

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
  const { description, metadata } = parseIdeaDescription(idea.description)
  const attachments = Array.isArray(idea.attachments) ? idea.attachments : []

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">Evaluate Idea</h1>
            <Link href="/admin/ideas" className="text-primary hover:text-primary-dark">
              Back to Queue
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
          <div className="mb-6 p-4 bg-warning-light text-white rounded-lg">
            <p className="text-sm font-medium">
              Admin Review Mode: You can transition this idea's status and add your evaluation comment.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text mb-2">{idea.title}</h2>
            <p className="text-text-muted">Category: {idea.category}</p>
            <p className="text-text-muted text-sm mt-2">
              Submitted by: {idea.submitter?.name || 'Unknown'} on{' '}
              {formatDateTime(idea.createdAt)}
            </p>
            {idea.status && (
              <p className="text-text-muted text-sm mt-1">
                Current Status:{' '}
                <span className="font-semibold">
                  {idea.status === 'SUBMITTED' && '📋 Submitted'}
                  {idea.status === 'UNDER_REVIEW' && '🔍 Under Review'}
                  {idea.status === 'ACCEPTED' && '✅ Accepted'}
                  {idea.status === 'REJECTED' && '❌ Rejected'}
                </span>
              </p>
            )}
          </div>

          <div className="border-t border-border pt-6 mb-6">
            <h3 className="text-lg font-bold text-text mb-4">Description</h3>
            <p className="text-text-muted whitespace-pre-wrap">{description}</p>
          </div>

          {metadata && Object.keys(metadata).length > 0 && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-text mb-4">Category Details</h3>
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

          {attachments.length > 0 && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-text mb-4">Attachments</h3>
              <ul className="space-y-2">
                {attachments.map((attachment) => {
                  const fileName = attachment.storagePath.split('/').pop() || attachment.storagePath
                  return (
                    <li
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-surface-dark rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-text text-sm font-medium">📎 {attachment.originalName}</p>
                        <p className="text-text-muted text-xs mt-1">
                          {(attachment.sizeBytes / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <a
                        href={`/uploads/${fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary text-white px-4 py-1 rounded-lg hover:bg-primary-dark transition-colors text-sm"
                      >
                        View
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {idea.currentComment && (
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="text-lg font-bold text-text mb-4">Previous Comment</h3>
              <p className="text-text-muted whitespace-pre-wrap p-4 bg-surface-dark rounded-lg border border-border">
                {idea.currentComment}
              </p>
            </div>
          )}

          <div className="border-t border-border pt-6 mb-6">
            <h3 className="text-lg font-bold text-text mb-4">Evaluation</h3>
            <EvaluationForm ideaId={params.ideaId} currentStatus={idea.status || 'SUBMITTED'} />
          </div>
        </div>
      </main>
    </div>
  )
}

