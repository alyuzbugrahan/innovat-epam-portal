/**
 * Evaluation service for status transition validation and business logic.
 */

import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { evaluationRepository } from '@/lib/db/repositories/evaluation-repository'
import { Result, failure, success } from '@/lib/types/result'
import { ERROR_CODES } from '@/lib/utils/api-error'

const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['INITIAL_SCREENING'],
  INITIAL_SCREENING: ['TECHNICAL_REVIEW'],
  TECHNICAL_REVIEW: ['BUSINESS_REVIEW'],
  BUSINESS_REVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
}

export class EvaluationService {
  /**
   * Validate and apply status transition.
   * Enforces strict state machine rules.
   */
  async evaluateIdea(
    ideaId: string,
    evaluatorId: string,
    toStatus: string,
    comment: string
  ): Promise<Result<void>> {
    try {
      // Fetch current idea
      const idea = await ideaRepository.findById(ideaId)
      if (!idea) {
        return failure(
          ERROR_CODES.NOT_FOUND,
          'Idea not found'
        )
      }

      // Validate transition
      const allowedTransitions = VALID_TRANSITIONS[idea.status] || []
      if (!allowedTransitions.includes(toStatus)) {
        return failure(
          ERROR_CODES.INVALID_TRANSITION,
          `Cannot transition from ${idea.status} to ${toStatus}`
        )
      }

      // Comment is mandatory for final decisions
      if ((toStatus === 'ACCEPTED' || toStatus === 'REJECTED') && (!comment || comment.trim().length === 0)) {
        return failure(
          ERROR_CODES.VALIDATION_ERROR,
          'Comment is required for accepted and rejected decisions',
          { comment: ['Comment is required for final decisions'] }
        )
      }

      // Record evaluation
      const fromStatus = idea.status
      await evaluationRepository.create(
        ideaId,
        evaluatorId,
        fromStatus,
        toStatus,
        comment
      )

      // Update idea status
      const reviewedAt = (toStatus === 'ACCEPTED' || toStatus === 'REJECTED') ? new Date() : undefined
      await ideaRepository.updateStatus(ideaId, toStatus, comment, reviewedAt)

      return success(undefined)
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to evaluate idea'
      )
    }
  }
}

export const evaluationService = new EvaluationService()
