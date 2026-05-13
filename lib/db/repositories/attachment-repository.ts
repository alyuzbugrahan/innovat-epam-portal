/**
 * Attachment repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { IdeaAttachment } from '@prisma/client'

export class AttachmentRepository {
  async findByIdeaId(ideaId: string): Promise<IdeaAttachment | null> {
    return prisma.ideaAttachment.findUnique({
      where: { ideaId },
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

  async delete(ideaId: string): Promise<void> {
    await prisma.ideaAttachment.delete({
      where: { ideaId },
    })
  }
}

export const attachmentRepository = new AttachmentRepository()
