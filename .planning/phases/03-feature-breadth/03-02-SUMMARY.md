---
phase: 03-feature-breadth
plan: 02
subsystem: ui
tags: [react, react-router, zustand, discovery, personalization, tdd]

# Dependency graph
requires:
  - phase: 03-feature-breadth (Plan 03-01)
    provides: ToolCard component, Badge primitive, recommendedBecause prop
  - phase: 02-auth-persistence-stores
    provides: useAuth() hook, useUsersStore, useFavoritesStore (via ToolCard)
  - phase: 01-foundation
    provides: TOOLS seed catalog, CATEGORIES seed catalog, router placeholder pages
provides:
  - LandingPage hero + 3 value pillars + trusted-by row + 3 CTAs
  - HomePage personalized recommendations (interest-based filter, 9-card cap)
  - CategoriesPage browse-all index with derived tool counts
  - CategoryDetailPage URL-driven per-category list with NotFound fallback
  - HomePage.test.tsx (6 tests, H1–H6) — personalization contract locked
  - CategoryDetailPage.test.tsx (5 tests, CD1–CD5) — URL-driven contract locked
affects: [03-03-search-detail, 03-04-reviews-modal, 03-05-compare-flow, 03-06-submit-tool, 03-07-favorites-profile, 04-polish, 05-pre-demo]

# Tech tracking
tech-stack:
  added: []  # No new dependencies — pure composition of Plan 03-01 + Phase 2 primitives
  patterns:
    - "Discovery pages keep zero local state — every list derives from TOOLS/CATEGORIES + URL/auth context. Mirrors the URL-as-source-of-truth contract from Phase 1."
    - "ToolCard is the single rendering primitive across all four pages — no list authors its own card variant. Confirms the Plan 03-01 contract."
    - "Empty-state-in-same-commit rule: HomePage ships its 'no interests' branch alongside the populated branch; CategoryDetailPage ships its 'no tools' branch alongside the grid."
    - "Personalization reactivity: HomePage subscribes to useUsersStore via a selector (s => userId ? s.findById(userId) : undefined) so Phase 4 profile-edit re-renders home without a hard navigation."
    - "recommendedBecause data flow: tool.category (slug) -> Map(CATEGORIES.map(c => [c.slug, c.name])).get() -> display name. Tool detail tests assert the literal display name 'Coding' (not the lowercase slug 'coding')."

key-files:
  created:
    - "src/pages/CategoryDetailPage.test.tsx (5 tests, CD1–CD5)"
    - "src/pages/HomePage.test.tsx (6 tests, H1–H6)"
  modified:
    - "src/pages/LandingPage.tsx (placeholder -> hero + pillars + trusted-by + 3 CTAs)"
    - "src/pages/HomePage.tsx (placeholder -> personalized grid + empty state)"
    - "src/pages/CategoriesPage.tsx (placeholder -> 10-category grid with counts)"
    - "src/pages/CategoryDetailPage.tsx (placeholder -> filtered grid + NotFound + empty state)"

key-decisions:
  - "Layout grid uses Tailwind defaults `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` for both Categories and CategoryDetail. HomePage uses the same shape. Phase 4 polish will refine; downstream Phase 3 plans (Favorites, Search results, Rankings) should COPY this exact grid signature for visual consistency."
  - "Container width uses `container mx-auto px-4 py-6` for the three list pages, `container mx-auto px-4 py-12` for LandingPage (more vertical breathing room on the hero). Established as the Phase 3 default; downstream plans should follow."
  - "Recommendation cap = 9 (3x3 on the lg breakpoint). Hard-coded as RECOMMENDATION_LIMIT in HomePage. Plan 04 polish can lift this to a 'Show more' affordance."
  - "When user has interests but recommendations resolves empty (won't happen with seed data — every category has 5 tools — but defensive), HomePage falls through to a separate 'No tools match your interests yet' branch. Two distinct empty states keep the message accurate to the user's actual state."
  - "CategoryDetailPage renders <NotFoundPage /> directly on invalid slug (no redirect). Preserves browser-history and shareable-URL semantics — the 404 IS the response, not a downstream effect."
  - "LandingPage 'Skip to Demo' button routes to /signin per CONTEXT.md. Phase 5 hardening will rewire to a pre-seeded demo user auto-fill. No comment-marker needed — the routing destination is self-documenting."
  - "Trusted-by chip set hardcoded to 6 universities (Boston University, MIT, Northeastern, Harvard, Tufts, Wellesley). Reasonable spread for a BU-targeted demo. Easy to refactor to a UNIVERSITIES constant on a real consumer if Phase 4 needs."

patterns-established:
  - "Discovery list pages all use the same grid signature: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`. Downstream Phase 3 plans (Favorites, Search results) should copy verbatim."
  - "Empty-state pattern: `<div className=\"py-12 text-center\"><p className=\"mb-4 text-lg\">[message]</p><Link to=\"/some-target\"><Button>[action]</Button></Link></div>`. Reusable across every list-bearing page in Phase 3."
  - "Personalization data flow: useAuth() -> userId (reactive via session subscription) -> useUsersStore selector (reactive subscription) -> user.interests -> TOOLS.filter -> render. Single chain; Phase 4 profile-edit triggers re-render automatically."

requirements-completed: [DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06]

# Metrics
duration: 7 min
completed: 2026-04-27
---

# Phase 3 Plan 2: Discovery Pages (Landing + Home + Categories + CategoryDetail) Summary

**Four discovery surfaces ugly-but-working: hero LandingPage with 3 CTAs, personalized HomePage with interest-based recommendations and "Recommended because you picked X", CategoriesPage with 10-category grid + derived counts, and URL-driven CategoryDetailPage with NotFound fallback — empty states ship in-commit on every list.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-04-27T22:00:47Z (baseline test run)
- **Completed:** 2026-04-27T22:04:16Z
- **Tasks:** 2 (Task 1: Landing/Categories/CategoryDetail + 5 tests; Task 2: HomePage + 6 tests)
- **Files created:** 2 (HomePage.test.tsx, CategoryDetailPage.test.tsx)
- **Files modified:** 4 (LandingPage.tsx, HomePage.tsx, CategoriesPage.tsx, CategoryDetailPage.tsx — all placeholder -> real)
- **Test delta:** +11 (5 CategoryDetail + 6 HomePage)
- **Total tests (excluding parallel-agent search):** 216 passing (was 201; +11 from this plan, +4 SearchPage from Plan 03-03's parallel work)

## Accomplishments

- **LandingPage** ships the unauthenticated front door: `<h1>Discover the best AI tools for any task</h1>`, subhead, three CTAs (Get Started -> /signup, Browse Tools -> /categories, Skip to Demo -> /signin), three value pillar cards (Discover/Compare/Community), and a "Trusted by students at" row of six university Badges. Tailwind defaults only — no custom typography, no animations.
- **HomePage** ships personalized recommendations: subscribes reactively to `useUsersStore.findById(userId)` for the live user record, filters `TOOLS` by `interests`, caps at 9, and renders `<ToolCard recommendedBecause={CATEGORIES.find(c => c.slug === tool.category).name}>` so each card shows the literal "Recommended because you picked Coding" (display name, not the lowercase slug).
- **CategoriesPage** ships the browse-all index: maps `CATEGORIES` to cards each with name + description + derived tool count (`TOOLS.filter(t => t.category === category.slug).length`). Each card is a `<Link to="/categories/${slug}">`.
- **CategoryDetailPage** ships URL-driven per-category rendering: `useParams<{slug}>()` is the source of truth; invalid slug renders `<NotFoundPage />` directly (no redirect — preserves browser history); empty state ships alongside the grid in the same commit.
- **11 tests** (5 CategoryDetail + 6 HomePage) lock both the URL-driven contract and the personalization contract. CD1–CD3 verify category filtering is correct (not first-N). CD4 verifies invalid slug -> NotFound. CD5 verifies the heading uses display name, not slug. H1 verifies empty interests -> empty state. H2/H3 verify single- and multi-category filtering. H4 verifies the literal "Recommended because you picked Coding" string. H5 verifies the 9-card cap. H6 verifies guest sessions fall through to the empty state.

## Task Commits

Plan executed atomically across 2 commits:

1. **Task 1: Landing + Categories + CategoryDetail + tests** - `62be505` (feat) — replaces three placeholder pages with the discovery browse path; adds CD1–CD5 tests
2. **Task 2: HomePage + tests** - `358a9d5` (feat) — replaces HomePage placeholder with personalized recommendations grid; adds H1–H6 tests

_Note: No TDD discipline applied to Task 1's LandingPage (static, every prop comes from constants — visual verification covered in Plan 03-04 checkpoint per plan note). CategoryDetailPage and HomePage both ship their tests in the same commit as their implementation; not full RED/GREEN split — test-after rather than test-first — matching the plan's task structure._

## Files Created/Modified

### Created
- `src/pages/CategoryDetailPage.test.tsx` — 5 tests (CD1–CD5)
- `src/pages/HomePage.test.tsx` — 6 tests (H1–H6)

### Modified
- `src/pages/LandingPage.tsx` — Phase 1 placeholder -> hero + 3 CTAs + 3 value pillars + 6-university trusted-by row
- `src/pages/HomePage.tsx` — Phase 1 placeholder -> personalized recommendations grid with two empty-state branches (no interests / no recommendations)
- `src/pages/CategoriesPage.tsx` — Phase 1 placeholder -> 10-category grid with derived tool counts and slug-based links
- `src/pages/CategoryDetailPage.tsx` — Phase 1 placeholder -> URL-driven filtered ToolCard grid with NotFound + empty state

## Decisions Made

- **Grid signature established:** `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` for every list-bearing page in Phase 3. Downstream plans (Favorites, Search results, Rankings) should COPY VERBATIM.
- **Container signature established:** `container mx-auto px-4 py-6` for list pages; `container mx-auto px-4 py-12` for the LandingPage hero. Downstream plans should follow.
- **Recommendation cap = 9** (matches the 3x3 lg breakpoint exactly). Hard-coded as `RECOMMENDATION_LIMIT` in `HomePage.tsx`. Phase 4 polish can lift to "Show more" affordance.
- **Two distinct empty states on HomePage:** `interests=[]` -> "You haven't picked any interests yet" and `recommendations=[]` -> "No tools match your interests yet". The second branch can't fire with current seed data (every category has 5 tools) but is shipped defensively for resilience against future data shape changes.
- **Invalid slug renders NotFoundPage directly, no redirect.** Preserves shareable-URL semantics: a broken /categories/foobar link STAYS on the broken URL with a 404 view, rather than silently redirecting and losing the failure signal.
- **"Skip to Demo" routes to /signin** (per CONTEXT.md). Phase 5 hardening will rewire to a pre-seeded demo-user auto-fill. The signin destination is self-documenting; no comment-marker added.
- **Trusted-by chip set hardcoded as 6 universities.** Boston University, MIT, Northeastern, Harvard, Tufts, Wellesley — reasonable spread for the BU-targeted demo audience. Tradeoff favored simplicity over a global config.
- **HomePage subscribes to useUsersStore via a selector, not via useAuth().currentUser.** useAuth() returns currentUser non-reactively (one-time getState() lookup); a selector subscription on useUsersStore IS reactive. This matters for Phase 4 profile-edit: changing interests must re-render /home without a navigation. Documented inline in HomePage.tsx and in this summary's patterns-established.

## Deviations from Plan

None — plan executed exactly as written.

The plan's verify gates (vitest, tsc --noEmit, all the grep checks for required strings) passed first try. ESLint passed without changes. Build (`npm run build`) green. No auto-fixes needed.

**Note on parallel agent (Plan 03-03):** Plan 03-03 ran in parallel and created `src/features/search/` (SearchBar, SearchPage tests, fuse.js dependency). At the time of this plan's commits, `src/features/search/components/SearchBar.test.tsx` had 6 failing tests (jsdom timeout on a click-outside-to-close interaction). Those failures are entirely in 03-03's scope — this plan's files (LandingPage, HomePage, CategoriesPage, CategoryDetailPage) have zero overlap with that test file. Per the plan's critical_environment_note: "no file overlap — they should not conflict." Confirmed via `git status` — only `src/pages/*` and `src/features/search/*` changed; no shared files. Verified by running the test suite excluding `src/features/search/**`: **29 test files / 216 tests passing** (201 baseline + 11 from this plan + 4 from 03-03's SearchPage tests which DO pass).

---

**Total deviations:** 0
**Impact on plan:** Plan executed exactly as specified. All verify gates passed first try.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03-03 (Wave 3: Search + Tool Detail):**
- ToolCard remains the canonical card primitive — already used in `/categories/:slug` and `/home`. Plan 03-03's `/search?q=...` results grid should copy the same `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` signature established here.
- Plan 03-03 is partially in-flight (SearchBar + SearchPage tests already committed at `ec93e3b` by the parallel agent). No conflict with this plan's files.

**Ready for Plan 03-04 (Wave 3: Reviews modal):**
- ToolDetailPage (Plan 03-03) will be the host for the Write Review Dialog (Plan 03-04).

**Ready for Plan 03-05 (Wave 4: Compare flow):**
- Compare picker should reuse the same grid signature for the tool-picker step. ToolCard reusable.

**Ready for Plan 03-06 (Wave 4: Submit a Tool):**
- No discovery-page coupling.

**Ready for Plan 03-07 (Wave 4: Favorites + Profile):**
- `/favorites` should reuse the discovery grid signature exactly. ToolCard reusable. Profile's "Saved Comparisons" reads from useSavedComparisonsStore (Plan 03-01).

### Patterns Downstream Plans MUST Follow

1. **Grid signature:** `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` — verbatim, no variants.
2. **Container signature:** `container mx-auto px-4 py-6` for list pages.
3. **Empty state pattern:** centered `py-12 text-center` block with `text-lg` message, `mb-4` spacing, and a `<Link><Button>[action]</Button></Link>` CTA.
4. **NotFound on invalid URL params:** render `<NotFoundPage />` directly, do not redirect — preserves URL/history semantics.
5. **Empty state in same commit as list:** every list-bearing plan must ship its empty state alongside the populated path. Phase 3 contract.

---

*Phase: 03-feature-breadth*
*Plan: 02 (Wave 2 — Discovery)*
*Completed: 2026-04-27*

## Self-Check: PASSED

Verified:
- All 4 modified files exist on disk: `src/pages/LandingPage.tsx`, `src/pages/HomePage.tsx`, `src/pages/CategoriesPage.tsx`, `src/pages/CategoryDetailPage.tsx`
- Both created test files exist: `src/pages/CategoryDetailPage.test.tsx`, `src/pages/HomePage.test.tsx`
- Both task commits present in `git log`: `62be505` (Task 1), `358a9d5` (Task 2)
- All 11 new tests pass: `vitest run src/pages/CategoryDetailPage.test.tsx src/pages/HomePage.test.tsx` -> 11/11
- Full non-parallel suite green: 216/216 (excluding `src/features/search/**` which is 03-03's territory)
- Build green: `npm run build` produces `dist/` artifacts (513 kB main bundle, 1.47s)
- All grep gates from plan verify blocks passed: hero string, three CTAs, "Trusted by students", useParams, NotFoundPage import, ToolCard import, TOOLS.filter, CATEGORIES.map, useAuth, interests, recommendedBecause, "Browse Categories", interests-empty branch, TOOLS.filter on HomePage
- ESLint clean on all 6 affected files
