# PetroLearn

A structured educational platform for Reservoir Petrophysics with Hydrocarbon Phase Analysis — covering 7 chapters from introductory concepts through advanced reservoir engineering applications.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/petro-learn run dev` — run the frontend (port 21828)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, Wouter routing, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — DB tables: `progress.ts`, `quiz.ts`, `bookmarks.ts`, `glossary.ts`
- `artifacts/api-server/src/routes/` — Express route handlers: progress, quiz, bookmarks, glossary, search
- `artifacts/petro-learn/src/` — React frontend
  - `src/pages/` — Home, Chapters, Chapter, Quiz, Glossary, Formulas, Bookmarks, Search, About
  - `src/components/layout/` — Shared layout and navbar

## Architecture decisions

- OpenAPI-first: all endpoints defined in `openapi.yaml` then generated as React Query hooks (api-client-react) and Zod schemas (api-zod)
- Single shared Express API server handles all backend routes for the educational platform
- Progress tracking stored per-chapter in DB; quiz results persisted with full feedback JSON
- Search combines DB-stored glossary terms with static topic/formula data for zero-latency keyword matching
- No authentication — this is a single-user learning tool using local storage for theme preference

## Product

7-chapter educational website covering:
1. Introduction to Reservoir Petrophysics
2. Fundamentals of Reservoir Petrophysics
3. Fluid Saturation, Wettability, and Capillary Pressure
4. Well Log Interpretation
5. Hydrocarbon PVT Properties and Phase Behavior
6. Integration of Petrophysics and Phase Behavior
7. Application in Reservoir Engineering

Features: chapter progress tracking, per-chapter quizzes with instant feedback, glossary (49 terms), formula sheet, bookmarks, global search, dark/light mode, mobile-responsive design.

## Gotchas

- After any OpenAPI spec change: run `pnpm --filter @workspace/api-spec run codegen` before using new types
- Quiz scoring for short-answer questions uses case-insensitive substring matching against the correct answer
- The search endpoint combines live DB glossary queries with static topic/formula arrays — to add searchable content, update `artifacts/api-server/src/routes/search.ts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
