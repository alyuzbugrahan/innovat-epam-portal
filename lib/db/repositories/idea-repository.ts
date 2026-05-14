/**
 * Idea repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { Idea } from '@prisma/client'

export class IdeaRepository {
  async findById(id: string): Promise<(Idea & { attachments: any[]; submitter: any | null; evaluations: any[] }) | null> {
    return prisma.idea.findUnique({
      where: { id },
      include: {
        attachments: {
          orderBy: { createdAt: 'asc' },
        },
        evaluations: {
          orderBy: { createdAt: 'asc' },
          include: {
            evaluator: { select: { id: true, name: true, email: true } },
          },
        },
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

  async findDraftsBySubmitterId(submitterId: string): Promise<Idea[]> {
    return prisma.idea.findMany({
      where: {
        submitterId,
        status: 'DRAFT',
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findAll() {
    return prisma.idea.findMany({
      where: {
        status: { not: 'DRAFT' },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        submitter: { select: { id: true, name: true } },
      },
    })
  }

  async findAllWithFilters({
    search,
    status,
    category,
    sort,
  }: {
    search?: string
    status?: string
    category?: string
    sort?: 'newest' | 'oldest'
  } = {}) {
    return prisma.idea.findMany({
      where: {
        status: status ? status : { not: 'DRAFT' },
        ...(search ? { title: { contains: search } } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
      include: {
        submitter: { select: { id: true, name: true } },
      },
    })
  }

  async create(
    title: string,
    description: string,
    category: string,
    submitterId: string,
    blindReview: boolean = false,
    status: string = 'SUBMITTED'
  ): Promise<Idea> {
    return prisma.idea.create({
      data: {
        title,
        description,
        category,
        submitterId,
        blindReview,
        status,
      },
    })
  }

  async updateIdea(
    ideaId: string,
    data: {
      title: string
      description: string
      category: string
      blindReview?: boolean
      status: string
    }
  ): Promise<Idea> {
    return prisma.idea.update({
      where: { id: ideaId },
      data,
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
