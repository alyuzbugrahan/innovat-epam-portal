/**
 * Idea detail API route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth/guards'
import { ideaService } from '@/lib/services/idea-service'
import { updateDraftIdeaSchema } from '@/lib/validations/idea'

export async function GET(
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

  const session = authResult.data
  const user = session.user as any

  // Get idea with ownership check
  const result = await ideaService.getIdeaDetail(params.ideaId, user.id, user.role)

  if (!result.ok) {
    const status = result.error.code === 'NOT_FOUND' ? 404 : 403
    return NextResponse.json(
      { ok: false, error: result.error },
      { status }
    )
  }

  return NextResponse.json(
    { ok: true, data: result.data },
    { status: 200 }
  )
}

export async function PATCH(
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
    const body = await request.json()
    const validationResult = updateDraftIdeaSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const { title, description, category, blindReview, status } = validationResult.data
    const session = authResult.data
    const user = session.user as any

    const result = await ideaService.updateDraftIdea(
      params.ideaId,
      user.id,
      title,
      description,
      category,
      blindReview,
      status
    )

    if (!result.ok) {
      const statusCode =
        result.error.code === 'NOT_FOUND'
          ? 404
          : result.error.code === 'FORBIDDEN'
            ? 403
            : result.error.code === 'CONFLICT'
              ? 409
              : 400

      return NextResponse.json(
        { ok: false, error: result.error },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { ok: true, data: result.data },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update draft',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  const authResult = await checkAuth()
  if (!authResult.ok) {
    return NextResponse.json({ ok: false, error: authResult.error }, { status: 401 })
  }

  const user = authResult.data.user as any

  const result = await ideaService.deleteIdea(params.ideaId, user.id)

  if (!result.ok) {
    const statusCode =
      result.error.code === 'NOT_FOUND'
        ? 404
        : result.error.code === 'FORBIDDEN'
          ? 403
          : result.error.code === 'CONFLICT'
            ? 400
            : 500

    return NextResponse.json({ ok: false, error: result.error }, { status: statusCode })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
