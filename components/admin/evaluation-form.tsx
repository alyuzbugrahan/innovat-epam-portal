'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ReviewStatus =
  | 'SUBMITTED'
  | 'INITIAL_SCREENING'
  | 'TECHNICAL_REVIEW'
  | 'BUSINESS_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'

interface ActionConfig {
  toStatus: ReviewStatus
  label: string
  className: string
  requireComment: boolean
}

interface EvaluationFormProps {
  ideaId: string
  currentStatus: string
}

function getActionsForStatus(status: string): ActionConfig[] {
  switch (status) {
    case 'SUBMITTED':
      return [
        {
          toStatus: 'INITIAL_SCREENING',
          label: 'Start Initial Screening',
          className:
            'flex-1 bg-warning-light text-white font-medium py-2 rounded-lg hover:bg-warning disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          requireComment: false,
        },
      ]
    case 'INITIAL_SCREENING':
      return [
        {
          toStatus: 'TECHNICAL_REVIEW',
          label: 'Move to Technical Review',
          className:
            'flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          requireComment: false,
        },
      ]
    case 'TECHNICAL_REVIEW':
      return [
        {
          toStatus: 'BUSINESS_REVIEW',
          label: 'Move to Business Review',
          className:
            'flex-1 bg-secondary-light text-white font-medium py-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          requireComment: false,
        },
      ]
    case 'BUSINESS_REVIEW':
      return [
        {
          toStatus: 'ACCEPTED',
          label: 'Accept',
          className:
            'flex-1 bg-success text-white font-medium py-2 rounded-lg hover:bg-success-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          requireComment: true,
        },
        {
          toStatus: 'REJECTED',
          label: 'Reject',
          className:
            'flex-1 bg-error text-white font-medium py-2 rounded-lg hover:bg-error-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          requireComment: true,
        },
      ]
    default:
      return []
  }
}

export default function EvaluationForm({ ideaId, currentStatus }: EvaluationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const actions = getActionsForStatus(currentStatus)

  async function handleEvaluate(toStatus: ReviewStatus, requireComment: boolean) {
    setError('')
    setLoading(true)

    const comment = (document.getElementById('comment') as HTMLTextAreaElement)?.value?.trim() || ''

    if (requireComment && !comment) {
      setError('Comment is required for final decisions')
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

  if (currentStatus === 'ACCEPTED' || currentStatus === 'REJECTED') {
    return (
      <div
        className={`rounded-lg border p-4 text-sm ${
          currentStatus === 'ACCEPTED'
            ? 'border-success bg-success-light text-success-dark'
            : 'border-error bg-error-light text-error-dark'
        }`}
      >
        Final decision recorded: <strong>{currentStatus === 'ACCEPTED' ? 'Accepted' : 'Rejected'}</strong>.
      </div>
    )
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
            Comment <span className="text-text-muted">(required for Accept/Reject)</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            disabled={loading}
            placeholder="Provide review notes. Final decisions require a comment."
            maxLength={2000}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark resize-none"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          {actions.map((action) => (
            <button
              key={action.toStatus}
              type="button"
              disabled={loading}
              onClick={() => handleEvaluate(action.toStatus, action.requireComment)}
              className={action.className}
            >
              {loading ? 'Processing...' : action.label}
            </button>
          ))}
        </div>
      </form>
    </>
  )
}
