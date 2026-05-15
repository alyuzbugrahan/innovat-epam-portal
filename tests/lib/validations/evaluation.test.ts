/**
 * Tests for evaluation input validation schema.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * FR-017: System MUST allow admins to set final decision status to either
 *         `accepted` or `rejected` with a written comment.
 *
 * NOTE — Phase 5 supersedes Phase 1 pipeline:
 *   Phase 1 spec defines three statuses: UNDER_REVIEW, ACCEPTED, REJECTED.
 *   Phase 5 (Multi-Stage Review) extends this to a 5-stage pipeline:
 *   SUBMITTED → INITIAL_SCREENING → TECHNICAL_REVIEW → BUSINESS_REVIEW → ACCEPTED | REJECTED.
 *   The Phase 5 spec is authoritative; tests validate the actual implementation schema.
 *
 * Edge cases:
 * - Invalid toStatus value
 * - Score out of allowed range (1–5)
 * - Comment exceeding max length
 */

import { describe, it, expect } from 'vitest'
import { evaluateIdeaSchema } from '@/lib/validations/evaluation'

describe('evaluateIdeaSchema — FR-017: evaluation input validation', () => {
  it('accepts INITIAL_SCREENING transition (first pipeline step)', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'INITIAL_SCREENING' })
    expect(result.success).toBe(true)
  })

  it('accepts TECHNICAL_REVIEW transition', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'TECHNICAL_REVIEW' })
    expect(result.success).toBe(true)
  })

  it('accepts BUSINESS_REVIEW transition', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'BUSINESS_REVIEW' })
    expect(result.success).toBe(true)
  })

  it('accepts ACCEPTED with a comment — FR-017 final decision', () => {
    const result = evaluateIdeaSchema.safeParse({
      toStatus: 'ACCEPTED',
      comment: 'Strong technical merit and clear business impact.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts REJECTED with a comment — FR-017 final decision', () => {
    const result = evaluateIdeaSchema.safeParse({
      toStatus: 'REJECTED',
      comment: 'Does not align with current strategic priorities.',
    })
    expect(result.success).toBe(true)
  })

  it('defaults comment to empty string when omitted', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'INITIAL_SCREENING' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.comment).toBe('')
    }
  })

  it('rejects an invalid status value', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'UNDER_REVIEW' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing toStatus', () => {
    const result = evaluateIdeaSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects a comment longer than 2000 characters', () => {
    const result = evaluateIdeaSchema.safeParse({
      toStatus: 'ACCEPTED',
      comment: 'C'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid score in range 1–5', () => {
    for (const score of [1, 2, 3, 4, 5]) {
      const result = evaluateIdeaSchema.safeParse({ toStatus: 'TECHNICAL_REVIEW', score })
      expect(result.success).toBe(true)
    }
  })

  it('rejects a score of 0 (below minimum)', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'TECHNICAL_REVIEW', score: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects a score of 6 (above maximum)', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'TECHNICAL_REVIEW', score: 6 })
    expect(result.success).toBe(false)
  })

  it('accepts a null recommendation', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'BUSINESS_REVIEW', recommendation: null })
    expect(result.success).toBe(true)
  })

  it('accepts APPROVE recommendation', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'ACCEPTED', recommendation: 'APPROVE' })
    expect(result.success).toBe(true)
  })

  it('accepts REJECT recommendation', () => {
    const result = evaluateIdeaSchema.safeParse({ toStatus: 'REJECTED', recommendation: 'REJECT' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid recommendation value', () => {
    const result = evaluateIdeaSchema.safeParse({
      toStatus: 'ACCEPTED',
      recommendation: 'MAYBE',
    })
    expect(result.success).toBe(false)
  })
})
