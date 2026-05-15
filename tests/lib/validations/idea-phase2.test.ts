/**
 * Phase 2 — Smart Submission Forms: Validation tests (RED phase).
 *
 * Spec: /specs/005-innovation-portal/phase-02-smart-forms/spec.md
 * FR-022: The system MUST persist categoryMetadata as structured data on the Idea entity.
 * FR-023: categoryMetadata MUST NOT exceed 500 characters.
 * FR-024: categoryMetadata MUST be optional (ideas with no category-specific field remain valid).
 *
 * These tests are written BEFORE the implementation (TDD — RED phase).
 * They fail until `categoryMetadata` is added to createIdeaSchema and updateDraftIdeaSchema.
 */

import { describe, it, expect } from 'vitest'
import { createIdeaSchema, updateDraftIdeaSchema } from '@/lib/validations/idea'

const VALID_IDEA = {
  title: 'AI-Driven Code Reviews',
  description: 'Use LLMs to automate pull request code review and flag common issues.',
  category: 'Technology',
}

describe('createIdeaSchema — Phase 2: categoryMetadata field (FR-022, FR-023, FR-024)', () => {
  // FR-024: field is optional — ideas without it must still be valid
  it('accepts valid input with no categoryMetadata — FR-024', () => {
    const result = createIdeaSchema.safeParse(VALID_IDEA)
    expect(result.success).toBe(true)
  })

  // FR-022: categoryMetadata is preserved in parsed output (not stripped as unknown)
  it('preserves categoryMetadata in parsed output when provided — FR-022', () => {
    const metadata = JSON.stringify({ techStack: 'React, Node.js' })
    const result = createIdeaSchema.safeParse({ ...VALID_IDEA, categoryMetadata: metadata })

    expect(result.success).toBe(true)
    if (result.success) {
      // RED: this will be undefined until categoryMetadata is added to the schema
      expect(result.data.categoryMetadata).toBe(metadata)
    }
  })

  // FR-023: 500 char limit enforced
  it('rejects categoryMetadata longer than 500 characters — FR-023', () => {
    const result = createIdeaSchema.safeParse({
      ...VALID_IDEA,
      categoryMetadata: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts categoryMetadata exactly at 500 characters — FR-023 boundary', () => {
    const result = createIdeaSchema.safeParse({
      ...VALID_IDEA,
      categoryMetadata: 'x'.repeat(500),
    })
    expect(result.success).toBe(true)
  })

  it('accepts null categoryMetadata (explicit null for ideas with no extra field)', () => {
    const result = createIdeaSchema.safeParse({ ...VALID_IDEA, categoryMetadata: null })
    expect(result.success).toBe(true)
  })

  it('defaults categoryMetadata to undefined/null when not provided', () => {
    const result = createIdeaSchema.safeParse(VALID_IDEA)
    expect(result.success).toBe(true)
    if (result.success) {
      // categoryMetadata should be absent or null/undefined — not a non-null garbage value
      expect(result.data.categoryMetadata ?? null).toBeNull()
    }
  })

  // Realistic metadata payloads per category
  it('accepts Technology category metadata with techStack key', () => {
    const meta = JSON.stringify({ techStack: 'React, Node.js, PostgreSQL' })
    const result = createIdeaSchema.safeParse({ ...VALID_IDEA, category: 'Technology', categoryMetadata: meta })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.categoryMetadata).toBe(meta)
    }
  })

  it('accepts Process Improvement metadata with affectedTeam key', () => {
    const meta = JSON.stringify({ affectedTeam: 'Engineering, DevOps' })
    const result = createIdeaSchema.safeParse({
      ...VALID_IDEA,
      category: 'Process Improvement',
      categoryMetadata: meta,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.categoryMetadata).toBe(meta)
    }
  })

  it('accepts Client Solution metadata with clientIndustry key', () => {
    const meta = JSON.stringify({ clientIndustry: 'Healthcare' })
    const result = createIdeaSchema.safeParse({
      ...VALID_IDEA,
      category: 'Client Solution',
      categoryMetadata: meta,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.categoryMetadata).toBe(meta)
    }
  })
})

describe('updateDraftIdeaSchema — Phase 2: categoryMetadata field', () => {
  const VALID_UPDATE = {
    title: 'Updated Title',
    description: 'Updated description that is long enough.',
    category: 'Technology',
    status: 'DRAFT' as const,
  }

  it('preserves categoryMetadata in update output when provided', () => {
    const meta = JSON.stringify({ techStack: 'Vue, Python' })
    const result = updateDraftIdeaSchema.safeParse({ ...VALID_UPDATE, categoryMetadata: meta })

    expect(result.success).toBe(true)
    if (result.success) {
      // RED: will be undefined until categoryMetadata is added to updateDraftIdeaSchema
      expect(result.data.categoryMetadata).toBe(meta)
    }
  })

  it('accepts update with no categoryMetadata', () => {
    const result = updateDraftIdeaSchema.safeParse(VALID_UPDATE)
    expect(result.success).toBe(true)
  })

  it('rejects categoryMetadata over 500 characters in updates', () => {
    const result = updateDraftIdeaSchema.safeParse({ ...VALID_UPDATE, categoryMetadata: 'y'.repeat(501) })
    expect(result.success).toBe(false)
  })
})
