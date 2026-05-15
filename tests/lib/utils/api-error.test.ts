/**
 * Tests for api-error utilities.
 *
 * Covers:
 *   - ApiErrorException constructor and properties
 *   - parseApiError with ApiErrorException input
 *   - parseApiError with generic Error input
 *   - parseApiError with unknown (non-Error) input
 */

import { describe, it, expect } from 'vitest'
import { ApiErrorException, parseApiError, ERROR_CODES } from '@/lib/utils/api-error'

// ---------------------------------------------------------------------------
// ApiErrorException
// ---------------------------------------------------------------------------

describe('ApiErrorException', () => {
  it('stores code, message, and name correctly', () => {
    const err = new ApiErrorException('NOT_FOUND', 'Resource not found')

    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Resource not found')
    expect(err.name).toBe('ApiErrorException')
    expect(err instanceof Error).toBe(true)
  })

  it('stores optional details when provided', () => {
    const details = { field: ['must not be empty'] }
    const err = new ApiErrorException('VALIDATION_ERROR', 'Invalid input', details)

    expect(err.details).toEqual(details)
  })

  it('leaves details undefined when not provided', () => {
    const err = new ApiErrorException('FORBIDDEN', 'Access denied')

    expect(err.details).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// parseApiError()
// ---------------------------------------------------------------------------

describe('parseApiError()', () => {
  it('extracts code, message, and details from an ApiErrorException', () => {
    const details = { email: ['already taken'] }
    const err = new ApiErrorException('CONFLICT', 'Email conflict', details)

    const parsed = parseApiError(err)

    expect(parsed.code).toBe('CONFLICT')
    expect(parsed.message).toBe('Email conflict')
    expect(parsed.details).toEqual(details)
  })

  it('extracts code and message from an ApiErrorException without details', () => {
    const err = new ApiErrorException('NOT_FOUND', 'Idea not found')

    const parsed = parseApiError(err)

    expect(parsed.code).toBe('NOT_FOUND')
    expect(parsed.message).toBe('Idea not found')
    expect(parsed.details).toBeUndefined()
  })

  it('returns INTERNAL_ERROR for a generic Error', () => {
    const err = new Error('Something broke')

    const parsed = parseApiError(err)

    expect(parsed.code).toBe('INTERNAL_ERROR')
    expect(parsed.message).toBe('An unexpected error occurred')
  })

  it('returns UNKNOWN_ERROR for a non-Error value', () => {
    const parsed = parseApiError('a plain string error')

    expect(parsed.code).toBe('UNKNOWN_ERROR')
    expect(parsed.message).toBe('An unknown error occurred')
  })

  it('returns UNKNOWN_ERROR for null', () => {
    const parsed = parseApiError(null)

    expect(parsed.code).toBe('UNKNOWN_ERROR')
  })

  it('returns UNKNOWN_ERROR for a plain object', () => {
    const parsed = parseApiError({ code: 'CUSTOM', message: 'nope' })

    expect(parsed.code).toBe('UNKNOWN_ERROR')
  })
})

// ---------------------------------------------------------------------------
// ERROR_CODES constants
// ---------------------------------------------------------------------------

describe('ERROR_CODES', () => {
  it('exports the expected error code strings', () => {
    expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
    expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND')
    expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED')
    expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN')
    expect(ERROR_CODES.CONFLICT).toBe('CONFLICT')
    expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
    expect(ERROR_CODES.FILE_TOO_LARGE).toBe('FILE_TOO_LARGE')
    expect(ERROR_CODES.INVALID_FILE_TYPE).toBe('INVALID_FILE_TYPE')
    expect(ERROR_CODES.INVALID_TRANSITION).toBe('INVALID_TRANSITION')
  })
})
