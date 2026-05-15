# Phase 0 Research: InnovatEPAM Portal Phase 1

## Decision 1: Next.js App Router as full-stack boundary
- Decision: Use Next.js 14 App Router with route handlers and server actions.
- Rationale: Keeps UI and backend in one deployable, supports session-aware server rendering, and matches constitution stack constraints.
- Alternatives considered:
  - Separate frontend/backend projects: rejected due to extra operational complexity for MVP.
  - Pages Router: rejected because App Router better fits server components and modern conventions.

## Decision 2: Typed service/repository architecture
- Decision: Route handlers and server actions call service layer only; services call repositories; repositories call Prisma.
- Rationale: Enforces constitution rule preventing direct DB calls in route/page surfaces and improves testability/maintainability.
- Alternatives considered:
  - Direct Prisma in routes: rejected (violates constitution).
  - Over-engineered DDD modules: rejected for MVP overhead.

## Decision 3: Authentication and authorization
- Decision: NextAuth.js v5 credentials provider with role claim in session token.
- Rationale: Meets stack preference and enables server-side RBAC checks via centralized guards.
- Alternatives considered:
  - Third-party SSO first: rejected for Phase 1 scope.
  - Client-only role checks: rejected due to security risk.

## Decision 4: File upload handling
- Decision: Accept one optional file per idea using multipart upload; store metadata in SQLite and bytes on local filesystem under `public/uploads`.
- Rationale: Matches Phase 1 requirement and keeps implementation simple for development.
- Security controls:
  - Max 10 MB enforced server-side
  - Whitelist MIME + extension validation server-side
  - Generated storage filename (no trust in client filenames)

## Decision 5: Status lifecycle enforcement
- Decision: Enforce state machine on server:
  - submitted -> under_review
  - under_review -> accepted
  - under_review -> rejected
- Rationale: Strict transitions are a core business rule; validation in service layer prevents bypass from UI or API.
- Additional rule: evaluation comment required when moving to accepted/rejected.

## Decision 6: UI tokens and accessibility
- Decision: Use Tailwind theme tokens for all colors (`bg-background`, `text-foreground`, `border-border`, semantic aliases in config/css vars).
- Rationale: Satisfies no-hardcoded-hex constraint and keeps design system coherent.
- Accessibility baseline:
  - Keyboard-focusable controls
  - Semantic headings/landmarks
  - ARIA labels for icon-only controls
  - Explicit loading/error/empty states on async screens

## Decision 7: Utility policy
- Decision: Keep utilities minimal with only `date-fns` for date formatting and `zod` for typed input validation.
- Rationale: `date-fns` requested by stack; `zod` provides compact runtime validation tied to TypeScript types.

## Version Pins (to be used in package.json)
- next: 14.2.32
- react: 18.3.1
- react-dom: 18.3.1
- typescript: 5.6.3
- tailwindcss: 3.4.17
- prisma: 5.22.0
- @prisma/client: 5.22.0
- next-auth: 5.0.0-beta.25
- date-fns: 3.6.0
- bcrypt: 5.1.1
- zod: 3.23.8
