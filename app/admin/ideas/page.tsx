/**
 * Admin ideas queue page.
 */

import { requireRole } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDate } from '@/lib/utils/dates'
import Link from 'next/link'

export default async function AdminIdeasPage() {
  await requireRole('ADMIN')

  // Fetch all ideas
  const ideas = await ideaRepository.findAll()

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">Admin: Ideas Queue</h1>
            <Link href="/" className="text-primary hover:text-primary-dark">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {ideas.length === 0 ? (
          <div className="bg-background rounded-lg shadow-lg p-8 border border-border text-center">
            <h2 className="text-xl font-bold text-text mb-4">No Ideas to Review</h2>
            <p className="text-text-muted">All ideas have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/admin/ideas/${idea.id}`}
                className="block bg-background rounded-lg shadow-lg p-6 border border-border hover:border-primary transition-all hover:shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-2">{idea.title}</h3>
                    <p className="text-text-muted text-sm mb-3">{idea.description.substring(0, 150)}...</p>
                    <div className="flex gap-4 text-sm text-text-muted">
                      <span>Category: {idea.category}</span>
                      <span>Submitted: {formatDate(idea.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(
                      idea.status
                    )}`}>
                      {formatStatus(idea.status)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-secondary'
    case 'INITIAL_SCREENING':
      return 'bg-warning-light'
    case 'TECHNICAL_REVIEW':
      return 'bg-primary'
    case 'BUSINESS_REVIEW':
      return 'bg-secondary-light'
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
