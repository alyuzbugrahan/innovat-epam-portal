# Project Summary - InnovatEPAM Portal

## Overview
InnovatEPAM Portal is an internal web application where employees submit innovation ideas and designated admins evaluate them through a structured review pipeline. It provides role-based access so submitters can track the status of their own ideas while admins manage the full queue from initial screening through to final decision.

## Features Completed

### MVP Features
- [x] **User Authentication** - Register, login, logout with bcrypt-hashed passwords and NextAuth v5 session management; two roles (SUBMITTER, ADMIN) enforced server-side
- [x] **Idea Submission** - Authenticated submitters can create ideas with title, description, and category via a validated form; ideas initialise with status `SUBMITTED`
- [x] **File Attachment** - Multiple attachments per idea, max 10 MB each, server-side MIME-type whitelist (images, PDF, Office docs, video, audio); stored in `public/uploads`; individual attachments can be removed from drafts via `DELETE /api/ideas/[id]/attachments/[attachmentId]`
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
- **Testing**: Vitest 4.1 + `@vitest/coverage-v8` — 10 test files, 163 tests, all passing
- **Validation**: Zod 3.23 — schemas for auth, idea creation, and evaluation inputs
- **UI**: Tailwind CSS 3.4 + Radix UI primitives (shadcn/ui pattern); tokenised colours only

## Test Coverage
- **Overall**: 96.26% (statements), 84.72% (branch), 95.65% (functions)
- **Tests passing**: 163 / 163 (0 failing, 0 skipped)
- **100% covered**: `auth-service`, `idea-service`, `api-error`, `result` helpers, all three Zod validation schemas
- **Remaining gap**: `evaluation-service` branch coverage at 62.5% (lines 78–92 — direct-jump guard branches in the transition validator)
- **Per-layer summary**:

| Layer | Stmts | Branch | Funcs |
|---|---|---|---|
| services/auth-service.ts | 100% | 100% | 100% |
| services/evaluation-service.ts | 80% | 62.5% | 100% |
| services/idea-service.ts | 100% | 100% | 100% |
| types/result.ts | 100% | 100% | 100% |
| utils/api-error.ts | 100% | 100% | 100% |
| utils/file.ts | 94.73% | 87.5% | 80% |
| validations/\* | 100% | 100% | 100% |

## Spec-Driven Development Evidence

### SpecKit Workflow Applied

| Step | Command | Artifact Produced |
|---|---|---|
| 1. Principles | `/speckit.constitution` | `.specify/memory/constitution.md` — coding rules, security mandates, approved stack |
| 2. Specify | `/speckit.specify` | `specs/005-innovation-portal/spec.md` — user stories + acceptance criteria |
| 3. Clarify | `/speckit.clarify` | Refined acceptance scenarios and edge cases in `spec.md` |
| 4. Plan | `/speckit.plan` | `specs/005-innovation-portal/plan.md`, `data-model.md`, `research.md`, `quickstart.md` |
| 5. Tasks | `/speckit.tasks` | `specs/005-innovation-portal/tasks.md` — T001–T0xx grouped by user story |
| 6. Implement | AI-assisted coding | Source code guided by tasks and spec references in prompts |
| 7. Test | Vitest + TDD | Test headers cite spec path, user story, and FR numbers |

### Spec Artifacts
- **Phase 1**: `spec.md`, `plan.md`, `data-model.md`, `quickstart.md`, `research.md`, `tasks.md` in `specs/005-innovation-portal/`
- **Phase 2**: `spec.md`, `plan.md`, `tasks.md` in `specs/005-innovation-portal/phase-02-smart-forms/`
- **Constitution**: `.specify/memory/constitution.md`
- **ADRs**: 3 Architecture Decision Records in `docs/adr/`
  - `ADR-0001` — Next.js fullstack monolith
  - `ADR-0002` — SQLite + Prisma
  - `ADR-0003` — Semantic duplicate detection

### Spec → Code Traceability
- **Requirements covered**: 20 functional requirements (FR-001 – FR-020) from `spec.md`
- **User stories covered**: 4 (US1 Employee Access, US2 Idea Submission, US3 Admin Evaluation, US4 Status Transparency)
- **Test headers** cite the spec path, user story, and FR numbers they validate (e.g. `FR-006, FR-007` in `idea-service.test.ts`)
- **Constitution compliance**: Repository pattern, strict TypeScript, bcrypt cost 10, 10 MB file limit, server-side role enforcement — all mandated by constitution and present in code
- **Phase 5 pipeline supersedes Phase 1**: Phase 1 spec defines `SUBMITTED → UNDER_REVIEW → ACCEPTED | REJECTED`; Phase 5 (Multi-Stage Review) extends this to `SUBMITTED → INITIAL_SCREENING → TECHNICAL_REVIEW → BUSINESS_REVIEW → ACCEPTED | REJECTED`. The latest phase spec is authoritative — all tests and the evaluation service reflect the Phase 5 model.

## Project Stats
- **Git commits**: 14
- **Source files**: 70 TypeScript / TSX files (~5,041 lines, excluding tests, migrations, node_modules)
- **Test files**: 10 files in `tests/lib/` (services, validations, utils)

## Transformation Reflection

### Before (Module 01)
I approached development by jumping straight into coding —
writing features as I thought of them, adjusting requirements
on the fly, and relying on AI tools to generate code without
providing structured context. Prompts were vague and
result-driven: "build me a login page."

### After (Module 08)
I now start every feature with a specification. Before writing
a single line of code, I define user stories, acceptance
criteria, functional requirements, and edge cases in a
structured spec. AI tools receive this spec as context, which
produces significantly more accurate and consistent output.
I also document architecture decisions as ADRs so that every
non-obvious technical choice has a recorded rationale.

### Key Learning
The quality of AI-generated code is directly proportional to
the quality of the specification you provide. Vague prompts
produce generic code; structured specs with clear constraints,
user stories, and architecture decisions produce code that
actually fits the system. Specification is not overhead —
it is the work.

---

**Author**: alyuzbugrahan
**Date**: 2026-05-15
**Course**: A201 - Beyond Vibe Coding
