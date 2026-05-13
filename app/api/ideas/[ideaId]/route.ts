/**
 * Idea detail API route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from '@/lib/auth/guards'
import { ideaService } from '@/lib/services/idea-service'

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
