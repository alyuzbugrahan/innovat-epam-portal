# ADR-0002: SQLite + Prisma for MVP Persistence

**Date**: 2026-05-13  
**Status**: Accepted

## Decision
Use SQLite as the development database accessed via Prisma ORM.

## Rationale
- Zero infrastructure setup for local development
- Prisma provides type-safe queries and migration tooling
- MVP scale (<100 ideas) does not require a server-based database
- Migrating to PostgreSQL later requires only a Prisma datasource change

## Consequences
- No concurrent write support; acceptable for single-developer MVP
- Production deployment requires switching datasource (not in scope for Phase 1)
