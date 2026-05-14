'use client'

import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/hooks/use-toast'
import { X } from 'lucide-react'

const CATEGORIES = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Process Improvement', label: 'Process Improvement' },
  { value: 'Client Solution', label: 'Client Solution' },
  { value: 'Other', label: 'Other' },
]

const CATEGORY_FIELDS: Record<string, { label: string; name: string; placeholder: string }> = {
  Technology: {
    label: 'Tech Stack',
    name: 'techStack',
    placeholder: 'e.g., React, Node.js, PostgreSQL',
  },
  'Process Improvement': {
    label: 'Affected Team',
    name: 'affectedTeam',
    placeholder: 'e.g., Engineering, Sales, Support',
  },
  'Client Solution': {
    label: 'Client Industry',
    name: 'clientIndustry',
    placeholder: 'e.g., Finance, Healthcare, Retail',
  },
}

interface ExistingAttachment {
  id: string
  originalName: string
  sizeBytes: number
}

interface IdeaFormInitialValues {
  title: string
  description: string
  category: string
  blindReview?: boolean
  metadata?: Record<string, string | undefined>
  existingAttachments?: ExistingAttachment[]
}

interface IdeaFormProps {
  mode?: 'create' | 'edit'
  ideaId?: string
  initialValues?: IdeaFormInitialValues
}

export default function IdeaForm({
  mode = 'create',
  ideaId,
  initialValues,
}: IdeaFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [descriptionLength, setDescriptionLength] = useState(initialValues?.description?.length ?? 0)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(initialValues?.category || 'Other')
  const [blindReview, setBlindReview] = useState(initialValues?.blindReview ?? false)
  const [files, setFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>(
    initialValues?.existingAttachments ?? []
  )
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [submitAction, setSubmitAction] = useState<'draft' | 'submit'>('submit')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const { showToast } = useToast()

  function getErrorMessage(payload: any, fallback: string): string {
    const details = payload?.error?.details
    const firstDetail = details
      ? Object.values(details)
          .flat()
          .find((message) => typeof message === 'string' && message.trim().length > 0)
      : null

    return firstDetail || payload?.error?.message || fallback
  }

  async function handleRemoveExisting(attachmentId: string) {
    if (!ideaId) return
    setRemovingId(attachmentId)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      } else {
        showToast('Failed to remove attachment', 'error')
      }
    } catch {
      showToast('Failed to remove attachment', 'error')
    } finally {
      setRemovingId(null)
    }
  }

  function handleCancelClick() {
    const titleVal = titleRef.current?.value?.trim() ?? ''
    const descriptionVal = descriptionRef.current?.value?.trim() ?? ''
    // Category always has a value (defaulted to 'Other'), so only
    // title and description are meaningful dirty signals.
    const isDirty = titleVal !== '' || descriptionVal !== ''
    if (!isDirty) {
      router.push('/ideas')
    } else {
      setIsCancelDialogOpen(true)
    }
  }

  function handleActionClick(action: 'draft' | 'submit') {
    flushSync(() => {
      setSubmitAction(action)
    })
    formRef.current?.requestSubmit()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const targetStatus = submitAction === 'draft' ? 'DRAFT' : 'SUBMITTED'

    const title = formData.get('title') as string
    let description = formData.get('description') as string
    const selectedCategory = formData.get('category') as string
    const shouldBlindReview = formData.get('blindReview') === 'on'

    // Add extra field metadata to description if it exists
    const extraFieldName = Object.keys(CATEGORY_FIELDS).find(
      (key) => key === selectedCategory
    )
    if (extraFieldName) {
      const fieldConfig = CATEGORY_FIELDS[extraFieldName]
      const extraFieldValue = formData.get(fieldConfig.name) as string

      if (extraFieldValue?.trim()) {
        // Append metadata as JSON to the description
        description += `\n\n---METADATA---\n${JSON.stringify({
          [fieldConfig.name]: extraFieldValue,
        })}`
      }
    }

    try {
      let currentIdeaId = ideaId

      if (mode === 'edit') {
        if (!currentIdeaId) {
          setError('Missing draft identifier')
          return
        }

        const updateResponse = await fetch(`/api/ideas/${currentIdeaId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category: selectedCategory,
            blindReview: shouldBlindReview,
            status: targetStatus,
          }),
        })

        const updateData = await updateResponse.json()

        if (!updateResponse.ok) {
          const errorMsg = getErrorMessage(updateData, 'Failed to update draft')
          setError(errorMsg)
          showToast(errorMsg, 'error')
          return
        }
      } else {
        const createResponse = await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category: selectedCategory,
            blindReview: shouldBlindReview,
            status: targetStatus,
          }),
        })

        const createData = await createResponse.json()

        if (!createResponse.ok) {
          const errorMsg = getErrorMessage(createData, 'Failed to create idea')
          setError(errorMsg)
          showToast(errorMsg, 'error')
          return
        }

        currentIdeaId = createData.data.ideaId
      }

      if (!currentIdeaId) {
        setError('Failed to determine idea identifier')
        return
      }

      // Upload files if provided
      if (files.length > 0) {
        const fileFormData = new FormData()
        for (const file of files) {
          fileFormData.append('files', file)
        }

        const uploadResponse = await fetch(`/api/ideas/${currentIdeaId}/upload`, {
          method: 'POST',
          body: fileFormData,
        })

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json().catch(() => null)
          const uploadErr = uploadData?.error?.message || 'Idea saved but file upload failed'
          setError(uploadErr)
          showToast(uploadErr, 'error')
          // Still redirect since idea save succeeded
          setTimeout(() => {
            if (targetStatus === 'DRAFT') {
              router.push('/ideas/drafts')
              return
            }
            router.push(`/ideas/${currentIdeaId}`)
          }, 1500)
          return
        }
      }

      if (targetStatus === 'DRAFT') {
        showToast('Draft saved', 'success')
        router.push('/ideas/drafts')
        return
      }

      showToast('Idea submitted successfully', 'success')
      router.push(`/ideas/${currentIdeaId}`)
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const extraField = CATEGORY_FIELDS[category]

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text mb-1">
            Title <span className="text-error">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            ref={titleRef}
            required
            disabled={loading}
            defaultValue={initialValues?.title || ''}
            placeholder="Brief title of your idea"
            minLength={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text mb-1">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            ref={descriptionRef}
            required
            disabled={loading}
            defaultValue={initialValues?.description || ''}
            placeholder="Detailed description of your idea (minimum 10 characters)"
            minLength={10}
            maxLength={5000}
            rows={6}
            onChange={(e) => setDescriptionLength(e.target.value.length)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark resize-none"
          />
          <p className={`text-xs text-right mt-1 ${descriptionLength > 1800 ? 'text-error' : 'text-text-muted'}`}>
            {descriptionLength} / 5000
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-text mb-1">
            Category <span className="text-error">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            disabled={loading}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark bg-background text-text"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {extraField && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label
              htmlFor={extraField.name}
              className="block text-sm font-medium text-text mb-1"
            >
              {extraField.label} <span className="text-error">*</span>
            </label>
            <input
              id={extraField.name}
              type="text"
              name={extraField.name}
              required
              disabled={loading}
              defaultValue={initialValues?.metadata?.[extraField.name] || ''}
              placeholder={extraField.placeholder}
              maxLength={200}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-surface-dark"
            />
            <p className="text-xs text-blue-600 mt-2">
              Required for the <strong>{category}</strong> category.
            </p>
          </div>
        )}

        <div>
          <label className="flex items-start gap-3 p-4 bg-surface-dark rounded-lg border border-border cursor-pointer">
            <input
              id="blindReview"
              type="checkbox"
              name="blindReview"
              checked={blindReview}
              disabled={loading}
              onChange={(e) => setBlindReview(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed"
            />
            <span>
              <span className="block text-sm font-medium text-text">Enable blind review</span>
              <span className="block text-xs text-text-muted mt-1">
                Hide your identity from admins during review until a final decision is made.
              </span>
            </span>
          </label>
        </div>

        <div>
          <label htmlFor="files" className="block text-sm font-medium text-text mb-1">
            Attachments (Optional)
          </label>
          <input
            id="files"
            type="file"
            name="files"
            multiple
            disabled={loading}
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark"
          />
          <p className="text-xs text-text-muted mt-1">
            Max 10 MB per file. Supported: PDF, images, documents
          </p>
          {existingAttachments.length > 0 && (
            <ul className="mt-3 space-y-1">
              {existingAttachments.map((att) => (
                <li key={att.id} className="flex items-center justify-between text-xs px-3 py-2 bg-surface rounded-lg border border-border">
                  <span className="text-text truncate">{att.originalName}</span>
                  <span className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-text-muted">{(att.sizeBytes / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      disabled={removingId === att.id || loading}
                      onClick={() => handleRemoveExisting(att.id)}
                      className="text-error hover:underline disabled:opacity-50"
                    >
                      {removingId === att.id ? 'Removing…' : 'Remove'}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              {files.map((file) => (
                <li key={`${file.name}-${file.lastModified}`}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleActionClick('submit')}
            className="flex-1 bg-primary text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting…' : mode === 'edit' ? 'Submit' : 'Submit idea'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleActionClick('draft')}
            className="px-4 py-2 rounded-lg text-sm border border-border text-text-muted font-medium hover:text-text hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving…' : mode === 'edit' ? 'Save draft' : 'Save as draft'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleCancelClick}
            className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Cancel confirmation dialog */}
      {isCancelDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCancelDialogOpen(false) }}
        >
          <div className="relative w-full max-w-sm mx-4 bg-background rounded-xl border border-border shadow-lg p-6">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <h2 className="text-base font-semibold text-text mb-2">Leave without submitting?</h2>
            <p className="text-sm text-text-muted mb-6">
              Your idea has not been submitted yet. Would you like to save it as a draft before leaving?
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setIsCancelDialogOpen(false)
                  handleActionClick('draft')
                }}
                className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => router.push('/ideas')}
                className="w-full py-2 px-4 rounded-lg text-sm border border-red-300 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Discard &amp; Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
