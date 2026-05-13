/**
 * Logout route handler.
 */

import { signOut } from '@/lib/auth/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  await signOut({ redirectTo: '/login' })
}
