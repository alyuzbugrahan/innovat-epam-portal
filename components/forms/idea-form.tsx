'use client'

import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'

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

interface IdeaFormInitialValues {
  title: string
  description: string
  category: string
  blindReview?: boolean
  metadata?: Record<string, string | undefined>
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
  const [error, setError] = useState('')
  const [category, setCategory] = useState(initialValues?.category || 'Other')
  const [blindReview, setBlindReview] = useState(initialValues?.blindReview ?? false)
  const [files, setFiles] = useState<File[]>([])
  const [submitAction, setSubmitAction] = useState<'draft' | 'submit'>('submit')
  const router = useRouter()

  function getErrorMessage(payload: any, fallback: string): string {
    const details = payload?.error?.details
    const firstDetail = details
      ? Object.values(details)
          .flat()
          .find((message) => typeof message === 'string' && message.trim().length > 0)
      : null

    return firstDetail || payload?.error?.message || fallback
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
          setError(uploadData?.error?.message || 'Idea saved but file upload failed')
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
        router.push('/ideas/drafts')
        return
      }

      router.push(`/ideas/${currentIdeaId}`)
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const extraField = CATEGORY_FIELDS[category]

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-error-light text-error rounded-lg text-sm">
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
            required
            disabled={loading}
            defaultValue={initialValues?.description || ''}
            placeholder="Detailed description of your idea (minimum 10 characters)"
            minLength={10}
            maxLength={5000}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark resize-none"
          />
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
          <div className="p-4 bg-primary-light rounded-lg border border-primary">
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
              className="w-full px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark"
            />
            <p className="text-xs text-text-muted mt-2">
              This field is required for the <strong>{category}</strong> category.
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

        <div className="flex gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleActionClick('draft')}
            className="flex-1 bg-warning-light text-white font-medium py-2 rounded-lg hover:bg-warning disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : mode === 'edit' ? 'Save Draft' : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleActionClick('submit')}
            className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : mode === 'edit' ? 'Submit' : 'Submit Idea'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => router.back()}
            className="flex-1 bg-secondary text-white font-medium py-2 rounded-lg hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
