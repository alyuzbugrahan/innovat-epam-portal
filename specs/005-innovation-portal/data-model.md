# Data Model: InnovatEPAM Portal Phase 1

## Entity Relationship Overview
- User (1) -> (many) Idea
- User (1) -> (many) Evaluation (as evaluator)
- Idea (1) -> (0..1) IdeaAttachment
- Idea (1) -> (many) Evaluation

## Enums

### UserRole
- SUBMITTER
- ADMIN

### IdeaStatus
- SUBMITTED
- UNDER_REVIEW
- ACCEPTED
- REJECTED

## Entities

### User
- id: string (cuid)
- name: string
- email: string (unique)
- passwordHash: string (bcrypt hash)
- role: UserRole
- createdAt: datetime
- updatedAt: datetime

Constraints:
- Email must be unique.
- Password is never stored plaintext.

### Idea
- id: string (cuid)
- title: string
- description: text
- category: string
- status: IdeaStatus (default SUBMITTED)
- submitterId: string (FK -> User)
- currentComment: string nullable
- reviewedAt: datetime nullable
- createdAt: datetime
- updatedAt: datetime

Constraints:
- submitterId must reference an existing user.
- title/description/category are required.
- Only submitter owner or admin can read detail.

### IdeaAttachment
- id: string (cuid)
- ideaId: string (unique FK -> Idea)
- originalName: string
- storagePath: string
- mimeType: string
- sizeBytes: integer
- createdAt: datetime

Constraints:
- At most one attachment per idea (`ideaId` unique).
- sizeBytes <= 10 * 1024 * 1024.
- mimeType/extension must pass whitelist validation.

### Evaluation
- id: string (cuid)
- ideaId: string (FK -> Idea)
- evaluatorId: string (FK -> User)
- fromStatus: IdeaStatus
- toStatus: IdeaStatus
- comment: string (required for accept/reject)
- createdAt: datetime

Constraints:
- evaluator must have ADMIN role.
- comment required for transitions to ACCEPTED/REJECTED.
- each transition event stored as immutable history.

## Lifecycle State Machine

Allowed transitions:
1. SUBMITTED -> UNDER_REVIEW
2. UNDER_REVIEW -> ACCEPTED
3. UNDER_REVIEW -> REJECTED

Disallowed transitions (examples):
- SUBMITTED -> ACCEPTED
- SUBMITTED -> REJECTED
- ACCEPTED -> any
- REJECTED -> any

Validation location:
- Enforced in `evaluation-service` before any repository mutation.

## Derived Read Models
- Submitter list view: idea id, title, category, status, updatedAt.
- Submitter detail view: full idea + attachment + latest comment.
- Admin queue view: all ideas ordered by createdAt desc with submitter identity.
- Admin detail view: full idea, attachment metadata/path, transition history.

## Data Retention (Phase 1)
- Keep all ideas/evaluations/attachments for MVP lifecycle.
- No archival or deletion workflow in scope.
