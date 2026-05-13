/**
 * Auth API route handler for user registration.
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/auth'
import { authService } from '@/lib/services/auth-service'
import { parseApiError } from '@/lib/utils/api-error'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
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

    const { email, name, password } = validationResult.data

    // Register user
    const result = await authService.register(email, name, password)

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.error.code === 'CONFLICT' ? 409 : 400 }
      )
    }

    return NextResponse.json(
      { ok: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    const apiError = parseApiError(error)
    return NextResponse.json(
      { ok: false, error: apiError },
      { status: 500 }
    )
  }
}
