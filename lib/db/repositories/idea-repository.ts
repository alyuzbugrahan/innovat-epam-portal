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

  async findBySubmitterWithFilters({
    submitterId,
    search,
    status,
    category,
    sort,
  }: {
    submitterId: string
    search?: string
    status?: string
    category?: string
    sort?: 'newest' | 'oldest'
  }): Promise<Idea[]> {
    return prisma.idea.findMany({
      where: {
        submitterId,
        status: status ? status : { not: 'DRAFT' },
        ...(search ? { title: { contains: search } } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
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
    tab,
  }: {
    search?: string
    status?: string
    category?: string
    sort?: 'newest' | 'oldest'
    tab?: 'active' | 'closed' | 'all'
  } = {}) {
    const ACTIVE_STATUSES = ['SUBMITTED', 'INITIAL_SCREENING', 'TECHNICAL_REVIEW', 'BUSINESS_REVIEW']
    const CLOSED_STATUSES = ['ACCEPTED', 'REJECTED']

    let statusFilter: any
    if (status) {
      // Explicit status filter from dropdown takes precedence
      statusFilter = status
    } else if (tab === 'closed') {
      statusFilter = { in: CLOSED_STATUSES }
    } else if (tab === 'all') {
      statusFilter = { not: 'DRAFT' }
    } else {
      // 'active' is the default
      statusFilter = { in: ACTIVE_STATUSES }
    }

    return prisma.idea.findMany({
      where: {
        status: statusFilter,
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
    status: string = 'SUBMITTED',
    categoryMetadata?: string | null
  ): Promise<Idea> {
    return prisma.idea.create({
      data: {
        title,
        description,
        category,
        submitterId,
        blindReview,
        status,
        categoryMetadata: categoryMetadata ?? null,
      },
    })
  }

  async updateIdea(
    ideaId: string,
    data: {
      title: string
      description: string
      category: string
      categoryMetadata?: string | null
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

  async deleteById(ideaId: string): Promise<void> {
    await prisma.idea.delete({ where: { id: ideaId } })
  }
}

export const ideaRepository = new IdeaRepository()
