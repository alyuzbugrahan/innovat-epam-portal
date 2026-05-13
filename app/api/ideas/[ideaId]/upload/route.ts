/**
 * File upload API route for ideas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth/guards'
import { uploadService } from '@/lib/services/upload-service'
import { ideaService } from '@/lib/services/idea-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  const authResult = await checkAuth()
  if (!authResult.ok) {
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: 401 }
    )
  }

  try {
    const session = authResult.data
    const user = session.user as any

    // Verify user owns the idea
    const idea = await ideaService.getIdeaDetail(params.ideaId, user.id, user.role)
    if (!idea.ok) {
      return NextResponse.json(
        { ok: false, error: idea.error },
        { status: 403 }
      )
    }

    // Get file from request
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file provided',
          },
        },
        { status: 400 }
      )
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate and save file
    const uploadResult = await uploadService.validateAndSaveFile(
      buffer,
      file.name,
      file.type
    )

    if (!uploadResult.ok) {
      return NextResponse.json(
        { ok: false, error: uploadResult.error },
        { status: 400 }
      )
    }

    // Attach to idea
    const attachResult = await ideaService.attachFile(
      params.ideaId,
      uploadResult.data.originalFileName,
      uploadResult.data.storagePath,
      uploadResult.data.mimeType,
      uploadResult.data.sizeBytes
    )

    if (!attachResult.ok) {
      return NextResponse.json(
        { ok: false, error: attachResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: true, data: { message: 'File uploaded successfully' } },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload file',
        },
      },
      { status: 500 }
    )
  }
}
