/**
 * Tests for IdeaService business logic.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * User Story 2 — Submit and Track Ideas (P1)
 *
 * Acceptance Scenarios:
 *   AC1: Submitter creates idea with required fields → saved with status SUBMITTED.
 *   AC2: Submitter attaches a file → linked to idea (tested via attachFile).
 *   AC3: Submitter opens their ideas list → sees only their own ideas.
 *   AC4: Submitter opens own idea detail → full details including comment.
 *
 * FR-006: Allow authenticated submitters to create ideas with title, description, category.
 * FR-007: Initialize each new idea with status SUBMITTED.
 * FR-011: Allow submitters to view list of only their own ideas.
 * FR-012: Allow submitters to view full detail of their own ideas.
 * FR-013: Prevent submitters from accessing admin evaluation views and actions.
 * FR-014: Allow admins to view full detail for any submitted idea.
 *
 * Edge cases:
 * - Submitter attempts to open another submitter's idea → FORBIDDEN.
 * - Non-existent idea → NOT_FOUND.
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
import { attachmentRepository } from '@/lib/db/repositories/attachment-repository'
import { ERROR_CODES } from '@/lib/utils/api-error'

const mockCreate = vi.mocked(ideaRepository.create)
const mockFindBySubmitterId = vi.mocked(ideaRepository.findBySubmitterId)
const mockFindDraftsBySubmitterId = vi.mocked(ideaRepository.findDraftsBySubmitterId)
const mockFindById = vi.mocked(ideaRepository.findById)
const mockFindAll = vi.mocked(ideaRepository.findAll)
const mockUpdateIdea = vi.mocked(ideaRepository.updateIdea)
const mockDeleteById = vi.mocked(ideaRepository.deleteById)
const mockAttachmentCreate = vi.mocked(attachmentRepository.create)

const SUBMITTER_ID = 'submitter-001'
const OTHER_SUBMITTER_ID = 'submitter-002'
const ADMIN_ID = 'admin-001'
const IDEA_ID = 'idea-001'

const MOCK_IDEA = {
  id: IDEA_ID,
  title: 'AI-Driven Code Reviews',
  description: 'Use LLMs to automate pull request code reviews.',
  category: 'Engineering',
  status: 'SUBMITTED',
  submitterId: SUBMITTER_ID,
  blindReview: false,
  currentComment: null,
  reviewedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  attachments: [],
  evaluations: [],
  submitter: { id: SUBMITTER_ID, name: 'Alice', email: 'alice@example.com' },
}

describe('IdeaService.createIdea()', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  // AC1 / FR-006 / FR-007: Successful idea creation
  it('creates an idea and returns its id — US2 AC1, FR-006, FR-007', async () => {
    mockCreate.mockResolvedValue({ ...MOCK_IDEA, id: 'new-idea-id' } as any)

    const result = await service.createIdea(
      'AI-Driven Code Reviews',
      'Use LLMs to automate pull request code reviews.',
      'Engineering',
      SUBMITTER_ID
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.ideaId).toBe('new-idea-id')
    }
    expect(mockCreate).toHaveBeenCalledWith(
      'AI-Driven Code Reviews',
      'Use LLMs to automate pull request code reviews.',
      'Engineering',
      SUBMITTER_ID,
      false,
      'SUBMITTED',
      undefined
    )
  })

  it('defaults to status SUBMITTED and blindReview false — FR-007', async () => {
    mockCreate.mockResolvedValue({ ...MOCK_IDEA } as any)

    await service.createIdea('Title', 'Description here.', 'Category', SUBMITTER_ID)

    expect(mockCreate).toHaveBeenCalledWith(
      'Title',
      'Description here.',
      'Category',
      SUBMITTER_ID,
      false,       // blindReview default
      'SUBMITTED', // status default
      undefined    // categoryMetadata default
    )
  })

  it('allows creating a DRAFT idea', async () => {
    mockCreate.mockResolvedValue({ ...MOCK_IDEA, status: 'DRAFT', id: 'draft-id' } as any)

    const result = await service.createIdea('Draft Idea', 'Description here.', 'Innovation', SUBMITTER_ID, false, 'DRAFT')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.ideaId).toBe('draft-id')
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockCreate.mockRejectedValue(new Error('DB error'))

    const result = await service.createIdea('Title', 'Description here.', 'Category', SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

describe('IdeaService.getSubmitterIdeas()', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  // AC3 / FR-011: Submitter sees only their own ideas
  it('returns only the ideas belonging to the given submitter — US2 AC3, FR-011', async () => {
    const submitterIdeas = [MOCK_IDEA, { ...MOCK_IDEA, id: 'idea-002' }]
    mockFindBySubmitterId.mockResolvedValue(submitterIdeas as any)

    const result = await service.getSubmitterIdeas(SUBMITTER_ID)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(2)
      result.data.forEach((idea: any) => {
        expect(idea.submitterId).toBe(SUBMITTER_ID)
      })
    }
    expect(mockFindBySubmitterId).toHaveBeenCalledWith(SUBMITTER_ID)
  })

  it('returns an empty array when submitter has no ideas', async () => {
    mockFindBySubmitterId.mockResolvedValue([])

    const result = await service.getSubmitterIdeas(SUBMITTER_ID)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(0)
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindBySubmitterId.mockRejectedValue(new Error('DB error'))

    const result = await service.getSubmitterIdeas(SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

describe('IdeaService.getIdeaDetail()', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  // AC4 / FR-012: Submitter can view their own idea detail
  it('returns full idea detail to the submitter who owns it — US2 AC4, FR-012', async () => {
    mockFindById.mockResolvedValue(MOCK_IDEA as any)

    const result = await service.getIdeaDetail(IDEA_ID, SUBMITTER_ID, 'SUBMITTER')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe(IDEA_ID)
    }
  })

  // FR-013 / Edge case: Submitter blocked from another submitter's idea
  it('returns FORBIDDEN when a SUBMITTER tries to access another submitter\'s idea — FR-013, edge case', async () => {
    mockFindById.mockResolvedValue(MOCK_IDEA as any) // owned by SUBMITTER_ID

    const result = await service.getIdeaDetail(IDEA_ID, OTHER_SUBMITTER_ID, 'SUBMITTER')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.FORBIDDEN)
    }
  })

  // FR-014: Admin can view any idea's detail
  it('returns idea detail to an ADMIN regardless of ownership — FR-014', async () => {
    mockFindById.mockResolvedValue(MOCK_IDEA as any)

    const result = await service.getIdeaDetail(IDEA_ID, ADMIN_ID, 'ADMIN')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe(IDEA_ID)
    }
  })

  // Edge case: Non-existent idea
  it('returns NOT_FOUND for an idea that does not exist — edge case', async () => {
    mockFindById.mockResolvedValue(null)

    const result = await service.getIdeaDetail('nonexistent-id', SUBMITTER_ID, 'SUBMITTER')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.NOT_FOUND)
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindById.mockRejectedValue(new Error('DB error'))

    const result = await service.getIdeaDetail(IDEA_ID, SUBMITTER_ID, 'SUBMITTER')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

describe('IdeaService.getAllIdeas()', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  // FR-014: Admin can view all submitted ideas
  it('returns all ideas for admin consumption — FR-014', async () => {
    const allIdeas = [MOCK_IDEA, { ...MOCK_IDEA, id: 'idea-002', submitterId: OTHER_SUBMITTER_ID }]
    mockFindAll.mockResolvedValue(allIdeas as any)

    const result = await service.getAllIdeas()

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(2)
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindAll.mockRejectedValue(new Error('DB error'))

    const result = await service.getAllIdeas()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

// ---------------------------------------------------------------------------
// getSubmitterDrafts()
// ---------------------------------------------------------------------------

describe('IdeaService.getSubmitterDrafts()', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  it('returns draft ideas belonging to the submitter', async () => {
    const drafts = [
      { ...MOCK_IDEA, id: 'draft-1', status: 'DRAFT' },
      { ...MOCK_IDEA, id: 'draft-2', status: 'DRAFT' },
    ]
    mockFindDraftsBySubmitterId.mockResolvedValue(drafts as any)

    const result = await service.getSubmitterDrafts(SUBMITTER_ID)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(2)
    }
    expect(mockFindDraftsBySubmitterId).toHaveBeenCalledWith(SUBMITTER_ID)
  })

  it('returns an empty array when submitter has no drafts', async () => {
    mockFindDraftsBySubmitterId.mockResolvedValue([])

    const result = await service.getSubmitterDrafts(SUBMITTER_ID)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(0)
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindDraftsBySubmitterId.mockRejectedValue(new Error('DB error'))

    const result = await service.getSubmitterDrafts(SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

// ---------------------------------------------------------------------------
// attachFile()
// ---------------------------------------------------------------------------

describe('IdeaService.attachFile()', () => {
  let service: IdeaService

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  it('creates an attachment record when idea exists', async () => {
    mockFindById.mockResolvedValue(MOCK_IDEA as any)
    mockAttachmentCreate.mockResolvedValue(undefined as any)

    const result = await service.attachFile(
      IDEA_ID,
      'design.pdf',
      'uploads/design.pdf',
      'application/pdf',
      512000
    )

    expect(result.ok).toBe(true)
    expect(mockAttachmentCreate).toHaveBeenCalledWith(
      IDEA_ID,
      'design.pdf',
      'uploads/design.pdf',
      'application/pdf',
      512000
    )
  })

  it('returns NOT_FOUND when idea does not exist', async () => {
    mockFindById.mockResolvedValue(null)

    const result = await service.attachFile(
      'nonexistent-idea',
      'file.pdf',
      'uploads/file.pdf',
      'application/pdf',
      100
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.NOT_FOUND)
    }
    expect(mockAttachmentCreate).not.toHaveBeenCalled()
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindById.mockResolvedValue(MOCK_IDEA as any)
    mockAttachmentCreate.mockRejectedValue(new Error('DB error'))

    const result = await service.attachFile(
      IDEA_ID,
      'file.pdf',
      'uploads/file.pdf',
      'application/pdf',
      100
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

// ---------------------------------------------------------------------------
// updateDraftIdea()
// ---------------------------------------------------------------------------

describe('IdeaService.updateDraftIdea()', () => {
  let service: IdeaService
  const DRAFT_IDEA = { ...MOCK_IDEA, status: 'DRAFT' }

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  it('updates and returns the draft idea on success', async () => {
    const updated = { ...DRAFT_IDEA, title: 'Updated Title' }
    mockFindById.mockResolvedValue(DRAFT_IDEA as any)
    mockUpdateIdea.mockResolvedValue(updated as any)

    const result = await service.updateDraftIdea(
      IDEA_ID,
      SUBMITTER_ID,
      'Updated Title',
      'Updated description.',
      'Engineering',
      false,
      'DRAFT'
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.title).toBe('Updated Title')
    }
    expect(mockUpdateIdea).toHaveBeenCalledWith(
      IDEA_ID,
      expect.objectContaining({ title: 'Updated Title', status: 'DRAFT' })
    )
  })

  it('submits the draft (status SUBMITTED) when requested', async () => {
    const submitted = { ...DRAFT_IDEA, status: 'SUBMITTED' }
    mockFindById.mockResolvedValue(DRAFT_IDEA as any)
    mockUpdateIdea.mockResolvedValue(submitted as any)

    const result = await service.updateDraftIdea(
      IDEA_ID,
      SUBMITTER_ID,
      'Final Title',
      'Final description.',
      'Engineering',
      false,
      'SUBMITTED'
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('SUBMITTED')
    }
  })

  it('returns NOT_FOUND when idea does not exist', async () => {
    mockFindById.mockResolvedValue(null)

    const result = await service.updateDraftIdea(
      'nonexistent',
      SUBMITTER_ID,
      'Title',
      'Desc.',
      'Cat',
      false,
      'DRAFT'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.NOT_FOUND)
    }
  })

  it('returns FORBIDDEN when submitter does not own the idea', async () => {
    mockFindById.mockResolvedValue(DRAFT_IDEA as any)

    const result = await service.updateDraftIdea(
      IDEA_ID,
      OTHER_SUBMITTER_ID,
      'Title',
      'Desc.',
      'Cat',
      false,
      'DRAFT'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.FORBIDDEN)
    }
  })

  it('returns CONFLICT when idea is not in DRAFT status', async () => {
    mockFindById.mockResolvedValue({ ...MOCK_IDEA, status: 'SUBMITTED' } as any)

    const result = await service.updateDraftIdea(
      IDEA_ID,
      SUBMITTER_ID,
      'Title',
      'Desc.',
      'Cat',
      false,
      'DRAFT'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.CONFLICT)
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindById.mockRejectedValue(new Error('DB error'))

    const result = await service.updateDraftIdea(
      IDEA_ID,
      SUBMITTER_ID,
      'Title',
      'Desc.',
      'Cat',
      false,
      'DRAFT'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})

// ---------------------------------------------------------------------------
// deleteIdea()
// ---------------------------------------------------------------------------

describe('IdeaService.deleteIdea()', () => {
  let service: IdeaService
  const DRAFT_IDEA = { ...MOCK_IDEA, status: 'DRAFT' }

  beforeEach(() => {
    service = new IdeaService()
    vi.clearAllMocks()
  })

  it('deletes the draft idea on success', async () => {
    mockFindById.mockResolvedValue(DRAFT_IDEA as any)
    mockDeleteById.mockResolvedValue(undefined as any)

    const result = await service.deleteIdea(IDEA_ID, SUBMITTER_ID)

    expect(result.ok).toBe(true)
    expect(mockDeleteById).toHaveBeenCalledWith(IDEA_ID)
  })

  it('returns NOT_FOUND when idea does not exist', async () => {
    mockFindById.mockResolvedValue(null)

    const result = await service.deleteIdea('nonexistent', SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.NOT_FOUND)
    }
    expect(mockDeleteById).not.toHaveBeenCalled()
  })

  it('returns FORBIDDEN when submitter does not own the idea', async () => {
    mockFindById.mockResolvedValue(DRAFT_IDEA as any)

    const result = await service.deleteIdea(IDEA_ID, OTHER_SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.FORBIDDEN)
    }
  })

  it('returns CONFLICT when idea is not a draft', async () => {
    mockFindById.mockResolvedValue({ ...MOCK_IDEA, status: 'SUBMITTED' } as any)

    const result = await service.deleteIdea(IDEA_ID, SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.CONFLICT)
    }
  })

  it('returns INTERNAL_ERROR if repository throws', async () => {
    mockFindById.mockRejectedValue(new Error('DB error'))

    const result = await service.deleteIdea(IDEA_ID, SUBMITTER_ID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INTERNAL_ERROR)
    }
  })
})
