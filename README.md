# InnovatEPAM Portal

> An internal innovation management platform where employees submit ideas and admins evaluate them through a structured multi-stage review pipeline.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)
![Tests](https://img.shields.io/badge/tests-120%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-64%25-yellow)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Evaluation Pipeline](#evaluation-pipeline)
- [Roles & Permissions](#roles--permissions)
- [License](#license)

---

## Overview

InnovatEPAM Portal enables organizations to manage employee-submitted innovation ideas end-to-end. Submitters propose ideas with supporting attachments; admins screen, score, and recommend outcomes across a 5-stage review pipeline with full audit history.

---

## Features

### Core (MVP)
- **Authentication** — Register / login / logout with bcrypt-hashed passwords and NextAuth v5 session management
- **Role-based access** — `SUBMITTER` and `ADMIN` roles enforced at middleware and service layers
- **Idea Submission** — Create ideas with title, description, category, and optional file attachment (images, PDF, Office docs, video, audio; max 10 MB)
- **Idea Listing** — Submitters see only their own ideas; admins see the full queue
- **Evaluation Workflow** — Strict state-machine transitions with mandatory comments for accepted/rejected decisions; every transition stored as an immutable audit record

### Beyond MVP
| Feature | Details |
|---|---|
| **Draft Saving** | Ideas can be saved as `DRAFT` and edited before submission |
| **5-Stage Pipeline** | `SUBMITTED → INITIAL_SCREENING → TECHNICAL_REVIEW → BUSINESS_REVIEW → ACCEPTED / REJECTED` |
| **Blind Review** | Optional flag to anonymise submitter identity during review |
| **Scoring** | Evaluators can attach a 1–5 score to each evaluation step |
| **Recommendations** | Evaluators can record `APPROVE` or `REJECT` recommendations |
| **Admin Search & Filtering** | Full-text search, status filter, category filter, sort order, and active/closed tab switching |
| **Category Metadata** | Extensible per-category structured fields stored as JSON |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router, Server Components, Route Handlers) |
| Language | TypeScript 5.6 — strict mode |
| Database | SQLite via Prisma 5.22 ORM with repository pattern |
| Authentication | NextAuth v5 beta — credentials provider |
| Validation | Zod 3.23 |
| UI | Tailwind CSS 3.4 + Radix UI primitives (shadcn/ui pattern) |
| Testing | Vitest 4.1 + `@vitest/coverage-v8` |
| Icons | Lucide React |

---

## Architecture

```
app/                    # Next.js App Router pages & API route handlers
├── (auth)/             # Login, register, logout pages
├── admin/              # Admin-only idea queue management
├── api/                # REST-style route handlers
│   ├── auth/           # Register & auth callbacks
│   ├── ideas/          # CRUD + file upload
│   └── admin/          # Evaluation transitions
└── ideas/              # Submitter idea views + detail pages

lib/
├── auth/               # NextAuth config, guards, server actions
├── db/repositories/    # Data-access layer (Prisma repository pattern)
├── services/           # Business logic (AuthService, IdeaService, EvaluationService)
├── validations/        # Zod schemas
└── utils/              # Shared helpers (api-error, dates, file, status)

components/
├── admin/              # Admin queue UI components
├── forms/              # IdeaForm (create / edit)
├── ideas/              # Idea cards, search filters
└── ui/                 # Shared primitives (toast, badge, skeleton, dialog)
```

The application follows a strict layered architecture: **Pages → Services → Repositories → Prisma**. No page or route handler queries the database directly.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/<your-username>/innovat-epam-portal.git
cd innovat-epam-portal
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
AUTH_SECRET="your-secret-here"        # generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

> **Security**: Never commit `.env` to version control. The `.gitignore` already excludes it.

---

## Database Setup

```bash
# Apply migrations
npm run db:migrate

# (Optional) Seed demo data
npm run db:seed

# (Optional) Open Prisma Studio GUI
npm run db:studio
```

---

## Running the App

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default seeded accounts** (after `npm run db:seed`):

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password123 |
| Submitter | user@example.com | password123 |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Summary

| Layer | Statements | Branch | Functions |
|---|---|---|---|
| `services/auth-service.ts` | 100% | 100% | 100% |
| `services/evaluation-service.ts` | 80% | 62.5% | 100% |
| `services/idea-service.ts` | 38.88% | 36.36% | 50% |
| `types/result.ts` | 100% | 100% | 100% |
| `utils/file.ts` | 94.73% | 87.5% | 80% |
| `validations/*` | 100% | 100% | 100% |
| **Overall** | **64.17%** | — | — |

120 tests / 120 passing / 0 skipped

---

## Project Structure

```
innovat-epam-portal/
├── app/                    # Next.js pages and API routes
├── components/             # React UI components
├── lib/                    # Business logic, auth, DB, utils
├── prisma/
│   ├── schema.prisma       # Data model
│   ├── seed.js             # Demo seed script
│   └── migrations/         # Migration history
├── public/uploads/         # Uploaded idea attachments (gitignored)
├── specs/                  # Feature specs and planning docs
├── tests/                  # Vitest test suites
├── styles/                 # Global CSS
├── middleware.ts            # Route protection middleware
└── next.config.ts          # Next.js configuration
```

---

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a new submitter account |
| `GET` | `/api/ideas` | Submitter | List own ideas |
| `POST` | `/api/ideas` | Submitter | Create a new idea |
| `GET` | `/api/ideas/[id]` | Submitter | Get idea detail |
| `PATCH` | `/api/ideas/[id]` | Submitter | Update draft idea |
| `POST` | `/api/ideas/[id]/attachments` | Submitter | Upload file attachment |
| `GET` | `/api/admin/ideas` | Admin | List all ideas with filters |
| `POST` | `/api/admin/ideas/[id]/evaluate` | Admin | Advance idea through pipeline |

---

## Evaluation Pipeline

```
DRAFT ──► SUBMITTED ──► INITIAL_SCREENING ──► TECHNICAL_REVIEW ──► BUSINESS_REVIEW
                                                                           │
                                                              ┌────────────┴────────────┐
                                                           ACCEPTED               REJECTED
```

- Every transition is stored as an immutable `Evaluation` record
- `ACCEPTED` and `REJECTED` transitions require a non-empty comment
- Optional `score` (1–5) and `recommendation` (`APPROVE` / `REJECT`) fields per evaluation step

---

## Roles & Permissions

| Action | SUBMITTER | ADMIN |
|---|---|---|
| View own ideas | ✅ | ✅ |
| View all ideas | ❌ | ✅ |
| Submit / edit draft | ✅ | ❌ |
| Upload attachments | ✅ | ❌ |
| Evaluate ideas | ❌ | ✅ |
| Search & filter queue | ❌ | ✅ |

---

## License

This project was built as part of the **A201 – Beyond Vibe Coding** AI bootcamp course. It is intended for educational purposes.
