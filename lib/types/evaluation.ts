/**
 * Evaluation-related domain types.
 */

export type IdeaStatus =
  | 'SUBMITTED'
  | 'INITIAL_SCREENING'
  | 'TECHNICAL_REVIEW'
  | 'BUSINESS_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'

export interface Evaluation {
  id: string
  ideaId: string
  evaluatorId: string
  fromStatus: IdeaStatus
  toStatus: IdeaStatus
  comment: string
  createdAt: Date
}

export interface EvaluationRequest {
  toStatus: 'INITIAL_SCREENING' | 'TECHNICAL_REVIEW' | 'BUSINESS_REVIEW' | 'ACCEPTED' | 'REJECTED'
  comment: string
}
