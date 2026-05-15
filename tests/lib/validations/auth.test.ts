/**
 * Tests for authentication validation schemas.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * FR-001: System MUST allow users to register with name, email, and password.
 * FR-002: System MUST enforce unique email per user account (schema-level format enforcement).
 * FR-003: System MUST authenticate registered users with email and password.
 *
 * Edge cases:
 * - Name too short / too long
 * - Invalid email format
 * - Password missing uppercase, lowercase, or digit
 * - Password below minimum length
 * - Empty login password
 */

import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '@/lib/validations/auth'

// --- FR-001: Registration schema ---

describe('registerSchema — FR-001: registration input validation', () => {
  const validInput = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'Password1',
  }

  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, name: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejects a name longer than 100 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, name: 'A'.repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejects an invalid email format — FR-002 format gate', () => {
    const result = registerSchema.safeParse({ ...validInput, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects an email longer than 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@x.com'
    const result = registerSchema.safeParse({ ...validInput, email: longEmail })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'Pass1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('rejects a password with no uppercase letter', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'password1' })
    expect(result.success).toBe(false)
  })

  it('rejects a password with no lowercase letter', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'PASSWORD1' })
    expect(result.success).toBe(false)
  })

  it('rejects a password with no number', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'PasswordOnly' })
    expect(result.success).toBe(false)
  })

  it('rejects missing name', () => {
    const { name: _n, ...withoutName } = validInput
    const result = registerSchema.safeParse(withoutName)
    expect(result.success).toBe(false)
  })

  it('rejects missing email', () => {
    const { email: _e, ...withoutEmail } = validInput
    const result = registerSchema.safeParse(withoutEmail)
    expect(result.success).toBe(false)
  })

  it('rejects missing password', () => {
    const { password: _p, ...withoutPassword } = validInput
    const result = registerSchema.safeParse(withoutPassword)
    expect(result.success).toBe(false)
  })
})

// --- FR-003: Login schema ---

describe('loginSchema — FR-003: login input validation', () => {
  const validInput = {
    email: 'alice@example.com',
    password: 'Password1',
  }

  it('accepts valid login input', () => {
    const result = loginSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ ...validInput, email: 'bad-email' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ ...validInput, password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing email', () => {
    const { email: _e, ...withoutEmail } = validInput
    const result = loginSchema.safeParse(withoutEmail)
    expect(result.success).toBe(false)
  })
})
