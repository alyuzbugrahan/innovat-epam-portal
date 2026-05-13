/**
 * Create new idea page.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewIdeaPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string

    try {
      // Create idea
      const createResponse = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category }),
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        setError(createData.error?.message || 'Failed to create idea')
        return
      }

      const ideaId = createData.data.ideaId

      // Upload file if provided
      if (file) {
        const fileFormData = new FormData()
        fileFormData.append('file', file)

        const uploadResponse = await fetch(`/api/ideas/${ideaId}/upload`, {
          method: 'POST',
          body: fileFormData,
        })

        if (!uploadResponse.ok) {
          setError('Idea created but file upload failed')
          // Still redirect since idea was created
          setTimeout(() => router.push('/ideas'), 1500)
          return
        }
      }

      router.push('/ideas')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">InnovatEPAM Portal</h1>
            <Link href="/" className="text-primary hover:text-primary-dark">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-2xl font-bold text-text mb-6">Submit New Idea</h1>

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
              <input
                id="category"
                type="text"
                name="category"
                required
                disabled={loading}
                placeholder="e.g., Technology, Process, Product"
                maxLength={100}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark"
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-text mb-1">
                Attachment (Optional)
              </label>
              <input
                id="file"
                type="file"
                name="file"
                disabled={loading}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-dark"
              />
              <p className="text-xs text-text-muted mt-1">
                Max 10 MB. Supported: PDF, images, documents
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Idea'}
              </button>
              <Link
                href="/ideas"
                className="flex-1 bg-secondary text-white font-medium py-2 rounded-lg hover:bg-secondary-dark transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
