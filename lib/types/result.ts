/**
 * Typed result envelope for all API responses.
 * Ensures consistent error and success handling across the application.
 */

export type Result<T> = 
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export function success<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function failure<T>(code: string, message: string, details?: Record<string, string[]>): Result<T> {
  return { 
    ok: false, 
    error: { code, message, details } 
  }
}

export function isSuccess<T>(result: Result<T>): result is { ok: true; data: T } {
  return result.ok === true
}

export function isFailure<T>(result: Result<T>): result is { ok: false; error: ApiError } {
  return result.ok === false
}
