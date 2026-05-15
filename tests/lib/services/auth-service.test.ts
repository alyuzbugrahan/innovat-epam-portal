/**
 * Tests for AuthService business logic.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * User Story 1 — Employee Access and Identity (P1)
 *
 * Acceptance Scenarios:
 *   AC1: Given a visitor, When they provide valid name/email/password,
 *        Then an account is created and they can authenticate.
 *   AC2: Given a registered user, When they provide valid credentials,
 *        Then they are signed in.
 *   AC3: Logout is session-level (NextAuth) and is not tested at the service layer.
 *
 * FR-001: Register with name, email, password.
 * FR-002: Enforce unique email.
 * FR-003: Authenticate with email and password.
 * FR-004: Logout invalidates session (tested at middleware/integration level).
 *
 * Edge cases:
 * - Registration fails when email is already in use.
 * - Login fails for invalid credentials without revealing whether email exists.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/repositories/user-repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updateRole: vi.fn(),
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

import { AuthService } from '@/lib/services/auth-service'
import { userRepository } from '@/lib/db/repositories/user-repository'
import bcrypt from 'bcryptjs'
import { ERROR_CODES } from '@/lib/utils/api-error'

const mockFindByEmail = vi.mocked(userRepository.findByEmail)
const mockCreate = vi.mocked(userRepository.create)
const mockHash = vi.mocked(bcrypt.hash)
const mockCompare = vi.mocked(bcrypt.compare)

const MOCK_USER = {
  id: 'user-001',
  name: 'Alice Smith',
  email: 'alice@example.com',
  passwordHash: '$2a$10$hashed',
  role: 'SUBMITTER',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AuthService.register()', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthService()
    vi.clearAllMocks()
  })

  // AC1 / FR-001: Successful registration
  it('creates a new account and returns userId for valid input — US1 AC1, FR-001', async () => {
    mockFindByEmail.mockResolvedValue(null)
    mockHash.mockResolvedValue('$2a$10$hashed' as never)
    mockCreate.mockResolvedValue({ ...MOCK_USER, id: 'new-user-id' })

    const result = await service.register('alice@example.com', 'Alice Smith', 'Password1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.userId).toBe('new-user-id')
    }
    expect(mockFindByEmail).toHaveBeenCalledWith('alice@example.com')
    expect(mockHash).toHaveBeenCalledWith('Password1', 10)
    expect(mockCreate).toHaveBeenCalledWith('alice@example.com', 'Alice Smith', '$2a$10$hashed')
  })

  // FR-002 / Edge case: Duplicate email
  it('returns CONFLICT error when email is already registered — FR-002, edge case', async () => {
    mockFindByEmail.mockResolvedValue(MOCK_USER)

    const result = await service.register('alice@example.com', 'Alice Smith', 'Password1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.CONFLICT)
    }
    // Should not attempt to create a duplicate user
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns INTERNAL_ERROR if the database write fails', async () => {
    mockFindByEmail.mockResolvedValue(null)
    mockHash.mockResolvedValue('$2a$10$hashed' as never)
    mockCreate.mockRejectedValue(new Error('DB connection lost'))

    const result = await service.register('alice@example.com', 'Alice Smith', 'Password1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

describe('AuthService.verifyCredentials()', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthService()
    vi.clearAllMocks()
  })

  // AC2 / FR-003: Successful login
  it('returns user data for valid credentials — US1 AC2, FR-003', async () => {
    mockFindByEmail.mockResolvedValue(MOCK_USER)
    mockCompare.mockResolvedValue(true as never)

    const result = await service.verifyCredentials('alice@example.com', 'Password1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.userId).toBe(MOCK_USER.id)
      expect(result.data.email).toBe(MOCK_USER.email)
      expect(result.data.name).toBe(MOCK_USER.name)
      expect(result.data.role).toBe(MOCK_USER.role)
    }
  })

  // Edge case: Unknown email — must not reveal whether email exists (FR-003, spec edge case)
  it('returns UNAUTHORIZED for an unregistered email without revealing it does not exist — edge case', async () => {
    mockFindByEmail.mockResolvedValue(null)

    const result = await service.verifyCredentials('unknown@example.com', 'Password1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.UNAUTHORIZED)
      // Must not hint whether the email exists or not
      expect(result.error.message).toMatch(/invalid email or password/i)
    }
    // Password comparison must NOT be called when email is unknown (prevent timing attacks)
    expect(mockCompare).not.toHaveBeenCalled()
  })

  // Edge case: Wrong password
  it('returns UNAUTHORIZED for a wrong password — edge case', async () => {
    mockFindByEmail.mockResolvedValue(MOCK_USER)
    mockCompare.mockResolvedValue(false as never)

    const result = await service.verifyCredentials('alice@example.com', 'WrongPass1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.UNAUTHORIZED)
      // Same generic message as "email not found" — avoids email enumeration
      expect(result.error.message).toMatch(/invalid email or password/i)
    }
  })

  it('returns INTERNAL_ERROR if bcrypt.compare throws', async () => {
    mockFindByEmail.mockResolvedValue(MOCK_USER)
    mockCompare.mockRejectedValue(new Error('bcrypt failure'))

    const result = await service.verifyCredentials('alice@example.com', 'Password1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})
