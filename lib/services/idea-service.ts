/**
 * Idea service for business logic and validation.
 */

import { ideaRepository } from '@/lib/db/repositories/idea-repository'
import { attachmentRepository } from '@/lib/db/repositories/attachment-repository'
import { Idea } from '@/lib/types/idea'
import { Result, failure, success } from '@/lib/types/result'
import { ERROR_CODES } from '@/lib/utils/api-error'

export class IdeaService {
  /**
   * Create a new idea for a submitter.
   */
  async createIdea(
    title: string,
    description: string,
    category: string,
    submitterId: string
  ): Promise<Result<{ ideaId: string }>> {
    try {
      const idea = await ideaRepository.create(title, description, category, submitterId)
      return success({ ideaId: idea.id })
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to create idea'
      )
    }
  }

  /**
   * Get all ideas submitted by a user.
   */
  async getSubmitterIdeas(submitterId: string): Promise<Result<Idea[]>> {
    try {
      const ideas = await ideaRepository.findBySubmitterId(submitterId)
      return success(ideas)
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to fetch ideas'
      )
    }
  }

  /**
   * Get idea detail by ID with ownership validation.
   */
  async getIdeaDetail(ideaId: string, userId: string, userRole: string): Promise<Result<Idea & { attachments: any[] }>> {
    try {
      const idea = await ideaRepository.findById(ideaId)
      if (!idea) {
        return failure(
          ERROR_CODES.NOT_FOUND,
          'Idea not found'
        )
      }

      // Submitters can only see their own ideas
      if (userRole === 'SUBMITTER' && idea.submitterId !== userId) {
        return failure(
          ERROR_CODES.FORBIDDEN,
          'You do not have permission to view this idea'
        )
      }

      return success(idea)
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to fetch idea'
      )
    }
  }

  /**
   * Get all ideas (admin only - checked in route handler).
   */
  async getAllIdeas(): Promise<Result<Idea[]>> {
    try {
      const ideas = await ideaRepository.findAll()
      return success(ideas)
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to fetch ideas'
      )
    }
  }

  /**
   * Attach a file to an idea.
   */
  async attachFile(
    ideaId: string,
    originalName: string,
    storagePath: string,
    mimeType: string,
    sizeBytes: number
  ): Promise<Result<void>> {
    try {
      // Check if idea exists
      const idea = await ideaRepository.findById(ideaId)
      if (!idea) {
        return failure(
          ERROR_CODES.NOT_FOUND,
          'Idea not found'
        )
      }

      // Create new attachment record for this idea.
      await attachmentRepository.create(ideaId, originalName, storagePath, mimeType, sizeBytes)
      return success(undefined)
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to attach file'
      )
    }
  }
}

export const ideaService = new IdeaService()
