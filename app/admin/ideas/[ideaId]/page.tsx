/**
 * Admin idea detail and evaluation page.
 */

'use client'

import { requireRole } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { formatDateTime } from '@/lib/utils/dates'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

async function getIdea(ideaId: string) {
  return await ideaRepository.findById(ideaId)
}

export default function AdminIdeaDetailPage({
  params,
}: {
  params: { ideaId: string }
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // TODO: Server-side fetch and pass data as props
  // For now using client-side approach

  async function handleEvaluate(toStatus: string) {
    setError('')
    setLoading(true)

    const comment = (document.getElementById('comment') as HTMLTextAreaElement)?.value

    if (!comment?.trim()) {
      setError('Comment is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/ideas/${params.ideaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus, comment }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Failed to evaluate idea')
        return
      }

      router.push('/admin/ideas')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

          {error && (
            <div className="mb-4 p-4 bg-error-light text-error rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text mb-2">Placeholder Title</h2>
            <p className="text-text-muted">Category: Placeholder</p>
          </div>

          <div className="border-t border-border pt-6 mb-6">
            <h3 className="text-lg font-bold text-text mb-4">Description</h3>
            <p className="text-text-muted whitespace-pre-wrap">Placeholder description</p>
          </div>

          <div className="border-t border-border pt-6 mb-6">
            <h3 className="text-lg font-bold text-text mb-4">Evaluation</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-text mb-1">
                  Your Comment <span className="text-error">*</span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  required
                  disabled={loading}
                  placeholder="Provide your evaluation feedback"
                  minLength={5}
                  maxLength={2000}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleEvaluate('UNDER_REVIEW')}
                  className="flex-1 bg-warning-light text-white font-medium py-2 rounded-lg hover:bg-warning disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Move to Under Review'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleEvaluate('ACCEPTED')}
                  className="flex-1 bg-success text-white font-medium py-2 rounded-lg hover:bg-success-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Accept'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleEvaluate('REJECTED')}
                  className="flex-1 bg-error text-white font-medium py-2 rounded-lg hover:bg-error-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
