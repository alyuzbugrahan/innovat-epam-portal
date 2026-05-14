/**
 * Idea-related domain types.
 */

export type IdeaStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'INITIAL_SCREENING'
  | 'TECHNICAL_REVIEW'
  | 'BUSINESS_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'

export interface Idea {
  id: string
  title: string
  description: string
  category: string
  blindReview: boolean
  status: IdeaStatus
  submitterId: string
  currentComment: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface IdeaWithAttachment extends Idea {
  attachments: IdeaAttachment[]
}

export interface IdeaAttachment {
  id: string
  ideaId: string
  originalName: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  createdAt: Date
}

export interface CreateIdeaRequest {
  title: string
  description: string
  category: string
}

export interface IdeaSummary {
  id: string
  title: string
  category: string
  status: IdeaStatus
  createdAt: Date
  updatedAt: Date
}

export interface IdeaDetail extends IdeaSummary {
  description: string
  currentComment: string | null
  submitter: {
    id: string
    name: string
    email: string
  }
  attachments: IdeaAttachment[]
}
