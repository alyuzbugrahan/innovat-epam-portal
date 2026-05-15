/**
 * Tests for EvaluationService business logic.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * User Story 3 — Admin Evaluation Workflow (P1)
 *
 * Acceptance Scenarios:
 *   AC1: Admin opens ideas queue → can view all submitted ideas (queue tested via IdeaService).
 *   AC2: Admin opens idea detail → can view content and attachment (IdeaService).
 *   AC3: Admin evaluates an idea → can set ACCEPTED or REJECTED with written comment.
 *   AC4: Non-admin submitter attempting admin actions → access denied (guard/middleware level).
 *
 * FR-016: Allow admins to advance idea status (INITIAL_SCREENING is the first step).
 * FR-017: Allow admins to set final decision ACCEPTED or REJECTED with written comment.
 * FR-019: Enforce role-based authorization on all routes (guard/middleware level, not here).
 *
 * NOTE — Phase 5 supersedes Phase 1 pipeline:
 *   Phase 1 spec defines a 3-stage lifecycle:
 *     SUBMITTED → UNDER_REVIEW → ACCEPTED | REJECTED
 *   Phase 5 (Multi-Stage Review) extends this to 5 stages:
 *     SUBMITTED → INITIAL_SCREENING → TECHNICAL_REVIEW → BUSINESS_REVIEW → ACCEPTED | REJECTED
 *   The Phase 5 spec is authoritative; all tests validate the VALID_TRANSITIONS map
 *   in evaluation-service.ts which reflects the final phase specification.
 *
 * Edge cases:
 * - Skipping a pipeline stage (e.g. SUBMITTED → ACCEPTED) → INVALID_TRANSITION.
 * - Final decisions (ACCEPTED/REJECTED) without a comment → VALIDATION_ERROR.
 * - Transition from a terminal state (ACCEPTED/REJECTED → anything) → INVALID_TRANSITION.
 * - Idea not found → NOT_FOUND.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/repositories/idea-repository', () => ({
  ideaRepository: {
    findById: vi.fn(),
    updateStatus: vi.fn(),
    create: vi.fn(),
    findBySubmitterId: vi.fn(),
    findAll: vi.fn(),
    findDraftsBySubmitterId: vi.fn(),
    findBySubmitterWithFilters: vi.fn(),
    findAllWithFilters: vi.fn(),
  },
}))

vi.mock('@/lib/db/repositories/evaluation-repository', () => ({
  evaluationRepository: {
    create: vi.fn(),
    findByIdeaId: vi.fn(),
  },
}))

import { EvaluationService } from '@/lib/services/evaluation-service'
import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { evaluationRepository } from '@/lib/db/repositories/evaluation-repository'
import { ERROR_CODES } from '@/lib/utils/api-error'

const mockFindById = vi.mocked(ideaRepository.findById)
const mockUpdateStatus = vi.mocked(ideaRepository.updateStatus)
const mockEvalCreate = vi.mocked(evaluationRepository.create)

const IDEA_ID = 'idea-001'
const EVALUATOR_ID = 'admin-001'

function makeIdea(status: string) {
  return {
    id: IDEA_ID,
    title: 'Test Idea',
    description: 'Test description',
    category: 'Engineering',
    status,
    submitterId: 'submitter-001',
    blindReview: false,
    currentComment: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    evaluations: [],
    submitter: null,
  }
}

describe('EvaluationService.evaluateIdea() — valid transitions', () => {
  let service: EvaluationService

  beforeEach(() => {
    service = new EvaluationService()
    vi.clearAllMocks()
    mockUpdateStatus.mockResolvedValue(undefined as any)
    mockEvalCreate.mockResolvedValue({ id: 'eval-001' } as any)
  })

  // FR-016: First pipeline step — corresponds to spec's "move to under_review"
  it('transitions SUBMITTED → INITIAL_SCREENING (FR-016: move to review queue)', async () => {
    mockFindById.mockResolvedValue(makeIdea('SUBMITTED') as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'INITIAL_SCREENING', '')

    expect(result.ok).toBe(true)
    expect(mockEvalCreate).toHaveBeenCalledWith(
      IDEA_ID, EVALUATOR_ID, 'SUBMITTED', 'INITIAL_SCREENING', '', undefined, undefined
    )
    expect(mockUpdateStatus).toHaveBeenCalledWith(IDEA_ID, 'INITIAL_SCREENING', '', undefined)
  })

  it('transitions INITIAL_SCREENING → TECHNICAL_REVIEW', async () => {
    mockFindById.mockResolvedValue(makeIdea('INITIAL_SCREENING') as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'TECHNICAL_REVIEW', 'Passes initial check')

    expect(result.ok).toBe(true)
  })

  it('transitions TECHNICAL_REVIEW → BUSINESS_REVIEW', async () => {
    mockFindById.mockResolvedValue(makeIdea('TECHNICAL_REVIEW') as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'BUSINESS_REVIEW', 'Tech approved')

    expect(result.ok).toBe(true)
  })

  // FR-017 / US3 AC3: Final decision ACCEPTED with mandatory comment
  it('transitions BUSINESS_REVIEW → ACCEPTED with comment — US3 AC3, FR-017', async () => {
    mockFindById.mockResolvedValue(makeIdea('BUSINESS_REVIEW') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'ACCEPTED', 'Strong business case with clear ROI.'
    )

    expect(result.ok).toBe(true)
    expect(mockEvalCreate).toHaveBeenCalledWith(
      IDEA_ID, EVALUATOR_ID, 'BUSINESS_REVIEW', 'ACCEPTED',
      'Strong business case with clear ROI.', undefined, undefined
    )
    // reviewedAt should be set for terminal transitions
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      IDEA_ID, 'ACCEPTED', 'Strong business case with clear ROI.', expect.any(Date)
    )
  })

  // FR-017 / US3 AC3: Final decision REJECTED with mandatory comment
  it('transitions BUSINESS_REVIEW → REJECTED with comment — US3 AC3, FR-017', async () => {
    mockFindById.mockResolvedValue(makeIdea('BUSINESS_REVIEW') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'REJECTED', 'Does not align with current priorities.'
    )

    expect(result.ok).toBe(true)
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      IDEA_ID, 'REJECTED', 'Does not align with current priorities.', expect.any(Date)
    )
  })
})

describe('EvaluationService.evaluateIdea() — invalid / disallowed transitions', () => {
  let service: EvaluationService

  beforeEach(() => {
    service = new EvaluationService()
    vi.clearAllMocks()
  })

  // Spec edge case: skip SUBMITTED → ACCEPTED directly
  it('rejects SUBMITTED → ACCEPTED (skipping pipeline stages) — edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('SUBMITTED') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'ACCEPTED', 'Looks good to me'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TRANSITION)
    }
    expect(mockEvalCreate).not.toHaveBeenCalled()
    expect(mockUpdateStatus).not.toHaveBeenCalled()
  })

  // Spec edge case: skip SUBMITTED → REJECTED directly
  it('rejects SUBMITTED → REJECTED (skipping pipeline stages) — edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('SUBMITTED') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'REJECTED', 'Not relevant'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TRANSITION)
    }
  })

  // Terminal state: ACCEPTED → anything should be blocked
  it('rejects any transition from the terminal ACCEPTED state — edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('ACCEPTED') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'INITIAL_SCREENING', 'Re-opening'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TRANSITION)
    }
  })

  // Terminal state: REJECTED → anything should be blocked
  it('rejects any transition from the terminal REJECTED state — edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('REJECTED') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'BUSINESS_REVIEW', 'Let us try again'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TRANSITION)
    }
  })
})

describe('EvaluationService.evaluateIdea() — mandatory comment enforcement (FR-017)', () => {
  let service: EvaluationService

  beforeEach(() => {
    service = new EvaluationService()
    vi.clearAllMocks()
  })

  // Spec edge case: Admin submits ACCEPTED decision without comment
  it('rejects ACCEPTED transition with no comment — FR-017, edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('BUSINESS_REVIEW') as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'ACCEPTED', '')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    }
    expect(mockEvalCreate).not.toHaveBeenCalled()
  })

  // Spec edge case: Admin submits REJECTED decision without comment
  it('rejects REJECTED transition with no comment — FR-017, edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('BUSINESS_REVIEW') as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'REJECTED', '')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    }
  })

  // Spec edge case: Whitespace-only comment should be treated as empty
  it('rejects ACCEPTED transition with whitespace-only comment — edge case', async () => {
    mockFindById.mockResolvedValue(makeIdea('BUSINESS_REVIEW') as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'ACCEPTED', '   ')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    }
  })

  // Intermediate stages do NOT require a comment
  it('allows INITIAL_SCREENING transition without comment (not a final decision)', async () => {
    mockFindById.mockResolvedValue(makeIdea('SUBMITTED') as any)
    mockEvalCreate.mockResolvedValue({ id: 'eval-001' } as any)
    mockUpdateStatus.mockResolvedValue(undefined as any)

    const result = await service.evaluateIdea(IDEA_ID, EVALUATOR_ID, 'INITIAL_SCREENING', '')

    expect(result.ok).toBe(true)
  })
})

describe('EvaluationService.evaluateIdea() — idea not found', () => {
  let service: EvaluationService

  beforeEach(() => {
    service = new EvaluationService()
    vi.clearAllMocks()
  })

  it('returns NOT_FOUND when the idea does not exist — edge case', async () => {
    mockFindById.mockResolvedValue(null)

    const result = await service.evaluateIdea('nonexistent-id', EVALUATOR_ID, 'INITIAL_SCREENING', '')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(ERROR_CODES.NOT_FOUND)
    }
    expect(mockEvalCreate).not.toHaveBeenCalled()
  })
})

describe('EvaluationService.evaluateIdea() — score and recommendation (optional fields)', () => {
  let service: EvaluationService

  beforeEach(() => {
    service = new EvaluationService()
    vi.clearAllMocks()
    mockUpdateStatus.mockResolvedValue(undefined as any)
    mockEvalCreate.mockResolvedValue({ id: 'eval-001' } as any)
  })

  it('passes optional score and recommendation to the evaluation record', async () => {
    mockFindById.mockResolvedValue(makeIdea('TECHNICAL_REVIEW') as any)

    const result = await service.evaluateIdea(
      IDEA_ID, EVALUATOR_ID, 'BUSINESS_REVIEW', 'Great work', 4, 'APPROVE'
    )

    expect(result.ok).toBe(true)
    expect(mockEvalCreate).toHaveBeenCalledWith(
      IDEA_ID, EVALUATOR_ID, 'TECHNICAL_REVIEW', 'BUSINESS_REVIEW', 'Great work', 4, 'APPROVE'
    )
  })
})
