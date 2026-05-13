---
description: "Task list for InnovatEPAM Portal Phase 1 implementation"
---

# Tasks: InnovatEPAM Portal Phase 1 Core Portal

**Input**: Design documents from `/specs/005-innovation-portal/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Manual testing only. No automated unit/integration/e2e tasks are required for this phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`
- `[P]`: Can run in parallel (different files, no direct dependency)
- `[Story]`: User story label (`US1`, `US2`, `US3`, `US4`)
- All task descriptions include concrete file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap project structure and baseline tooling.

- [ ] T001 Create Next.js App Router TypeScript project scaffold and scripts in `package.json`
- [ ] T002 Configure TypeScript strict mode in `tsconfig.json`
- [ ] T003 [P] Configure Tailwind CSS v3 tokens and global styles in `tailwind.config.ts` and `styles/globals.css`
- [ ] T004 [P] Initialize shadcn/ui foundation and base UI primitives in `components/ui/*`
- [ ] T005 [P] Add environment template and runtime env loader in `.env.example` and `lib/utils/env.ts`
- [ ] T006 [P] Create initial folder structure from plan under `app/`, `components/`, `lib/`, `prisma/`, and `public/uploads/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user story delivery.

**CRITICAL**: No user story work starts before this phase is complete.

- [ ] T007 Configure Prisma datasource and baseline models in `prisma/schema.prisma`
- [ ] T008 Create and apply initial Prisma migration in `prisma/migrations/`
- [ ] T009 Implement Prisma client singleton in `lib/db/prisma.ts`
- [ ] T010 [P] Implement typed result envelope and shared domain types in `lib/types/result.ts`, `lib/types/auth.ts`, `lib/types/idea.ts`, and `lib/types/evaluation.ts`
- [ ] T011 [P] Implement repository interfaces and concrete classes in `lib/db/repositories/user-repository.ts`, `lib/db/repositories/idea-repository.ts`, `lib/db/repositories/evaluation-repository.ts`, and `lib/db/repositories/attachment-repository.ts`
- [ ] T012 Implement NextAuth v5 config and auth wiring in `lib/auth/auth.config.ts`, `lib/auth/auth.ts`, and `app/api/auth/[...nextauth]/route.ts`
- [ ] T013 Implement server-side auth and role guards in `lib/auth/guards.ts`
- [ ] T014 Implement request validation schemas in `lib/validations/auth.ts`, `lib/validations/idea.ts`, and `lib/validations/evaluation.ts`
- [ ] T015 Implement secure upload utility with size and type whitelist checks in `lib/services/upload-service.ts` and `lib/utils/file.ts`
- [ ] T016 Implement global typed API error mapping in `lib/utils/api-error.ts`
- [ ] T017 Create app shell and shared navigation for submitter/admin views in `app/layout.tsx` and `components/layout/main-nav.tsx`

**Checkpoint**: Foundation is ready; user stories can now be implemented.

---

## Phase 3: User Story 1 - Employee Access and Identity (Priority: P1)

**Goal**: Users can register, log in, and log out securely.

**Independent Test**: Register a new user, log in with credentials, access protected page, then log out and verify protection is restored.

### Implementation for User Story 1

- [ ] T018 [P] Implement auth service for registration/login business rules in `lib/services/auth-service.ts`
- [ ] T019 Implement registration API handler in `app/api/auth/register/route.ts`
- [ ] T020 [P] Build registration page and form with inline validation/errors in `app/(auth)/register/page.tsx` and `components/forms/register-form.tsx`
- [ ] T021 [P] Build login page and form with inline validation/errors in `app/(auth)/login/page.tsx` and `components/forms/login-form.tsx`
- [ ] T022 Implement logout action and session-aware route guards in `app/(auth)/logout/route.ts` and `middleware.ts`
- [ ] T023 Add loading/error/empty UI states for auth flows in `components/forms/auth-feedback.tsx`
- [ ] T024 [US1] Manual validation pass for registration/login/logout and duplicate email handling; document outcomes in `PROJECT_SUMMARY.md`

**Checkpoint**: US1 works independently and is manually validated.

---

## Phase 4: User Story 2 - Submit and Track Ideas (Priority: P1)

**Goal**: Submitters can create ideas (optional attachment) and view their own ideas with current status.

**Independent Test**: Submitter creates idea with and without attachment, then sees own list/detail only.

### Implementation for User Story 2

- [ ] T025 [P] Implement idea service for submitter list/detail/create rules in `lib/services/idea-service.ts`
- [ ] T026 Implement create/list submitter ideas API in `app/api/ideas/route.ts`
- [ ] T027 Implement idea detail API with ownership checks in `app/api/ideas/[ideaId]/route.ts`
- [ ] T028 [P] Build idea submission page with file upload and inline validation in `app/ideas/new/page.tsx` and `components/forms/idea-form.tsx`
- [ ] T029 [P] Build submitter ideas list page with loading/error/empty states in `app/ideas/page.tsx` and `components/ideas/idea-list.tsx`
- [ ] T030 Build submitter idea detail page with attachment display in `app/ideas/[ideaId]/page.tsx` and `components/ideas/idea-detail.tsx`
- [ ] T031 Enforce 10 MB and whitelist validation in submission path using `lib/services/upload-service.ts` and `lib/validations/idea.ts`
- [ ] T032 [US2] Manual validation pass for submission, attachment rules, and owner-only visibility; document outcomes in `PROJECT_SUMMARY.md`

**Checkpoint**: US2 works independently and is manually validated.

---

## Phase 5: User Story 3 - Admin Evaluation Workflow (Priority: P1)

**Goal**: Admin can view all ideas and evaluate with strict status transitions and mandatory comments.

**Independent Test**: Admin moves idea to under_review then accepted/rejected with comment; invalid transitions are rejected.

### Implementation for User Story 3

- [ ] T033 [P] Implement evaluation service with strict state machine rules in `lib/services/evaluation-service.ts`
- [ ] T034 Implement admin queue API in `app/api/admin/ideas/route.ts`
- [ ] T035 Implement admin status transition API in `app/api/admin/ideas/[ideaId]/status/route.ts`
- [ ] T036 [P] Build admin ideas queue page in `app/admin/ideas/page.tsx` and `components/admin/admin-idea-list.tsx`
- [ ] T037 Build admin idea detail and evaluation form UI in `app/admin/ideas/[ideaId]/page.tsx` and `components/admin/evaluation-form.tsx`
- [ ] T038 Enforce mandatory comment for accepted/rejected transitions in `lib/validations/evaluation.ts` and `lib/services/evaluation-service.ts`
- [ ] T039 Enforce submitter-blocked/admin-only access for all admin views/actions in `lib/auth/guards.ts`, `middleware.ts`, and admin route handlers
- [ ] T040 [US3] Manual validation pass for admin queue, lifecycle transitions, mandatory comments, and RBAC; document outcomes in `PROJECT_SUMMARY.md`

**Checkpoint**: US3 works independently and is manually validated.

---

## Phase 6: User Story 4 - Status Lifecycle Transparency (Priority: P2)

**Goal**: Submitters see current status and evaluation comment updates clearly.

**Independent Test**: After admin transition, submitter list/detail reflects latest status and comment without exposing admin-only controls.

### Implementation for User Story 4

- [ ] T041 Update submitter idea list presentation for lifecycle badges and timestamps in `components/ideas/idea-list.tsx` and `lib/utils/dates.ts`
- [ ] T042 Update submitter idea detail presentation for evaluation comments and transition metadata in `components/ideas/idea-detail.tsx`
- [ ] T043 Add lifecycle-specific empty/help states in `components/ideas/idea-empty-state.tsx`
- [ ] T044 [US4] Manual validation pass for status/comment visibility after admin evaluation; document outcomes in `PROJECT_SUMMARY.md`

**Checkpoint**: US4 works independently and is manually validated.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Final quality hardening across all stories.

- [ ] T045 Review all UI components for tokenized color usage only; fix any hardcoded hex in `app/**/*`, `components/**/*`, and `styles/globals.css`
- [ ] T046 Accessibility pass (keyboard flow, semantic HTML, ARIA) across auth/submitter/admin pages in `app/**/*` and `components/**/*`
- [ ] T047 Run full manual quickstart verification from `specs/005-innovation-portal/quickstart.md`
- [ ] T048 Finalize implementation summary with manual test evidence in `PROJECT_SUMMARY.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- Phase 1 -> no dependencies
- Phase 2 -> depends on Phase 1 and blocks all stories
- Phase 3, 4, 5, 6 -> depend on Phase 2
- Phase 7 -> depends on completion of selected user stories

### User Story Dependencies
- US1: independent after Phase 2
- US2: independent after Phase 2 (can ship with US1)
- US3: independent after Phase 2, uses shared auth + idea services
- US4: depends functionally on US3 transitions and US2 views

### Within-Story Order
- Service/business rules before handlers/pages
- API handlers before story UI integration
- Validation and guard enforcement before final manual validation task

### Parallel Opportunities
- Setup parallel tasks: T003, T004, T005, T006
- Foundation parallel tasks: T010, T011, T012, T013, T014
- US1 parallel tasks: T020, T021
- US2 parallel tasks: T028, T029
- US3 parallel tasks: T034 and T036 after T033

---

## Implementation Strategy

### MVP First
1. Complete Phase 1 and Phase 2.
2. Deliver US1, US2, US3 (all P1).
3. Validate critical manual flow and checkpoint review.

### Incremental Delivery
1. Ship auth baseline (US1).
2. Ship submitter flow (US2).
3. Ship admin evaluation (US3).
4. Ship transparency refinements (US4).
5. Finish with polish and final manual verification.

---

## Notes
- Keep commits frequent using conventional commit prefixes.
- Every task touching async UX must include loading/error/empty handling.
- Do not introduce automated tests in this phase.
- Ensure repository pattern boundaries are preserved in every task.
