/**
 * Middleware for session-based route protection.
 */

import { auth } from '@/lib/auth/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return Response.redirect(new URL('/', req.nextUrl.origin))
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn || (req.auth?.user as any)?.role !== 'ADMIN') {
      return Response.redirect(new URL('/', req.nextUrl.origin))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
