/**
 * Auth guards for server-side route protection and role enforcement.
 */

import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { Result, failure } from '@/lib/types/result'
import { ERROR_CODES } from '@/lib/utils/api-error'

/**
 * Require authenticated session. Redirects to login if not authenticated.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Require authenticated session with specific role.
 */
export async function requireRole(role: 'SUBMITTER' | 'ADMIN') {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  if ((session.user as any).role !== role) {
    redirect('/')
  }
  return session
}

/**
 * Get current session or return null.
 */
export async function getSession() {
  return await auth()
}

/**
 * Check if user is authenticated as API.
 */
export async function checkAuth(): Promise<Result<any>> {
  const session = await auth()
  if (!session) {
    return failure(
      ERROR_CODES.UNAUTHORIZED,
      'Authentication required'
    )
  }
  return { ok: true, data: session }
}

/**
 * Check if user is admin as API.
 */
export async function checkAdminAuth(): Promise<Result<any>> {
  const session = await auth()
  if (!session) {
    return failure(
      ERROR_CODES.UNAUTHORIZED,
      'Authentication required'
    )
  }
  if ((session.user as any).role !== 'ADMIN') {
    return failure(
      ERROR_CODES.FORBIDDEN,
      'Admin access required'
    )
  }
  return { ok: true, data: session }
}
