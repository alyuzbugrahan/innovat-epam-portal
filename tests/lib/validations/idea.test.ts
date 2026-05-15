/**
 * Tests for idea creation validation schema.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * FR-006: System MUST allow authenticated submitters to create ideas with title,
 *         description, and category.
 * FR-007: System MUST initialize each new idea with status `submitted`.
 *
 * Edge cases:
 * - Missing required fields (title, description, category)
 * - Field length boundary violations
 * - Default status is SUBMITTED when not specified
 */

import { describe, it, expect } from 'vitest'
import { createIdeaSchema, updateDraftIdeaSchema } from '@/lib/validations/idea'

// --- FR-006 + FR-007: createIdeaSchema ---

describe('createIdeaSchema — FR-006: idea submission input validation', () => {
  const validInput = {
    title: 'AI-Driven Code Reviews',
    description: 'Use LLMs to automate pull request code review and flag common issues.',
    category: 'Engineering',
  }

  it('accepts valid idea creation input', () => {
    const result = createIdeaSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('defaults status to SUBMITTED when not provided — FR-007', () => {
    const result = createIdeaSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('SUBMITTED')
    }
  })

  it('defaults blindReview to false when not provided', () => {
    const result = createIdeaSchema.safeParse(validInput)
    if (result.success) {
      expect(result.data.blindReview).toBe(false)
    }
  })

  it('accepts an explicit status of DRAFT for save-as-draft workflow', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, status: 'DRAFT' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('DRAFT')
    }
  })

  // Title validations
  it('rejects a title shorter than 3 characters', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, title: 'Hi' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title')
    }
  })

  it('rejects a title longer than 200 characters', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, title: 'T'.repeat(201) })
    expect(result.success).toBe(false)
  })

  // Description validations
  it('rejects a description shorter than 10 characters', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, description: 'Too short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description')
    }
  })

  it('rejects a description longer than 5000 characters', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, description: 'D'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  // Category validations
  it('rejects an empty category', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, category: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('category')
    }
  })

  it('rejects a category longer than 100 characters', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, category: 'C'.repeat(101) })
    expect(result.success).toBe(false)
  })

  // Missing required fields
  it('rejects missing title', () => {
    const { title: _t, ...withoutTitle } = validInput
    const result = createIdeaSchema.safeParse(withoutTitle)
    expect(result.success).toBe(false)
  })

  it('rejects missing description', () => {
    const { description: _d, ...withoutDesc } = validInput
    const result = createIdeaSchema.safeParse(withoutDesc)
    expect(result.success).toBe(false)
  })

  it('rejects missing category', () => {
    const { category: _c, ...withoutCategory } = validInput
    const result = createIdeaSchema.safeParse(withoutCategory)
    expect(result.success).toBe(false)
  })

  it('rejects an invalid status value', () => {
    const result = createIdeaSchema.safeParse({ ...validInput, status: 'APPROVED' })
    expect(result.success).toBe(false)
  })
})

// --- updateDraftIdeaSchema ---

describe('updateDraftIdeaSchema — draft update input validation', () => {
  const validInput = {
    title: 'Updated Title Here',
    description: 'Updated description that is long enough.',
    category: 'Product',
    status: 'DRAFT' as const,
  }

  it('accepts valid draft update input', () => {
    const result = updateDraftIdeaSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts status transition from DRAFT to SUBMITTED', () => {
    const result = updateDraftIdeaSchema.safeParse({ ...validInput, status: 'SUBMITTED' })
    expect(result.success).toBe(true)
  })

  it('rejects missing status field', () => {
    const { status: _s, ...withoutStatus } = validInput
    const result = updateDraftIdeaSchema.safeParse(withoutStatus)
    expect(result.success).toBe(false)
  })
})
