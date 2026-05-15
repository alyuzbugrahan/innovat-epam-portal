/**
 * Admin ideas queue API route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth/guards'
import { ideaService } from '@/lib/services/idea-service'

export async function GET(request: NextRequest) {
  const authResult = await checkAdminAuth()
  if (!authResult.ok) {
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: authResult.error.code === 'UNAUTHORIZED' ? 401 : 403 }
    )
  }

  // Get all ideas for admin
  const result = await ideaService.getAllIdeas()

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
