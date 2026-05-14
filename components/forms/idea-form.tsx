'use client'

import { useState } from 'react'
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

export default function IdeaForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('Other')
  const [files, setFiles] = useState<File[]>([])
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    let title = formData.get('title') as string
    let description = formData.get('description') as string
    const selectedCategory = formData.get('category') as string

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
      // Create idea
      const createResponse = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category: selectedCategory,
        }),
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        const errorMsg = createData.error?.message || 'Failed to create idea'
        setError(errorMsg)
        return
      }

      const ideaId = createData.data.ideaId

      // Upload files if provided
      if (files.length > 0) {
        const fileFormData = new FormData()
        for (const file of files) {
          fileFormData.append('files', file)
        }

        const uploadResponse = await fetch(`/api/ideas/${ideaId}/upload`, {
          method: 'POST',
          body: fileFormData,
        })

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json().catch(() => null)
          setError(uploadData?.error?.message || 'Idea created but file upload failed')
          // Still redirect since idea was created
          setTimeout(() => router.push(`/ideas/${ideaId}`), 1500)
          return
        }
      }

      router.push(`/ideas/${ideaId}`)
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Idea'}
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
