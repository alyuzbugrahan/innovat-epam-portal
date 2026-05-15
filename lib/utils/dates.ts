/**
 * Date utility functions for formatting and display.
 */

import { format, formatDistanceToNow, isValid } from 'date-fns'

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'MMM d, yyyy, h:mm a')
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (!isValid(d)) return '-'
  return formatDistanceToNow(d, { addSuffix: true })
}
