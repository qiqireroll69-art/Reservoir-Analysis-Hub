---
name: Glossary DB Setup
description: How the Talasalitaan (glossary) feature is seeded and what was broken
---

## Rule
The glossary_terms table is defined in lib/db/src/schema/glossary.ts but has no auto-seed. After a fresh environment or DB reset, the Talasalitaan page will show empty ("Walang nahanap na salita") until seeded.

## How to apply
1. `pnpm --filter @workspace/db push` — creates/updates all tables
2. `node lib/db/seed-glossary.mjs` — seeds 99 terms across A–Z, covering all 7 chapters

## What was broken (root cause)
- The `/glossary` route and `Glossary.tsx` component were fully functional
- The `glossary_terms` database table existed but contained 0 rows
- Seeding was the only fix needed — no code changes required

## Video file permissions
- Files copied via `cp` in the workspace get permissions from the source file
- `volatile-oil.mp4` was copied with 600 (owner-only) permissions
- Must `chmod 644` any video file copied into `public/` or Vite won't serve it to browsers
- All files in `public/videos/` already have 644 from original setup

**Why:** Vite's static file serving works fine but the file must be world-readable. The dev server runs as the same user so it can read 600 files, but the browser request goes through the proxy which may not be the same uid.
