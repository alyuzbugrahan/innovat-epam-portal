/**
 * Evaluation validation schemas.
 */

import { z } from 'zod'

export const evaluateIdeaSchema = z.object({
  toStatus: z.enum(['UNDER_REVIEW', 'ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Invalid status transition' }),
  }),
  comment: z
    .string()
    .min(5, { message: 'Comment must be at least 5 characters' })
    .max(2000, { message: 'Comment must be at most 2000 characters' }),
})

export type EvaluateIdeaInput = z.infer<typeof evaluateIdeaSchema>
