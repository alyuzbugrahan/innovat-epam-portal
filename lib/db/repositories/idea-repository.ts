/**
 * Idea repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { Idea } from '@prisma/client'

export class IdeaRepository {
  async findById(id: string): Promise<(Idea & { attachment: any | null; submitter: any | null }) | null> {
    return prisma.idea.findUnique({
      where: { id },
      include: {
        attachment: true,
        submitter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findBySubmitterId(submitterId: string): Promise<Idea[]> {
    return prisma.idea.findMany({
      where: { submitterId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAll(): Promise<Idea[]> {
    return prisma.idea.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(
    title: string,
    description: string,
    category: string,
    submitterId: string
  ): Promise<Idea> {
    return prisma.idea.create({
      data: {
        title,
        description,
        category,
        submitterId,
        status: 'SUBMITTED',
      },
    })
  }

  async updateStatus(
    ideaId: string,
    status: string,
    comment?: string | null,
    reviewedAt?: Date
  ): Promise<Idea> {
    return prisma.idea.update({
      where: { id: ideaId },
      data: {
        status,
        currentComment: comment,
        reviewedAt,
      },
    })
  }
}

export const ideaRepository = new IdeaRepository()
