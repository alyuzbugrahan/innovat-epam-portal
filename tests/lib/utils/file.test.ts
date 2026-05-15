/**
 * Tests for file utility functions.
 *
 * Spec: /specs/005-innovation-portal/spec.md
 * FR-009: System MUST reject attachment uploads larger than 10 MB.
 * FR-010: System MUST validate attachment type against an allowed server-side whitelist.
 */

import { describe, it, expect, vi } from 'vitest'

// Mock env to avoid reading real environment variables at module load time.
vi.mock('@/lib/utils/env', () => ({
  env: {
    maxFileSizeMb: 10,
    uploadDir: './public/uploads',
    databaseUrl: 'file:./test.db',
    authSecret: 'test',
    nextAuthUrl: 'http://localhost:3000',
    nextAuthUrlInternal: 'http://localhost:3000',
    nodeEnv: 'test',
    isDevelopment: false,
    isProduction: false,
  },
}))

import {
  isAllowedMimeType,
  isFileSizeValid,
  generateStorageFileName,
  getFileExtension,
} from '@/lib/utils/file'

const TEN_MB = 10 * 1024 * 1024

// --- FR-010: MIME type whitelist ---

describe('isAllowedMimeType() — FR-010: server-side file type whitelist', () => {
  it('accepts allowed image MIME types', () => {
    expect(isAllowedMimeType('image/jpeg')).toBe(true)
    expect(isAllowedMimeType('image/png')).toBe(true)
    expect(isAllowedMimeType('image/gif')).toBe(true)
    expect(isAllowedMimeType('image/webp')).toBe(true)
  })

  it('accepts application/pdf', () => {
    expect(isAllowedMimeType('application/pdf')).toBe(true)
  })

  it('accepts text/plain', () => {
    expect(isAllowedMimeType('text/plain')).toBe(true)
  })

  it('accepts Office document MIME types', () => {
    expect(isAllowedMimeType('application/msword')).toBe(true)
    expect(
      isAllowedMimeType(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ).toBe(true)
    expect(isAllowedMimeType('application/vnd.ms-excel')).toBe(true)
    expect(
      isAllowedMimeType(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    ).toBe(true)
  })

  it('accepts video MIME types', () => {
    expect(isAllowedMimeType('video/mp4')).toBe(true)
    expect(isAllowedMimeType('video/quicktime')).toBe(true)
    expect(isAllowedMimeType('video/webm')).toBe(true)
  })

  it('accepts audio MIME types', () => {
    expect(isAllowedMimeType('audio/mpeg')).toBe(true)
    expect(isAllowedMimeType('audio/wav')).toBe(true)
  })

  it('rejects disallowed MIME types (e.g. executables, scripts)', () => {
    expect(isAllowedMimeType('application/x-executable')).toBe(false)
    expect(isAllowedMimeType('application/javascript')).toBe(false)
    expect(isAllowedMimeType('text/html')).toBe(false)
    expect(isAllowedMimeType('application/x-sh')).toBe(false)
  })

  it('rejects empty MIME type with no filename fallback', () => {
    expect(isAllowedMimeType('')).toBe(false)
    expect(isAllowedMimeType('', undefined)).toBe(false)
  })

  // Extension fallback: some browsers/devices send empty or generic MIME types
  it('accepts file with empty MIME type but allowed extension as fallback', () => {
    expect(isAllowedMimeType('', 'document.pdf')).toBe(true)
    expect(isAllowedMimeType('', 'photo.jpg')).toBe(true)
    expect(isAllowedMimeType('', 'spreadsheet.xlsx')).toBe(true)
  })

  it('rejects file with empty MIME type and disallowed extension', () => {
    expect(isAllowedMimeType('', 'script.exe')).toBe(false)
    expect(isAllowedMimeType('', 'malware.bat')).toBe(false)
    expect(isAllowedMimeType('', 'page.html')).toBe(false)
  })

  it('is case-insensitive for MIME types', () => {
    expect(isAllowedMimeType('IMAGE/JPEG')).toBe(true)
    expect(isAllowedMimeType('Application/PDF')).toBe(true)
  })
})

// --- FR-009: File size limit (10 MB max) ---

describe('isFileSizeValid() — FR-009: 10 MB size limit', () => {
  it('accepts a file exactly at the 10 MB limit', () => {
    expect(isFileSizeValid(TEN_MB)).toBe(true)
  })

  it('accepts a small file (1 byte)', () => {
    expect(isFileSizeValid(1)).toBe(true)
  })

  it('accepts a typical 1 MB file', () => {
    expect(isFileSizeValid(1024 * 1024)).toBe(true)
  })

  it('rejects a file 1 byte over the 10 MB limit', () => {
    expect(isFileSizeValid(TEN_MB + 1)).toBe(false)
  })

  it('rejects a file well above the limit (100 MB)', () => {
    expect(isFileSizeValid(100 * 1024 * 1024)).toBe(false)
  })

  it('rejects zero-byte files (empty upload)', () => {
    expect(isFileSizeValid(0)).toBe(false)
  })

  it('rejects negative byte counts', () => {
    expect(isFileSizeValid(-1)).toBe(false)
  })
})

// --- Filename utilities ---

describe('getFileExtension()', () => {
  it('extracts lowercase extension from a filename', () => {
    expect(getFileExtension('report.PDF')).toBe('pdf')
    expect(getFileExtension('photo.JPEG')).toBe('jpeg')
  })

  it('returns empty string for a filename with no extension', () => {
    expect(getFileExtension('README')).toBe('')
  })

  it('handles multiple dots — uses the last one', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
  })
})

describe('generateStorageFileName()', () => {
  it('returns a filename that preserves the original extension', () => {
    const result = generateStorageFileName('report.pdf')
    expect(result).toMatch(/\.pdf$/)
  })

  it('returns a filename that is different from the original (safe/randomised)', () => {
    const result = generateStorageFileName('photo.jpg')
    expect(result).not.toBe('photo.jpg')
  })

  it('returns a non-empty string for a file with no extension', () => {
    const result = generateStorageFileName('README')
    expect(result.length).toBeGreaterThan(0)
  })

  it('produces unique names for the same input on consecutive calls', () => {
    const a = generateStorageFileName('image.png')
    const b = generateStorageFileName('image.png')
    // Extremely unlikely to collide given timestamp + random suffix
    expect(a).not.toBe(b)
  })
})
