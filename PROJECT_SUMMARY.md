# Project Summary - InnovatEPAM Portal

## Overview
InnovatEPAM Portal is an internal web application where employees submit innovation ideas and designated admins evaluate them through a structured review pipeline. It provides role-based access so submitters can track the status of their own ideas while admins manage the full queue from initial screening through to final decision.

## Features Completed

### MVP Features
- [x] **User Authentication** - Register, login, logout with bcrypt-hashed passwords and NextAuth v5 session management; two roles (SUBMITTER, ADMIN) enforced server-side
- [x] **Idea Submission** - Authenticated submitters can create ideas with title, description, and category via a validated form; ideas initialise with status `SUBMITTED`
- [x] **File Attachment** - Single file per idea, max 10 MB, server-side MIME-type whitelist (images, PDF, Office docs, video, audio); stored in `public/uploads`
- [x] **Idea Listing & Viewing** - Submitters see only their own ideas with current status badges; admins see the full queue; both have dedicated detail pages with evaluation history
- [x] **Evaluation Workflow** - Strict state-machine pipeline enforced in `EvaluationService`; mandatory comment required for `ACCEPTED`/`REJECTED` decisions; every transition stored as an immutable audit record

### Beyond-MVP Features (implemented)
- [x] **Draft Saving** - Ideas can be saved as `DRAFT` and edited before submission (`app/ideas/drafts/`, `updateDraftIdeaSchema`)
- [x] **Multi-Stage Review Pipeline** - Spec defined 3 stages; implementation extended to 5: `SUBMITTED → INITIAL_SCREENING → TECHNICAL_REVIEW → BUSINESS_REVIEW → ACCEPTED | REJECTED`
- [x] **Blind Review** - `blindReview` boolean flag per idea in the data model (migration `20260514162622`)
- [x] **Scoring** - Optional integer score (1–5) per evaluation record (migration `20260514170246`)
- [x] **Evaluator Recommendation** - Optional `APPROVE | REJECT` recommendation field per evaluation (migration `20260514203552`)
- [x] **Admin Search & Filtering** - Admin queue supports full-text search, status filter, category filter, sort order, and active/closed tab switching (`admin-search-bar`, `admin-filters`)

## Technical Stack
- **Framework**: Next.js 14.2 (App Router, Server Components, Route Handlers) + TypeScript 5.6 strict mode
- **Database**: Prisma 5.22 + SQLite (`prisma/dev.db`) with repository pattern — no direct DB calls from pages or handlers
- **Authentication**: NextAuth v5 beta (credentials provider, bcryptjs cost 10, server-side session guards)
- **Testing**: Vitest 4.1 + `@vitest/coverage-v8` — 8 test files, 120 tests, all passing
- **Validation**: Zod 3.23 — schemas for auth, idea creation, and evaluation inputs
- **UI**: Tailwind CSS 3.4 + Radix UI primitives (shadcn/ui pattern); tokenised colours only

## Test Coverage
- **Overall**: 64.17% (statements)
- **Tests passing**: 120 / 120 (0 failing, 0 skipped)
- **100% covered**: `auth-service`, `result` helpers, all three Zod validation schemas
- **Highest gap**: `idea-service` at 38.88% — the extended draft/update/attach methods are not yet tested
- **Per-layer summary**:

| Layer | Stmts | Branch | Funcs |
|---|---|---|---|
| services/auth-service.ts | 100% | 100% | 100% |
| services/evaluation-service.ts | 80% | 62.5% | 100% |
| services/idea-service.ts | 38.88% | 36.36% | 50% |
| types/result.ts | 100% | 100% | 100% |
| utils/file.ts | 94.73% | 87.5% | 80% |
| utils/api-error.ts | 9.09% | 0% | 0% |
| validations/\* | 100% | 100% | 100% |

## Spec Traceability
- **Spec files**: 6 markdown files in `/specs/005-innovation-portal/` (`spec.md`, `plan.md`, `data-model.md`, `quickstart.md`, `research.md`, `tasks.md`)
- **Requirements covered**: 20 functional requirements (FR-001 – FR-020) from `spec.md`
- **User stories covered**: 4 (US1 Employee Access, US2 Idea Submission, US3 Admin Evaluation, US4 Status Transparency)
- **Notable discrepancy**: Status lifecycle was extended from the spec's 3-stage model (`SUBMITTED → UNDER_REVIEW → ACCEPTED | REJECTED`) to a 5-stage implementation pipeline — flagged intentionally with inline comments in all affected tests

## Project Stats
- **Git commits**: 14
- **Source files**: 70 TypeScript / TSX files (~5,041 lines, excluding tests, migrations, node_modules)
- **Test files**: 8 files in `tests/lib/` (services, validations, utils)

---

**Author**: Enver Bugrahan Alyuz
**Date**: 2026-05-15
**Course**: A201 - Beyond Vibe Coding
