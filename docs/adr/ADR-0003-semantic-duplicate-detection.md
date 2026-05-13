# ADR-0003: Semantic Duplicate Detection as AI Differentiator

**Date**: 2026-05-13  
**Status**: Deferred (post Phase 1)

## Decision
Add semantic duplicate detection after Phase 1 core functionality is stable.

## Rationale
- Surfaces similar existing ideas to submitters and evaluators via embedding + cosine similarity
- Pattern aligns with prior vector search experience (Qdrant/Superlinked)
- Must not block or degrade core submission flow (fail-soft, async)

## Consequences
- Requires an embedding model and vector similarity layer
- Deferred until Phase 1 is committed and manually validated
