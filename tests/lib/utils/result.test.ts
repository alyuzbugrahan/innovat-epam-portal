/**
 * Tests for the Result type envelope helpers.
 *
 * Spec: /specs/005-innovation-portal/spec.md (cross-cutting utility)
 * These helpers are used by every service to communicate success/failure
 * in a type-safe way without throwing exceptions.
 */

import { describe, it, expect } from 'vitest'
import { success, failure, isSuccess, isFailure } from '@/lib/types/result'

describe('success()', () => {
  it('creates a result with ok=true and the given data', () => {
    const result = success({ userId: 'abc-123' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ userId: 'abc-123' })
    }
  })

  it('works with primitive data types', () => {
    const numResult = success(42)
    const strResult = success('hello')
    const boolResult = success(true)

    expect(numResult.ok).toBe(true)
    expect(strResult.ok).toBe(true)
    expect(boolResult.ok).toBe(true)
  })

  it('works with undefined (void result)', () => {
    const result = success(undefined)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBeUndefined()
    }
  })
})

describe('failure()', () => {
  it('creates a result with ok=false and an error object', () => {
    const result = failure('NOT_FOUND', 'Resource not found')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
      expect(result.error.message).toBe('Resource not found')
    }
  })

  it('includes optional details when provided', () => {
    const details = { email: ['Email is already taken'] }
    const result = failure('CONFLICT', 'Conflict error', details)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.details).toEqual(details)
    }
  })

  it('has undefined details when not provided', () => {
    const result = failure('VALIDATION_ERROR', 'Invalid input')
    if (!result.ok) {
      expect(result.error.details).toBeUndefined()
    }
  })
})

describe('isSuccess()', () => {
  it('returns true for a success result', () => {
    const result = success({ ideaId: 'x1' })
    expect(isSuccess(result)).toBe(true)
  })

  it('returns false for a failure result', () => {
    const result = failure('FORBIDDEN', 'Access denied')
    expect(isSuccess(result)).toBe(false)
  })
})

describe('isFailure()', () => {
  it('returns true for a failure result', () => {
    const result = failure('UNAUTHORIZED', 'Not logged in')
    expect(isFailure(result)).toBe(true)
  })

  it('returns false for a success result', () => {
    const result = success([])
    expect(isFailure(result)).toBe(false)
  })
})
