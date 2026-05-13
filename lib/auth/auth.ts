/**
 * NextAuth v5 initialization.
 */

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
