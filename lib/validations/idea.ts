/**
 * Idea validation schemas.
 */

import { z } from 'zod'

const draftStatusSchema = z.enum(['DRAFT', 'SUBMITTED'])

export const createIdeaSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(200, { message: 'Title must be at most 200 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(5000, { message: 'Description must be at most 5000 characters' }),
  category: z
    .string()
    .min(1, { message: 'Category is required' })
    .max(100, { message: 'Category must be at most 100 characters' }),
  blindReview: z.coerce.boolean().optional().default(false),
  status: draftStatusSchema.optional().default('SUBMITTED'),
})

export const updateDraftIdeaSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(200, { message: 'Title must be at most 200 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(5000, { message: 'Description must be at most 5000 characters' }),
  category: z
    .string()
    .min(1, { message: 'Category is required' })
    .max(100, { message: 'Category must be at most 100 characters' }),
  blindReview: z.coerce.boolean().optional(),
  status: draftStatusSchema,
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
export type UpdateDraftIdeaInput = z.infer<typeof updateDraftIdeaSchema>
