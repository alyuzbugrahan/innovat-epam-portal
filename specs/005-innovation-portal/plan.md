# Implementation Plan: InnovatEPAM Portal Phase 1 Core Portal

**Branch**: `005-innovation-portal` | **Date**: 2026-05-13 | **Spec**: `/specs/005-innovation-portal/spec.md`

**Input**: Feature specification from `/specs/005-innovation-portal/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build Phase 1 of InnovatEPAM Portal as a Next.js full-stack App Router application where authenticated employees submit innovation ideas and admins evaluate them. The implementation uses server-side role enforcement, repository-based data access, strict status transition rules (`submitted` -> `under_review` -> `accepted|rejected`), mandatory evaluation comments on final decisions, and local file upload storage for a single attachment per idea.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.6.3 (strict mode enabled)

**Primary Dependencies**:
- next@14.2.32
- react@18.3.1
- react-dom@18.3.1
- tailwindcss@3.4.17
- shadcn/ui (CLI-generated component layer on Radix primitives)
- prisma@5.22.0
- @prisma/client@5.22.0
- next-auth@5.0.0-beta.25
- date-fns@3.6.0
- bcrypt@5.1.1
- zod@3.23.8 (minimal validation helper, justified for typed form/server-action validation)

**Storage**:
- SQLite database file for development persistence
- Local filesystem uploads under `public/uploads` (server-side write path, static serving path)

**Testing**: Manual testing only (no automated unit/integration/e2e required for this phase)

**Target Platform**: Web (modern desktop and mobile browsers, minimum supported width 375px)

**Project Type**: Single Next.js web application (full-stack App Router)

**Performance Goals**:
- Registration/login/idea submission interactions complete within 10-15s in normal internal network conditions
- Idea list/detail pages render perceived-interactive within 2s for MVP scale (<100 ideas)
- File upload failures return actionable feedback in a single round-trip

**Constraints**:
- Repository pattern required; no direct DB calls from route handlers/pages/server components
- Strict lifecycle transitions only: `submitted` -> `under_review` -> `accepted|rejected`; skip transitions disallowed
- Admin decision comments mandatory for `accepted` and `rejected`
- Single attachment only, 10 MB max, whitelist file validation server-side
- Tailwind theme tokens only for colors; no hardcoded hex in components
- All user data read/write routes require authenticated session
- Role checks enforced server-side

**Scale/Scope**:
- Internal MVP with fewer than 100 ideas
- Phase 1 excludes duplicate detection, drafts, multi-stage review, blind review, scoring, search/filter, pagination, email notifications

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Clean architecture and type safety gates are satisfied by TypeScript strict mode, domain services, and repository layer design.
- PASS: UI/UX and accessibility gates are included in component and page contracts (responsive layouts, loading/error/empty states, keyboard-friendly controls).
- PASS: Approved stack gate is met with Next.js App Router, Tailwind + shadcn/ui, Prisma + SQLite, NextAuth.js v5, and minimal utility set.
- PASS: Security gates are met by server-side session checks, RBAC enforcement, bcrypt password hashing plan, 10 MB upload cap, whitelist file validation.
- PASS: Delivery/testing gates are met by manual critical-path test plan and phase-end committable checkpoints.
- PASS: Optional AI differentiator is explicitly deferred until after Phase 1 stability.

Re-check after Phase 1 design: PASS (no violations introduced by data model, contracts, or quickstart).

## Project Structure

### Documentation (this feature)

```text
specs/005-innovation-portal/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── ideas/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [ideaId]/page.tsx
├── admin/
│   ├── ideas/page.tsx
│   └── ideas/[ideaId]/page.tsx
├── api/
│   ├── ideas/route.ts
│   ├── ideas/[ideaId]/route.ts
│   ├── admin/ideas/route.ts
│   └── admin/ideas/[ideaId]/status/route.ts
└── layout.tsx

components/
├── ui/                  # shadcn/ui generated primitives
├── forms/
├── ideas/
└── admin/

lib/
├── auth/
│   ├── auth.ts
│   ├── auth.config.ts
│   └── guards.ts
├── db/
│   ├── prisma.ts
│   └── repositories/
│       ├── user-repository.ts
│       ├── idea-repository.ts
│       ├── evaluation-repository.ts
│       └── attachment-repository.ts
├── services/
│   ├── auth-service.ts
│   ├── idea-service.ts
│   ├── evaluation-service.ts
│   └── upload-service.ts
├── validations/
│   ├── auth.ts
│   ├── idea.ts
│   └── evaluation.ts
├── types/
│   ├── result.ts
│   ├── auth.ts
│   ├── idea.ts
│   └── evaluation.ts
└── utils/
    ├── dates.ts
    └── file.ts

prisma/
├── schema.prisma
└── migrations/

public/
└── uploads/

styles/
└── globals.css

PROJECT_SUMMARY.md
```

**Structure Decision**: Choose a single Next.js App Router project with clean internal boundaries (`app` for route surfaces, `lib/services` for business rules, `lib/db/repositories` for data access). This enforces constitution rules while keeping MVP complexity low.

## Phase 0 Research Output

- `research.md` defines version pins, auth/session approach, upload strategy, and tokenized color policy.

## Phase 1 Design Output

- `data-model.md` defines entities, relationships, status transition rules, and Prisma mapping.
- `contracts/ideas-api.yaml` defines route contracts for submitter/admin operations and validation/error responses.
- `quickstart.md` defines local setup and manual critical-path test script.

## Prisma Schema Baseline (planned)

```prisma
enum UserRole {
  SUBMITTER
  ADMIN
}

enum IdeaStatus {
  SUBMITTED
  UNDER_REVIEW
  ACCEPTED
  REJECTED
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(SUBMITTER)
  ideas        Idea[]
  evaluations  Evaluation[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Idea {
  id               String       @id @default(cuid())
  title            String
  description      String
  category         String
  status           IdeaStatus   @default(SUBMITTED)
  submitterId      String
  submitter        User         @relation(fields: [submitterId], references: [id])
  attachment       IdeaAttachment?
  evaluations      Evaluation[]
  currentComment   String?
  reviewedAt       DateTime?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

model IdeaAttachment {
  id          String   @id @default(cuid())
  ideaId      String   @unique
  idea        Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  originalName String
  storagePath String
  mimeType    String
  sizeBytes   Int
  createdAt   DateTime @default(now())
}

model Evaluation {
  id           String     @id @default(cuid())
  ideaId        String
  idea          Idea       @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  evaluatorId   String
  evaluator     User       @relation(fields: [evaluatorId], references: [id])
  fromStatus    IdeaStatus
  toStatus      IdeaStatus
  comment       String
  createdAt     DateTime   @default(now())
}
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
