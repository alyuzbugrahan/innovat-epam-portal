/**
 * Authentication service for business logic.
 */

import bcrypt from 'bcryptjs'
import { userRepository } from '@/lib/db/repositories/user-repository'
import { Result, failure, success } from '@/lib/types/result'
import { ERROR_CODES } from '@/lib/utils/api-error'

const BCRYPT_COST = 10

export class AuthService {
  /**
   * Register a new user with email and password.
   * Validates that email is not already taken.
   */
  async register(email: string, name: string, password: string): Promise<Result<{ userId: string }>> {
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      return failure(
        ERROR_CODES.CONFLICT,
        'This email is already registered'
      )
    }

    try {
      const passwordHash = await bcrypt.hash(password, BCRYPT_COST)
      const user = await userRepository.create(email, name, passwordHash)
      return success({ userId: user.id })
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to register user'
      )
    }
  }

  /**
   * Verify user credentials for login.
   * Returns user data if credentials are valid.
   */
  async verifyCredentials(email: string, password: string): Promise<Result<{
    userId: string
    name: string
    email: string
    role: string
  }>> {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      return failure(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid email or password'
      )
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
      if (!isPasswordValid) {
        return failure(
          ERROR_CODES.UNAUTHORIZED,
          'Invalid email or password'
        )
      }

      return success({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to verify credentials'
      )
    }
  }
}

export const authService = new AuthService()
