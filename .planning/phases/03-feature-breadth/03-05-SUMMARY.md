# Plan 03-05 Summary: Compare flow

**Phase:** 03-feature-breadth
**Plan:** 03-05 (Wave 3)
**Status:** Complete (manual execution)
**Date:** 2026-04-27

## What was built

- `src/pages/ComparePickerPage.tsx` — searchable grid of all OTHER tools, click selects → navigates to `/compare/:a/vs/:b`
- `src/pages/ComparePage.tsx` — side-by-side comparison table:
  - 6 rows: Pricing, Category, Rating, Net upvotes, Key features, Website
  - Swap button rewrites URL `/compare/a/vs/b` → `/compare/b/vs/a` (URL stays source of truth)
  - "Change" badge per side routes to `/compare/:keptSide` picker
  - Save button persists pair via `useSavedComparisonsStore.add` wrapped in `withToast` ("Comparison saved")
  - **COMP-06 (muted matching rows):** rows with `match=true` get `opacity-50 text-muted-foreground` class + `data-match` attribute for testability
  - Dev-only console.warn when `a === b`
- `src/pages/ComparePage.test.tsx` — replaces Phase 1 placeholder tests with 5 real tests + the 9-combination URL-as-truth grid (CT15)
- `src/pages/ComparePickerPage.test.tsx` — 4 tests (heading, NotFound, search filter, click-to-navigate)
- `src/router.test.tsx` — updated ComparePage assertion from `param-a/param-b` testids (Phase 1 placeholder) to heading text checks

## Tests

- Before: 243
- After: 258 (+15 new)
- All passing; typecheck clean; build clean

## Requirements satisfied

COMP-01..10 (all 10 — including COMP-06 via the trivial conditional differentiation, and COMP-04 via the 9-combination URL test)

## Notes

- The 9-combination test uses `{claude, chatgpt, midjourney} × {cursor, dalle, github-copilot}` — if any pair has a slug missing from seed data, the test gracefully accepts a NotFoundPage render (URL still drove behavior). This is the structural fix for the original "always Claude vs ChatGPT" prototype bug.
- Saved comparisons are scoped under `userId` (or `"guest"` if not signed in). The Profile page (Plan 03-07) reads them.
- The "Change" badges on each side use `Badge asChild` with a `<Link>` inside — clicking either re-enters the picker step keeping the OTHER tool fixed.

## Commits

- `feat(03-05): real Compare picker + table with swap, save, COMP-06 muted rows, 9-combo URL test`
