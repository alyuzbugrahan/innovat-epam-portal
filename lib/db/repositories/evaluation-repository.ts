/**
 * Evaluation repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { Evaluation } from '@prisma/client'

export class EvaluationRepository {
  async findByIdeaId(ideaId: string): Promise<Evaluation[]> {
    return prisma.evaluation.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(
    ideaId: string,
    evaluatorId: string,
    fromStatus: string,
    toStatus: string,
    comment: string,
    score?: number
  ): Promise<Evaluation> {
    return prisma.evaluation.create({
      data: {
        ideaId,
        evaluatorId,
        fromStatus,
        toStatus,
        comment,
        score,
      },
    })
  }
}

export const evaluationRepository = new EvaluationRepository()
