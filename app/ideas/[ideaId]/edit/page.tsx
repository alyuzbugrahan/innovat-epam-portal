/**
 * Draft edit page for submitters.
 */

import { requireAuth } from '@/lib/auth/guards'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { notFound } from 'next/navigation'
import IdeaForm from '@/components/forms/idea-form'
import Breadcrumb from '@/components/ui/breadcrumb'
import NavBar from '@/components/layout/navbar'

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

  const { description, metadata } = { description: idea.description, metadata: idea.categoryMetadata }

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'My Ideas', href: '/ideas' }, { label: 'Drafts', href: '/ideas/drafts' }, { label: 'Edit Draft' }]} />
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text">Edit draft</h1>
          <p className="mt-1 text-sm text-text-muted">Update your draft and submit when ready.</p>
        </div>
        <div className="bg-background rounded-lg border border-border p-6">
          <IdeaForm
            mode="edit"
            ideaId={idea.id}
            initialValues={{
              title: idea.title,
              description,
              category: idea.category,
              blindReview: idea.blindReview,
              categoryMetadata: metadata || undefined,
              existingAttachments: idea.attachments.map((a) => ({
                id: a.id,
                originalName: a.originalName,
                sizeBytes: a.sizeBytes,
              })),
            }}
          />
        </div>
      </main>
    </div>
  )
}
