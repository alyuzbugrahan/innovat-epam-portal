/**
 * Evaluation repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { Evaluation } from '@prisma/client'

export class EvaluationRepository {
  async findByIdeaId(ideaId: string) {
    return prisma.evaluation.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' }, // chronological — oldest first
      include: {
        evaluator: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async create(
    ideaId: string,
    evaluatorId: string,
    fromStatus: string,
    toStatus: string,
    comment: string,
    score?: number,
    recommendation?: string | null
  ): Promise<Evaluation> {
    return prisma.evaluation.create({
      data: {
        ideaId,
        evaluatorId,
        fromStatus,
        toStatus,
        comment,
        score,
        recommendation,
      },
    })
  }
}

export const evaluationRepository = new EvaluationRepository()
