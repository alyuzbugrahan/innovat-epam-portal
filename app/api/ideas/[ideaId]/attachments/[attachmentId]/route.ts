/**
 * DELETE /api/ideas/[ideaId]/attachments/[attachmentId]
 * Removes an attachment from a draft idea (submitter-only).
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth/guards'
import { attachmentRepository } from '@/lib/db/repositories/attachment-repository'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { promises as fs } from 'fs'
import path from 'path'
import { env } from '@/lib/utils/env'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { ideaId: string; attachmentId: string } }
) {
  const authResult = await checkAuth()
  if (!authResult.ok) {
    return NextResponse.json({ ok: false, error: authResult.error }, { status: 401 })
  }

  const user = authResult.data.user as any

  // Only allow deletion on ideas the user owns and that are still drafts
  const idea = await ideaRepository.findById(params.ideaId)
  if (!idea || idea.submitterId !== user.id) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Idea not found' } },
      { status: 404 }
    )
  }

  if (idea.status !== 'DRAFT') {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Can only remove attachments from drafts' } },
      { status: 403 }
    )
  }

  const attachment = idea.attachments.find((a) => a.id === params.attachmentId)
  if (!attachment) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Attachment not found' } },
      { status: 404 }
    )
  }

  // Delete DB record first
  await attachmentRepository.deleteById(params.attachmentId)

  // Best-effort delete from disk — don't fail if file is already gone
  try {
    const fullPath = path.join(process.cwd(), env.uploadDir, path.basename(attachment.storagePath))
    await fs.unlink(fullPath)
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true })
}
