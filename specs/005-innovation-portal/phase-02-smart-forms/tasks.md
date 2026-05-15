---

description: "Task list for Phase 2 — Smart Submission Forms"
---

# Tasks: InnovatEPAM Portal Phase 2 — Smart Submission Forms

**Branch**: `006-smart-submission-forms`
**Spec**: `specs/005-innovation-portal/phase-02-smart-forms/spec.md`
**Plan**: `specs/005-innovation-portal/phase-02-smart-forms/plan.md`
**Task ID range**: T101–T114 (Phase 1 used T001–T048)

**Implementation Workflow**: SDD — tests RED first, then implementation GREEN, then commit.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[US1]**: User Story 1 — Dynamic Category Metadata on Submission (P1)
- **[US2]**: User Story 2 — Category Metadata Visibility on Idea Detail (P1)

---

## Phase 1: Schema & Types (Foundational)

**Purpose**: Add the `categoryMetadata` column to the database and surface it in the TypeScript type system. No user story work can begin until migration + client regen are complete.

**⚠️ CRITICAL**: All downstream tasks depend on the Prisma client generated in T101.

- [ ] T101 Add `categoryMetadata String?` field to the `Idea` model in `prisma/schema.prisma`, run `npx prisma migrate dev --name add_category_metadata`, then run `npx prisma generate` to regenerate the Prisma client
- [ ] T102 Add `categoryMetadata: string | null` property to the `Idea` interface in `lib/types/idea.ts`

**Checkpoint**: Schema migrated, Prisma client regenerated, TypeScript type updated — ready for RED tests and parallel story implementation.

---

## Phase 2: RED Tests (Write Failing Tests First)

**Purpose**: Write the Vitest unit tests *before* the implementation. These tests **must fail** at this stage — that is the intended outcome and confirms the test coverage is real.

> **⚠️ RED PHASE**: Run `npx vitest run` after this phase and confirm new tests fail. Do NOT proceed to Phase 3 until confirmed red.

- [ ] T103 [P] [US1] Add failing Vitest tests for `categoryMetadata` validation (optional nullable string, max 500 chars) and cross-field presence checks to `tests/lib/validations/idea.test.ts`
- [ ] T104 [P] [US1] Add failing Vitest tests for `categoryMetadata` persistence in `createIdea()` and `updateDraftIdea()` to `tests/lib/services/idea-service.test.ts`

**Checkpoint**: New tests exist and are confirmed RED. Implementation may now begin.

---

## Phase 3: User Story 1 — Dynamic Category Metadata on Submission (Priority: P1) 🎯 MVP

**Goal**: Wire `categoryMetadata` through the full write path — validation → repository → service → API routes → submission form — so that selecting a category, filling the extra field, and submitting persists structured metadata in the database.

**Independent Test**: Select "Technology", enter "React, Node.js" in Tech Stack, submit. Confirm the idea is saved. Repeat for "Process Improvement" (Affected Team), "Client Solution" (Client Industry), and "Other" (no extra field). Verify draft edit pre-populates the saved value.

### Implementation for User Story 1

- [ ] T105 [US1] Add `categoryMetadata: z.string().max(500).nullable().optional()` to `createIdeaSchema` and `updateDraftIdeaSchema` in `lib/validations/idea.ts`; export updated `CreateIdeaInput` and `UpdateDraftIdeaInput` types
- [ ] T106 [US1] Add `categoryMetadata: string | null = null` parameter to `create()` and add `categoryMetadata` to the accepted data shape of `updateIdea()` in `lib/db/repositories/idea-repository.ts`; pass the value through to `prisma.idea.create` and `prisma.idea.update`
- [ ] T107 [US1] Add `categoryMetadata: string | null = null` parameter to `createIdea()` and `categoryMetadata: string | null | undefined` parameter to `updateDraftIdea()` in `lib/services/idea-service.ts`; pass both through to the repository calls in T106
- [ ] T108 [P] [US1] Destructure `categoryMetadata` from `validationResult.data` in the POST handler of `app/api/ideas/route.ts` and pass it to `ideaService.createIdea()`
- [ ] T109 [P] [US1] Destructure `categoryMetadata` from the validated PATCH body in `app/api/ideas/[ideaId]/route.ts` and pass it to `ideaService.updateDraftIdea()`
- [ ] T110 [US1] Refactor `components/forms/idea-form.tsx`: (a) delete the `---METADATA---` description-append block, (b) build a `categoryMetadata` JSON string from the extra field value and selected category using `CATEGORY_FIELDS`, (c) include `categoryMetadata` in both the POST `/api/ideas` body and the PATCH `/api/ideas/:id` body, (d) replace `metadata?: Record<string, string | undefined>` with `categoryMetadata?: string | null` in `IdeaFormInitialValues`, (e) pre-populate the extra field `useState` initialiser by parsing `initialValues.categoryMetadata`

**Checkpoint**: User Story 1 fully functional. Run `npx vitest run` — T103 and T104 tests should now be GREEN. Submit a new idea with each category and verify metadata persists.

---

## Phase 4: User Story 2 — Category Metadata Visibility on Idea Detail (Priority: P1)

**Goal**: Replace the `parseIdeaDescription` call on every detail page with a direct read of `idea.categoryMetadata`, so that both submitters and admins see the structured metadata rendered in the "Category Details" section.

**Independent Test**: Open an idea created with "Client Solution" + "Healthcare". Confirm "Client Industry: Healthcare" appears on the submitter detail view and the admin detail view. Open an idea with "Other" or a pre-Phase-2 idea — confirm no metadata section appears and the page renders without errors.

### Implementation for User Story 2

- [ ] T111 [P] [US2] In `app/ideas/[ideaId]/page.tsx` replace `const { description, metadata } = parseIdeaDescription(idea.description)` with `const description = idea.description` and `const metadata = idea.categoryMetadata ? JSON.parse(idea.categoryMetadata) : null`
- [ ] T112 [P] [US2] In `app/admin/ideas/[ideaId]/page.tsx` replace `const { description, metadata } = parseIdeaDescription(idea.description)` with `const description = idea.description` and `const metadata = idea.categoryMetadata ? JSON.parse(idea.categoryMetadata) : null`
- [ ] T113 [P] [US2] In `app/ideas/[ideaId]/edit/page.tsx` pass `idea.categoryMetadata` directly to the form's `initialValues.categoryMetadata` prop instead of the value parsed from `parseIdeaDescription`

**Checkpoint**: Both detail views and the edit page read `categoryMetadata` directly. `parseIdeaDescription` is no longer called by any page (the function itself may remain in `lib/utils/idea-metadata.ts` for a later cleanup commit).

---

## Phase 5: Verification & Commit

**Purpose**: Confirm all tests are GREEN, perform the manual validation pass, and create the conventional commit.

- [ ] T114 Run `npx vitest run` and confirm **all tests pass** (120+ expected); any failures must be fixed before proceeding
- [ ] T115 Manual validation pass — exercise all acceptance scenarios from spec.md: (a) submit with Technology/Process Improvement/Client Solution/Other, (b) verify metadata persists and is visible on submitter and admin detail views, (c) verify "Other" and pre-Phase-2 ideas show no metadata section, (d) verify draft edit pre-populates the extra field, (e) verify switching category clears the previous field value, (f) verify submitting with an empty required extra field is blocked with an inline error
- [ ] T116 Commit all changes: `git add -A && git commit -m "feat: add categoryMetadata column and wire through all layers (Phase 2)"`

---

## Dependencies

```
T101 → T102 → T103, T104 (RED tests)
T101 → T105 → T106 → T107 → T108, T109 → T110
T108, T109 can run in parallel (different route files)
T111, T112, T113 can run in parallel (different page files)
T110 must complete before T114 (form is the final write-path piece)
T113 must complete before T114
T114 → T115 → T116
```

## Parallel Execution Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| RED test authoring | T103, T104 | Both test files are independent |
| API route updates | T108, T109 | Different route files, same data shape |
| Detail page refactors | T111, T112, T113 | All three pages are independent |

## Implementation Strategy

**MVP scope**: Phase 3 (T105–T110) alone delivers User Story 1 — metadata is stored correctly. Phase 4 (T111–T113) then unlocks User Story 2 — metadata is readable on detail views. Both stories are P1, so both phases must be complete for the feature to ship.

**SDD discipline**: The RED → GREEN gate at the end of Phase 2 / start of Phase 3 is mandatory. Do not skip it.
