/**
 * API error handling utilities for consistent error responses.
 */

import { ApiError } from '@/lib/types/result'

export class ApiErrorException extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiErrorException'
  }
}

export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiErrorException) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
  }
}

// Common API error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  INVALID_TRANSITION: 'INVALID_TRANSITION',
} as const
