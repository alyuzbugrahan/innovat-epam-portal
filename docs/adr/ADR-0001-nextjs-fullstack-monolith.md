# ADR-0001: Next.js Full-Stack Monolith

**Date**: 2026-05-13  
**Status**: Accepted

## Decision
Use Next.js 14 App Router as a single full-stack application instead of a separate frontend/backend split.

## Rationale
- Single codebase reduces context switching and deployment complexity for MVP
- App Router server components and server actions eliminate a dedicated API layer for most flows
- Course stack and team familiarity align with this choice

## Consequences
- All business logic, data access, and UI live in one repo
- Scaling frontend and backend independently is not possible without refactoring
