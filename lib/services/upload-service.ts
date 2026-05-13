/**
 * File upload service for handling file uploads with validation.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { env } from '@/lib/utils/env'
import { isAllowedMimeType, isFileSizeValid, generateStorageFileName } from '@/lib/utils/file'
import { Result, failure, success } from '@/lib/types/result'
import { ERROR_CODES } from '@/lib/utils/api-error'

export class UploadService {
  async validateAndSaveFile(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string
  ): Promise<Result<{
    storagePath: string
    originalFileName: string
    mimeType: string
    sizeBytes: number
  }>> {
    // Validate MIME type
    if (!isAllowedMimeType(mimeType)) {
      return failure(
        ERROR_CODES.INVALID_FILE_TYPE,
        `File type '${mimeType}' is not allowed`
      )
    }

    // Validate file size
    const sizeBytes = fileBuffer.length
    if (!isFileSizeValid(sizeBytes)) {
      return failure(
        ERROR_CODES.FILE_TOO_LARGE,
        `File size ${sizeBytes} bytes exceeds maximum of ${env.maxFileSizeMb} MB`
      )
    }

    try {
      // Create uploads directory if it doesn't exist
      await fs.mkdir(env.uploadDir, { recursive: true })

      // Generate safe filename
      const safeFileName = generateStorageFileName(originalFileName)
      const storagePath = path.join(env.uploadDir, safeFileName)

      // Save file
      await fs.writeFile(storagePath, fileBuffer)

      return success({
        storagePath,
        originalFileName,
        mimeType,
        sizeBytes,
      })
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to save file'
      )
    }
  }

  async deleteFile(storagePath: string): Promise<Result<void>> {
    try {
      await fs.unlink(storagePath)
      return success(undefined)
    } catch (error) {
      return failure(
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to delete file'
      )
    }
  }
}

export const uploadService = new UploadService()
