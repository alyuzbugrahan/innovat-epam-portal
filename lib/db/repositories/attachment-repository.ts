/**
 * Attachment repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { IdeaAttachment } from '@prisma/client'

export class AttachmentRepository {
  async findByIdeaId(ideaId: string): Promise<IdeaAttachment[]> {
    return prisma.ideaAttachment.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(
    ideaId: string,
    originalName: string,
    storagePath: string,
    mimeType: string,
    sizeBytes: number
  ): Promise<IdeaAttachment> {
    return prisma.ideaAttachment.create({
      data: {
        ideaId,
        originalName,
        storagePath,
        mimeType,
        sizeBytes,
      },
    })
  }

  async deleteByIdeaId(ideaId: string): Promise<void> {
    await prisma.ideaAttachment.deleteMany({
      where: { ideaId },
    })
  }

  async deleteById(id: string): Promise<IdeaAttachment | null> {
    return prisma.ideaAttachment.delete({
      where: { id },
    }).catch(() => null)
  }
}

export const attachmentRepository = new AttachmentRepository()
