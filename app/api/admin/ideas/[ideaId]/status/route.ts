/**
 * Admin idea status transition API route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth/guards'
import { evaluateIdeaSchema } from '@/lib/validations/evaluation'
import { evaluationService } from '@/lib/services/evaluation-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  const authResult = await checkAdminAuth()
  if (!authResult.ok) {
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: authResult.error.code === 'UNAUTHORIZED' ? 401 : 403 }
    )
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = evaluateIdeaSchema.safeParse(body)
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

    const { toStatus, comment, score } = validationResult.data
    const session = authResult.data
    const user = session.user as any

    // Evaluate idea
    const result = await evaluationService.evaluateIdea(
      params.ideaId,
      user.id,
      toStatus,
      comment,
      score
    )

    if (!result.ok) {
      const status =
        result.error.code === 'NOT_FOUND'
          ? 404
          : result.error.code === 'INTERNAL_ERROR'
            ? 500
            : 400
      return NextResponse.json(
        { ok: false, error: result.error },
        { status }
      )
    }

    return NextResponse.json(
      { ok: true, data: { message: 'Idea evaluated successfully' } },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to evaluate idea',
        },
      },
      { status: 500 }
    )
  }
}
