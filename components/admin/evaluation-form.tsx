'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { STATUS_FULL_LABELS } from '@/lib/utils/status'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useToast } from '@/lib/hooks/use-toast'

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

const BASE_BTN = 'px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

function getActionsForStatus(status: string): ActionConfig[] {
  switch (status) {
    case 'SUBMITTED':
      return [
        {
          toStatus: 'INITIAL_SCREENING',
          label: 'Start Initial Screening',
          className: `${BASE_BTN} bg-primary text-white hover:bg-primary-dark`,
          requireComment: false,
        },
      ]
    case 'INITIAL_SCREENING':
      return [
        {
          toStatus: 'TECHNICAL_REVIEW',
          label: 'Move to Technical Review',
          className: `${BASE_BTN} bg-primary text-white hover:bg-primary-dark`,
          requireComment: false,
        },
      ]
    case 'TECHNICAL_REVIEW':
      return [
        {
          toStatus: 'BUSINESS_REVIEW',
          label: 'Move to Business Review',
          className: `${BASE_BTN} bg-primary text-white hover:bg-primary-dark`,
          requireComment: false,
        },
      ]
    case 'BUSINESS_REVIEW':
      return [
        {
          toStatus: 'ACCEPTED',
          label: 'Accept idea',
          className: `${BASE_BTN} bg-success text-white hover:bg-success-dark`,
          requireComment: true,
        },
        {
          toStatus: 'REJECTED',
          label: 'Reject idea',
          className: `${BASE_BTN} border border-error text-error hover:bg-red-50`,
          requireComment: true,
        },
      ]
    default:
      return []
  }
}

const RECOMMENDATION_STAGES = ['TECHNICAL_REVIEW', 'BUSINESS_REVIEW']

export default function EvaluationForm({ ideaId, currentStatus }: EvaluationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [score, setScore] = useState<number | ''>('')
  const [hoverScore, setHoverScore] = useState<number | null>(null)
  const [recommendation, setRecommendation] = useState<'APPROVE' | 'REJECT' | ''>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ toStatus: ReviewStatus; requireComment: boolean } | null>(null)
  const router = useRouter()
  const { showToast } = useToast()
  const actions = getActionsForStatus(currentStatus)
  const showRecommendation = RECOMMENDATION_STAGES.includes(currentStatus)

  function getErrorMessage(payload: any, fallback: string): string {
    const details = payload?.error?.details
    const firstDetail = details
      ? Object.values(details)
          .flat()
          .find((message) => typeof message === 'string' && message.trim().length > 0)
      : null

    return firstDetail || payload?.error?.message || fallback
  }

  function handleButtonClick(toStatus: ReviewStatus, requireComment: boolean) {
    setError('')

    const trimmedComment = comment.trim()
    if (requireComment && !trimmedComment) {
      setError('Comment is required for final decisions')
      return
    }

    if (toStatus === 'ACCEPTED' || toStatus === 'REJECTED') {
      setPendingAction({ toStatus, requireComment })
      setIsDialogOpen(true)
      return
    }

    handleEvaluate(toStatus)
  }

  async function handleEvaluate(toStatus: ReviewStatus) {
    setLoading(true)

    const trimmedComment = comment.trim()

    try {
      const response = await fetch(`/api/admin/ideas/${ideaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus,
          comment: trimmedComment,
          score: score === '' ? undefined : score,
          recommendation: recommendation === '' ? null : recommendation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const msg = getErrorMessage(data, 'Failed to evaluate idea')
        setError(msg)
        showToast(msg, 'error')
        return
      }

      showToast('Status updated successfully', 'success')
      router.refresh()
    } catch (err) {
      const msg = 'An error occurred. Please try again.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleDialogConfirm() {
    if (!pendingAction) return
    setIsDialogOpen(false)
    handleEvaluate(pendingAction.toStatus)
    setPendingAction(null)
  }

  function handleDialogCancel() {
    setIsDialogOpen(false)
    setPendingAction(null)
  }

  if (currentStatus === 'ACCEPTED' || currentStatus === 'REJECTED') {
    return (
      <div
        className={`rounded-lg border p-4 text-sm ${
          currentStatus === 'ACCEPTED'
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}
      >
        Final decision recorded: <strong>{STATUS_FULL_LABELS[currentStatus] ?? currentStatus}</strong>.
      </div>
    )
  }

  return (
    <>
      <ConfirmDialog
        isOpen={isDialogOpen}
        title={pendingAction?.toStatus === 'ACCEPTED' ? 'Confirm Acceptance' : 'Confirm Rejection'}
        message={
          pendingAction?.toStatus === 'ACCEPTED'
            ? 'Are you sure you want to accept this idea? This action cannot be undone.'
            : 'Are you sure you want to reject this idea? This action cannot be undone.'
        }
        confirmLabel={pendingAction?.toStatus === 'ACCEPTED' ? 'Accept' : 'Reject'}
        variant={pendingAction?.toStatus === 'ACCEPTED' ? 'success' : 'danger'}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
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
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark resize-none"
          />
          <p className={`text-xs text-right mt-1 ${comment.length > 1800 ? 'text-error' : 'text-text-muted'}`}>
            {comment.length} / 2000
          </p>
        </div>

        <div>
          <p className="block text-sm font-medium text-text mb-2">
            Score <span className="text-text-muted">(optional)</span>
          </p>
          <div
            className="flex gap-1"
            onMouseLeave={() => setHoverScore(null)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hoverScore ?? (score === '' ? 0 : score))
              return (
                <button
                  key={star}
                  type="button"
                  disabled={loading}
                  onClick={() => setScore(score === star ? '' : star)}
                  onMouseEnter={() => setHoverScore(star)}
                  className={`text-3xl leading-none transition-colors disabled:cursor-not-allowed ${
                    filled ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {score === '' ? 'No score selected' : `${score} / 5`}
          </p>
        </div>

        {showRecommendation && (
          <div>
            <p className="block text-sm font-medium text-text mb-2">
              Team Recommendation <span className="text-text-muted">(optional)</span>
            </p>
            <div className="flex gap-6">
              {(['APPROVE', 'REJECT', ''] as const).map((value) => {
                const label = value === 'APPROVE' ? 'Recommend Approve' : value === 'REJECT' ? 'Recommend Reject' : 'No recommendation'
                return (
                  <label key={label} className="flex items-center gap-2 cursor-pointer text-sm text-text">
                    <input
                      type="radio"
                      name="recommendation"
                      value={value}
                      checked={recommendation === value}
                      disabled={loading}
                      onChange={() => setRecommendation(value)}
                      className="accent-primary"
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {actions.map((action) => (
            <button
              key={action.toStatus}
              type="button"
              disabled={loading}
              onClick={() => handleButtonClick(action.toStatus, action.requireComment)}
              className={action.className}
            >
              {loading ? 'Processing…' : action.label}
            </button>
          ))}
        </div>
      </form>
    </>
  )
}
