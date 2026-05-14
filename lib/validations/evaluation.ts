/**
 * Evaluation validation schemas.
 */

import { z } from 'zod'

export const evaluateIdeaSchema = z.object({
  toStatus: z.enum(['INITIAL_SCREENING', 'TECHNICAL_REVIEW', 'BUSINESS_REVIEW', 'ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Invalid status transition' }),
  }),
  comment: z
    .string()
    .max(2000, { message: 'Comment must be at most 2000 characters' })
    .optional()
    .default(''),
})

export type EvaluateIdeaInput = z.infer<typeof evaluateIdeaSchema>
