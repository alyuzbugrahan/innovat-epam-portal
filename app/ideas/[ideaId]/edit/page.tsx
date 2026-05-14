/**
 * Draft edit page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { parseIdeaDescription } from '@/lib/utils/idea-metadata'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import IdeaForm from '@/components/forms/idea-form'

export default async function EditDraftPage({
  params,
}: {
  params: { ideaId: string }
}) {
  const session = await requireAuth()
  const user = session?.user as any

  const idea = await ideaRepository.findById(params.ideaId)

  if (!idea || idea.submitterId !== user.id) {
    notFound()
  }

  if (idea.status !== 'DRAFT') {
    notFound()
  }

  const { description, metadata } = parseIdeaDescription(idea.description)

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-text">Edit Draft</h1>
            <Link href="/ideas/drafts" className="text-primary hover:text-primary-dark">
              Back to Drafts
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-2xl font-bold text-text mb-6">Update Draft Idea</h1>
          <IdeaForm
            mode="edit"
            ideaId={idea.id}
            initialValues={{
              title: idea.title,
              description,
              category: idea.category,
              blindReview: idea.blindReview,
              metadata: metadata || undefined,
            }}
          />
        </div>
      </main>
    </div>
  )
}
