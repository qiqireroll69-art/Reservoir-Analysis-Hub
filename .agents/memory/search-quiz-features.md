---
name: Search and Quiz Error Analysis
description: How the PETROTuKLAS search index and quiz error analysis work; key gotchas.
---

## Search
- `FULL_CONTENT_INDEX` in `artifacts/api-server/src/routes/search.ts` — ~100 hand-indexed entries covering all 7 chapters (sections, subsections, definitions, formulas). Each entry has: title, excerpt, chapterId, sectionId (e.g. "sec-2-1"), type, keywords[].
- Scoring: title match (+12), keyword match (+8), excerpt match (+4), exact match (+20). Deduped by `title-chapterId`.
- Autocomplete endpoint: `GET /api/search/suggestions?q=` — returns up to 8 suggestions with title, chapterId, type.
- Glossary DB query is wrapped in try/catch so a missing DB doesn't crash the search.
- **Why:** `window.location.search` must be used for URL query params; wouter's `useLocation` only returns the pathname (no query string).

## Quiz Error Analysis
- Added `whyWrong`, `chapterReference`, `suggestedTopic` as optional fields to `QuestionFeedback` in both `lib/api-client-react/src/generated/api.schemas.ts` and the Zod schemas in `lib/api-zod/src/generated/api.ts`.
- Backend `quiz.ts` computes these dynamically for wrong answers: `whyWrong` uses a template with the existing `explanation` field; `chapterReference` from CHAPTER_TITLES_FULL; `suggestedTopic` from `inferSuggestedTopic()` keyword matching.
- **Why:** No DB migration needed — enrichment is 100% computed at submission time. Old quiz results in DB won't have these fields but that's fine since they're optional.

## Frontend Patterns
- Keyword highlighting: naive `text.split(regex)` with `<mark>` wrapping works well.
- Search result links: `/chapter/${chapterId}#${sectionId}` for section deep-links; `/formulas` and `/glossary` for those types.
- Quiz feedback nav dots: `questions.map(...)` with visual state for current / answered / unanswered.
