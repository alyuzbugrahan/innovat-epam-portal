/**
 * Create new idea page.
 */

import IdeaForm from '@/components/forms/idea-form'
import NavBar from '@/components/layout/navbar'

export default function NewIdeaPage() {
  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text">Submit a new idea</h1>
          <p className="mt-1 text-sm text-text-muted">
            Share your innovation idea with the team for evaluation.
          </p>
        </div>
        <div className="bg-background rounded-lg border border-border p-6">
          <IdeaForm />
        </div>
      </main>
    </div>
  )
}
