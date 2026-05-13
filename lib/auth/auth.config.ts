/**
 * NextAuth v5 configuration.
 */

import { env } from '@/lib/utils/env'
import { authService } from '@/lib/services/auth-service'
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const result = await authService.verifyCredentials(
          credentials.email as string,
          credentials.password as string
        )

        if (!result.ok) {
          return null
        }

        return {
          id: result.data.userId,
          email: result.data.email,
          name: result.data.name,
          role: result.data.role,
        }
      },
    } as any,
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: env.authSecret,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
  },
} satisfies NextAuthConfig
