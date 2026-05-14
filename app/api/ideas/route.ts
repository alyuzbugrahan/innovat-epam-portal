/**
 * Ideas API routes for creating and listing ideas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth/guards'
import { createIdeaSchema } from '@/lib/validations/idea'
import { ideaService } from '@/lib/services/idea-service'

export async function GET(request: NextRequest) {
  const authResult = await checkAuth()
  if (!authResult.ok) {
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: 401 }
    )
  }

  const session = authResult.data
  const user = session.user as any

  // Submitters get only their own ideas
  const result = await ideaService.getSubmitterIdeas(user.id)

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { ok: true, data: result.data },
    { status: 200 }
  )
}

export async function POST(request: NextRequest) {
  const authResult = await checkAuth()
  if (!authResult.ok) {
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = createIdeaSchema.safeParse(body)
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

    const { title, description, category, status } = validationResult.data
    const session = authResult.data
    const user = session.user as any

    // Create idea
    const result = await ideaService.createIdea(title, description, category, user.id, status)

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create idea',
        },
      },
      { status: 500 }
    )
  }
}
