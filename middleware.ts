/**
 * Middleware for session-based route protection.
 */

import { auth } from '@/lib/auth/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  // Public routes (no authentication required)
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/callback',
    '/',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  // If public route, allow access
  if (isPublicRoute) {
    // Redirect logged-in users away from auth pages (UI only, not API)
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      return Response.redirect(new URL('/', req.nextUrl.origin))
    }
    return
  }

  // Protected routes (authentication required)
  const protectedRoutes = ['/ideas', '/admin', '/api/ideas', '/api/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Redirect unauthenticated users to login
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.nextUrl.origin)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return Response.redirect(loginUrl)
    }

    // Check admin access for /admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if ((req.auth?.user as any)?.role !== 'ADMIN') {
        return Response.redirect(new URL('/', req.nextUrl.origin))
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
