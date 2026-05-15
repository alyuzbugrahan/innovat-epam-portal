/**
 * Phase 2 — Smart Submission Forms: IdeaService tests (RED phase).
 *
 * Spec: /specs/005-innovation-portal/phase-02-smart-forms/spec.md
 * FR-022: categoryMetadata MUST be stored as structured data on the Idea entity.
 * US1 AC6: When submitter submits with an extra field filled, the idea is saved
 *          with categoryMetadata stored as structured data.
 *
 * These tests are written BEFORE the implementation (TDD — RED phase).
 * They fail until IdeaService.createIdea() and updateDraftIdea() accept and
 * forward the categoryMetadata parameter.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/repositories/idea-repository', () => ({
  ideaRepository: {
    create: vi.fn(),
    findBySubmitterId: vi.fn(),
    findDraftsBySubmitterId: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findAllWithFilters: vi.fn(),
    findBySubmitterWithFilters: vi.fn(),
    updateStatus: vi.fn(),
    updateIdea: vi.fn(),
    deleteById: vi.fn(),
  },
}))

vi.mock('@/lib/db/repositories/attachment-repository', () => ({
  attachmentRepository: {
    findByIdeaId: vi.fn(),
    create: vi.fn(),
    deleteByIdeaId: vi.fn(),
    deleteById: vi.fn(),
  },
}))

import { IdeaService } from '@/lib/services/idea-service'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { ERROR_CODES } from '@/lib/utils/api-error'

const mockCreate = vi.mocked(ideaRepository.create)
const mockFindById = vi.mocked(ideaRepository.findById)
const mockUpdateIdea = vi.mocked(ideaRepository.updateIdea)

const SUBMITTER_ID = 'submitter-001'
const IDEA_ID = 'idea-001'

const MOCK_IDEA = {
  id: IDEA_ID,
  title: 'AI-Driven Code Reviews',
  description: 'Use LLMs to automate pull request code review.',
  category: 'Technology',
  categoryMetadata: null,
  status: 'SUBMITTED',
  submitterId: SUBMITTER_ID,
  blindReview: false,
  currentComment: null,
  reviewedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  attachments: [],
  evaluations: [],
  submitter: null,
}

describe('IdeaService.createIdea() — Phase 2: categoryMetadata (FR-022, US1 AC6)', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({ ...MOCK_IDEA } as any)
  })

  // US1 AC6: idea saved with structured categoryMetadata
  it('passes categoryMetadata to ideaRepository.create when provided — US1 AC6, FR-022', async () => {
    const metadata = JSON.stringify({ techStack: 'React, Node.js' })

    await service.createIdea(
      'AI-Driven Code Reviews',
      'Use LLMs to automate pull request code reviews.',
      'Technology',
      SUBMITTER_ID,
      false,
      'SUBMITTED',
      metadata  // 7th argument — RED: createIdea ignores this until it's added
    )

    // RED: mockCreate will be called with 6 args, not 7 including metadata
    expect(mockCreate).toHaveBeenCalledWith(
      'AI-Driven Code Reviews',
      'Use LLMs to automate pull request code reviews.',
      'Technology',
      SUBMITTER_ID,
      false,
      'SUBMITTED',
      metadata
    )
  })

  it('passes null categoryMetadata when not provided — FR-024', async () => {
    await service.createIdea('Title', 'Description here.', 'Other', SUBMITTER_ID)

    // When no metadata is provided, the repository should receive null/undefined
    expect(mockCreate).toHaveBeenCalledWith(
      'Title',
      'Description here.',
      'Other',
      SUBMITTER_ID,
      false,
      'SUBMITTED',
      undefined  // or null — no metadata for 'Other' category
    )
  })

  it('still returns the ideaId on success with metadata — FR-022', async () => {
    const metadata = JSON.stringify({ affectedTeam: 'Engineering' })
    mockCreate.mockResolvedValue({ ...MOCK_IDEA, id: 'idea-with-meta' } as any)

    const result = await service.createIdea(
      'Process Idea',
      'Description about a process.',
      'Process Improvement',
      SUBMITTER_ID,
      false,
      'SUBMITTED',
      metadata
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.ideaId).toBe('idea-with-meta')
    }
  })
})

describe('IdeaService.updateDraftIdea() — Phase 2: categoryMetadata (FR-022)', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
    mockFindById.mockResolvedValue({ ...MOCK_IDEA, status: 'DRAFT' } as any)
    mockUpdateIdea.mockResolvedValue({ ...MOCK_IDEA, status: 'DRAFT' } as any)
  })

  it('passes categoryMetadata to ideaRepository.updateIdea when provided', async () => {
    const metadata = JSON.stringify({ clientIndustry: 'Healthcare' })

    await service.updateDraftIdea(
      IDEA_ID,
      SUBMITTER_ID,
      'Updated Title',
      'Updated description here.',
      'Client Solution',
      false,
      'DRAFT',
      metadata  // 8th argument — RED: updateDraftIdea ignores this until added
    )

    // RED: mockUpdateIdea will not include categoryMetadata until implemented
    expect(mockUpdateIdea).toHaveBeenCalledWith(
      IDEA_ID,
      expect.objectContaining({ categoryMetadata: metadata })
    )
  })
})
