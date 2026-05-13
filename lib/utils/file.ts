/**
 * File utility functions for upload handling.
 */

import { env } from './env'

// Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
}

export function isFileSizeValid(sizeBytes: number): boolean {
  const maxBytes = env.maxFileSizeMb * 1024 * 1024
  return sizeBytes > 0 && sizeBytes <= maxBytes
}

export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.substring(0, fileName.lastIndexOf('.')) || fileName
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot === -1 ? '' : fileName.substring(lastDot + 1).toLowerCase()
}

/**
 * Generate a safe storage filename using timestamp and random string.
 * This prevents directory traversal and naming conflicts.
 */
export function generateStorageFileName(originalFileName: string): string {
  const extension = getFileExtension(originalFileName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const safeName = `${timestamp}-${random}`
  return extension ? `${safeName}.${extension}` : safeName
}
