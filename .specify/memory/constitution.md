# InnovatEPAM Portal Constitution

## Core Principles

### I. Code Quality and Architecture
- All code MUST follow clean code principles: descriptive naming, small focused functions, and removal of dead code.
- TypeScript strict mode MUST be enabled and enforced across the project.
- Data access MUST use a repository pattern; route handlers, server actions, and pages MUST NOT call the database directly.
- Environment-specific configuration MUST come from environment variables; hardcoded environment values are prohibited.
- Server actions MUST return typed result objects for success and failure. Client surfaces MUST show user-friendly error messages.

### II. UI/UX and Accessibility by Default
- UI implementations MUST use simple, responsive patterns and shadcn/ui components.
- The minimum supported viewport width is 375px; all primary flows MUST remain usable at this width.
- Accessibility is required: keyboard navigation support, semantic HTML, and ARIA attributes where appropriate.
- All asynchronous operations MUST provide explicit loading and error states.
- Forms MUST include validation with clear inline error messages.
- Empty states MUST provide helpful guidance (example: "No ideas yet - submit your first one").

### III. Approved Platform Stack
- Framework: Next.js with App Router.
- UI: React + Tailwind CSS + shadcn/ui.
- Persistence: SQLite in development via Prisma ORM.
- Authentication: NextAuth.js (Auth.js v5).
- Utility dependencies MUST remain minimal; every additional library requires explicit justification in plan.md.
- Exact version numbers belong in plan.md, not in this constitution.

### IV. Security and Authorization Enforcement
- Secrets MUST NOT be hardcoded in source code. All secrets and environment configuration MUST be loaded from environment variables.
- Passwords MUST be hashed with bcrypt using a minimum cost factor of 10.
- Uploaded files MUST enforce a maximum size of 10 MB per file.
- File type validation MUST be performed server-side using a whitelist approach.
- Any route that modifies or exposes user data MUST require an authenticated session.
- Role-based access MUST be enforced server-side:
	- submitter cannot evaluate submissions
	- admin can submit and evaluate

### V. Delivery Process and Quality Gates
- Manual testing is acceptable; automated unit/integration/e2e tests are optional.
- Before each commit to shared history, critical paths MUST be manually tested: registration, login, idea submission, file upload, status transitions, and role-based access.
- The testing approach and outcomes MUST be documented in PROJECT_SUMMARY.md.
- Work within a phase MUST be executed autonomously without pausing after each micro-task.
- A human review checkpoint is REQUIRED after each completed phase before starting the next phase.
- Each phase MUST end in a working, committable state.
- Commits MUST be frequent and use conventional commit prefixes (feat:, fix:, docs:, refactor:).

## Optional AI Differentiator Policy

- Semantic duplicate detection is an optional enhancement and MUST be scheduled only after Phase 1 core functionality is stable and tested.
- Duplicate detection MUST fail soft and MUST NOT block or degrade idea submission.
- Similar ideas should be surfaced to submitters and evaluators asynchronously when possible.

## Governance

- This constitution is authoritative for specification, planning, tasking, and implementation decisions.
- Constitution compliance is a required gate in planning and review.
- Any exception MUST be explicitly documented with rationale in the relevant plan or task artifact and approved during human checkpoint review.
- Amendments require:
	- a documented change proposal
	- approval by project maintainers
	- updates to impacted templates or process guidance when applicable

**Version**: 1.0.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-13
