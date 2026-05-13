'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EvaluationFormProps {
  ideaId: string
  currentStatus: string
}

export default function EvaluationForm({ ideaId, currentStatus }: EvaluationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
      const response = await fetch(`/api/admin/ideas/${ideaId}/status`, {
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
    <>
      {error && (
        <div className="mb-4 p-4 bg-error-light text-error rounded-lg text-sm">
          {error}
        </div>
      )}

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
          {currentStatus === 'SUBMITTED' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleEvaluate('UNDER_REVIEW')}
              className="flex-1 bg-warning-light text-white font-medium py-2 rounded-lg hover:bg-warning disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Move to Under Review'}
            </button>
          )}

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
    </>
  )
}
