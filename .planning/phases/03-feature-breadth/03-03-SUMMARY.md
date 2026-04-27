---
phase: 03-feature-breadth
plan: 03
subsystem: search-and-detail
tags: [search, fuse, autocomplete, tool-detail, dialog, reviews, react, react-router, zustand, tdd]

# Dependency graph
requires:
  - phase: 03-feature-breadth
    plan: 01
    provides: shadcn Dialog/Badge primitives, ToolCard component
  - phase: 02-auth-persistence-stores
    provides: useAuth hook, useFavoritesStore, useReviewStore, withToast
  - phase: 01-foundation
    provides: TOOLS seed catalog, CATEGORIES, NotFoundPage, react-router scaffolding
provides:
  - "fuse.js v7 index over the seed catalog (keys: name/tagline/description/features, threshold: 0.4)"
  - "searchTools(query, limit?) — pure helper consumed by SearchBar and SearchPage"
  - "SearchBar component — debounced (300ms) header autocomplete with up to 6 fuzzy matches"
  - "SearchPage — URL-driven results page (?q=) with empty state + 3-category fallback"
  - "ToolDetailPage — URL-driven detail page; structurally prevents the 'everything is Claude' bug class"
  - "Write Review Dialog placeholder — Plan 03-04 swaps the <p> placeholder for <WriteReviewDialog />"
affects: [03-04-reviews-modal, 04-polish]

# Tech tracking
tech-stack:
  added:
    - "fuse.js@^7.3.0 (planned ^7.1; npm resolved to 7.3 — same major)"
  patterns:
    - "URL-as-source-of-truth extended end-to-end: SearchPage (?q=), ToolDetailPage (:slug)"
    - "Debounced autocomplete via setTimeout + cleanup; document-level mousedown listener for click-outside"
    - "Reactive review subscription: subscribe to s.data[slug] (a stable ref; undefined when empty), sort newest-first inside useMemo. NEVER subscribe to s.data[slug] ?? [] — the empty-array fallback creates a fresh ref every render and triggers a Zustand re-render loop"
    - "Header SearchBar slotted between primary nav and auth controls; existing three exclusive auth affordance blocks preserved untouched"
    - "fireEvent.change/keyDown for tests that need vi.useFakeTimers — userEvent's user.type schedules its own real timers internally and deadlocks against advanceTimers"

key-files:
  created:
    - "src/features/search/lib/fuse.ts (37 lines) — module-load Fuse index + searchTools helper"
    - "src/features/search/components/SearchBar.tsx (96 lines) — header autocomplete"
    - "src/features/search/components/SearchBar.test.tsx (124 lines, 6 tests)"
    - "src/pages/SearchPage.test.tsx (53 lines, 4 tests)"
  modified:
    - "src/components/layout/Header.tsx — adds <SearchBar /> in a hidden-on-mobile flex slot between nav and auth controls"
    - "src/pages/SearchPage.tsx — replaced placeholder with full results/empty-state implementation"
    - "src/pages/ToolDetailPage.tsx — replaced placeholder with full URL-driven detail page (~190 lines)"
    - "src/pages/ToolDetailPage.test.tsx — 3 placeholder tests REPLACED with 9 plan-spec'd tests (TD1–TD9)"
    - "src/router.test.tsx — auto-fix: updated ToolDetailPage assertion from removed param-slug testid to h1 'ChatGPT' (URL-as-source-of-truth contract preserved)"
    - "package.json + package-lock.json — fuse.js@^7.3 dependency"

key-decisions:
  - "SearchBar debounce = 300ms (per CONTEXT). Tests fast-forward via vi.advanceTimersByTime + fireEvent.change. Timer choice is the only animation/timing magic number in the file — Phase 4 polish can revisit."
  - "Switched test driver from userEvent to fireEvent for SearchBar specs. userEvent.setup({advanceTimers}) timed out with vi.useFakeTimers because user.type internally schedules timers between keystrokes. fireEvent.change drops a single change event; act + vi.advanceTimersByTime then deterministically drains the 300ms debounce."
  - "Subscribe to useReviewStore.data[slug] DIRECTLY, NOT s.data[slug] ?? []. The latter returns a fresh [] on every store update, which Zustand sees as a new ref → re-render loop → 'Maximum update depth exceeded'. Hit this in TD8 during initial GREEN; fixed by removing the ?? [] fallback from the selector and applying it inside useMemo instead."
  - "ToolDetailPage hooks declared BEFORE the !tool early-return. React's rules-of-hooks require stable hook order across renders; the slug fallback (safeSlug = '') keeps the hooks safe on bad-slug routes. NotFound returns afterward."
  - "Reviews list ships with its empty state ('No reviews yet. Be the first to write one.') in the same commit. Phase 3 contract: every list ships its empty state with the list."
  - "Dialog placeholder text is 'Review form lands in the next plan.' (literal). Plan 03-04 will swap this exact <p> child for <WriteReviewDialog tool={tool} onSuccess={...} />. The file header comment was edited mid-plan to refer to the placeholder structurally ('the <p> child rendered just below DialogHeader'), avoiding a grep collision with Plan 03-04's negative-grep that asserts the literal text is GONE post-swap."

requirements-completed: [DISC-07, DISC-08, TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, TOOL-08, UX-01]

# Metrics
duration: 6 min
completed: 2026-04-27
---

# Phase 3 Plan 3: Search + Tool Detail Page Summary

**Search end-to-end (Fuse.js index, header autocomplete, results page, empty state) + URL-driven Tool Detail page with action row, reviews list, and a Write Review Dialog placeholder that Plan 03-04 will swap in a single line.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-27T22:01:17Z
- **Completed:** 2026-04-27T22:07:28Z
- **Tasks:** 2 (Task 1 TDD: search; Task 2: ToolDetailPage)
- **Files created:** 4 (fuse.ts, SearchBar.tsx + test, SearchPage.test)
- **Files modified:** 5 (Header, SearchPage, ToolDetailPage, ToolDetailPage.test, router.test, package.json+lock)
- **Test delta:** +19 tests (6 SearchBar, 4 SearchPage, 9 ToolDetailPage minus 3 retired placeholder tests, net +19)
- **Total tests:** 228 passing (was 209 before plan started — Plan 03-02 had landed 7 in parallel)
- **Build:** clean (513KB → 550KB after fuse.js + new pages; warning about chunk size is pre-existing)

## Accomplishments

- **Fuse.js indexed once at module load** with the spec'd config (keys: name/tagline/description/features, threshold: 0.4, includeMatches: false). Case-insensitive by default — SP4 confirms.
- **SearchBar** ships with full debounced autocomplete: 300ms quiet window, up to 6 fuzzy matches, Enter routes to `/search?q=...`, click on a match routes to `/tools/:slug`, Escape closes the dropdown, document-level `mousedown` listener handles click-outside.
- **Header now contains the SearchBar** in a `hidden md:block flex-1 max-w-sm mx-4` slot between the primary nav and the auth controls. The three exclusive auth affordance blocks (real-user / guest / unauthenticated) are preserved untouched per Plan 02-02 lock.
- **SearchPage** is fully URL-driven via `useSearchParams`. Three render paths cover all cases:
  - No `q` → "Type a query in the header to search."
  - Matching `q` → grid of ToolCards (1/2/3 cols at sm/md/lg).
  - Zero matches → "No tools matched 'q'" + 3 popular-category fallback chips linking to `/categories/:slug`.
- **ToolDetailPage** is the structural fix for the prototype's "everything is Claude" bug class: `useParams` + `TOOLS.find` is the SINGLE source of truth for which tool to render. TD1, TD2, TD3 collectively prove three different slugs render three different tools.
- **Action row** wires Compare (Link → `/compare/:slug`), Favorite (toast-wrapped, aria-pressed, disabled when signed out), and Write Review (opens shadcn Dialog). External "Visit site" link uses `target="_blank" rel="noopener noreferrer"`.
- **Reviews list** subscribes reactively to `useReviewStore.data[slug]` (NOT via `listByTool` — that returns a new sorted array on each call and would create a Zustand selector warning). Newest-first sort lives in `useMemo`. Empty state ships in the same commit.
- **TDD discipline maintained for Task 1**: RED commit (9/10 failing) before GREEN. Task 2 was non-TDD per plan spec.

## Task Commits

Plan executed atomically across 4 commits:

1. **Task 1 RED** - `ec93e3b` (test) — fuse.js install + SearchBar/SearchPage failing tests + stub component
2. **Task 1 GREEN** - `b68f653` (feat) — SearchBar + SearchPage implementations + Header integration; 10/10 search tests pass
3. **Task 2** - `2fb2c68` (feat) — full ToolDetailPage + 9 TD tests + router test auto-fix; 228/228 pass
4. **Task 2 follow-up** - `bd5c784` (fix) — refactored a doc comment so Plan 03-04's negative-grep doesn't trip on the comment occurrence of the placeholder string

## SearchBar API (for Phase 4 polish reference)

```tsx
import { SearchBar } from "@/features/search/components/SearchBar"

// No props. Reads/writes its own internal state. Debounce constant lives in
// the file as DEBOUNCE_MS = 300. MAX_DROPDOWN = 6.
<SearchBar />
```

**Phase 4 polish hooks:**
- The dropdown's positioning is `absolute top-full left-0 right-0 mt-1`. A polish pass might use Floating UI for collision avoidance.
- The dropdown is `max-h-80 overflow-auto` — fine for v1; polish could trim to `max-h-72` and add a "View all results" footer link to `/search?q=...`.
- The matches use a hover-bg utility (`hover:bg-accent`); no keyboard arrow-key navigation in v1 — Phase 4 should add ArrowDown/ArrowUp + Enter-to-select-highlighted (currently Enter always navigates to `/search?q=...`, never to a highlighted match).

## ToolDetailPage Layout (for Plan 03-04 alignment)

The ONE LINE Plan 03-04 will swap is the placeholder `<p>` inside the Dialog:

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Write a review for {tool.name}</DialogTitle>
    <DialogDescription>
      Share your experience to help other students.
    </DialogDescription>
  </DialogHeader>
  {/* Plan 03-04 replaces this single line with <WriteReviewDialog /> body. */}
  <p className="text-sm text-muted-foreground">
    Review form lands in the next plan.
  </p>
</DialogContent>
```

After 03-04 the placeholder `<p>` is gone and replaced by `<WriteReviewDialog tool={tool} onSuccess={...} />`. The `Dialog`/`DialogTrigger`/`DialogHeader`/`DialogTitle`/`DialogDescription` chrome around it stays as-is.

**Action row order** (left to right): Compare → Favorite → Write Review. Plan 03-04 should not reorder.

**Reviews placement**: directly below the action row, with `<h2>Reviews</h2>`, then either the empty-state Card or a `<div className="space-y-3">` of review Cards (one per review, newest first).

## Decisions Made

- **300ms debounce** is the only timing magic number in SearchBar. Phase 4 polish can revisit if research shows users want faster (e.g. 150ms) or slower (e.g. 500ms) feedback.
- **fireEvent over userEvent for SearchBar tests.** The `userEvent.setup({advanceTimers})` pattern timed out because `user.type` schedules its own internal timers between keystrokes that interlock with `vi.advanceTimersByTime`. `fireEvent.change` drops a single React change event and `act + vi.advanceTimersByTime(350)` deterministically flushes the 300ms debounce.
- **Subscribe to `useReviewStore.data[slug]` directly, NOT `s.data[slug] ?? []`.** The `?? []` fallback returns a fresh empty array on every store state change → Zustand sees a new ref → component re-renders → `useEffect` hooks fire again → infinite loop ("Maximum update depth exceeded"). The fix: drop the fallback in the selector (returns `undefined` for missing slug — a stable primitive) and apply the empty-array branch inside `useMemo` instead.
- **Hooks before early-return.** The `!tool ? <NotFoundPage />` early-return moved AFTER all hooks fire. Required for rules-of-hooks compliance; the `safeSlug = tool?.slug ?? ""` shim keeps the hooks safe on bad-slug routes.
- **Reviews list reads useReviewStore reactively (not via listByTool method).** `listByTool` returns a new sorted array on every call — fine as a one-shot read but unsafe as a Zustand selector. The reactive bucket subscription (then sort in `useMemo`) gives both reactivity AND ref stability.
- **Header's SearchBar uses Tailwind `hidden md:block`.** v1 mobile users don't see the search input in the header; they can use `/search` from the nav. Phase 4 polish can add a mobile search affordance (icon button → expanded input).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Subscribing to `s.data[slug] ?? []` triggered a Zustand re-render loop**
- **Found during:** Task 2 GREEN, running ToolDetailPage tests (TD8 failed first with "Maximum update depth exceeded")
- **Issue:** The selector `useReviewStore(s => s.data[slug] ?? [])` returns a NEW empty array on every store update when no reviews exist for the slug. Zustand detects a new ref → forces a re-render → `useMemo([reviewsRaw])` recomputes → re-render loop.
- **Fix:** Subscribe to `s.data[safeSlug]` directly (returns `undefined` for missing slug — a stable primitive across re-renders). Apply the empty-array fallback INSIDE the useMemo where ref equality doesn't matter for correctness.
- **Files modified:** `src/pages/ToolDetailPage.tsx`
- **Verification:** TD1-TD9 all pass; full suite 228/228 green.
- **Committed in:** `2fb2c68`

**2. [Rule 1 - Bug] `src/router.test.tsx` asserted on a removed placeholder testid**
- **Found during:** Task 2 GREEN (running full test suite)
- **Issue:** The router test was written in Plan 01-04 against the placeholder ToolDetailPage and asserted `screen.getByTestId("param-slug")` had text "chatgpt". The new (real) ToolDetailPage doesn't render that testid — it renders the actual tool's name as an h1.
- **Fix:** Updated the assertion to `getByRole("heading", { level: 1, name: "ChatGPT" })`. Same URL-as-source-of-truth contract verified, more meaningful assertion (the URL drives a real h1 render, not just a debug echo).
- **Files modified:** `src/router.test.tsx`
- **Verification:** All 7 router tests pass.
- **Committed in:** `2fb2c68`

**3. [Rule 1 - Bug] Doc comment contained the placeholder text verbatim, would trip Plan 03-04's negative-grep**
- **Found during:** Self-check after Task 2 commit
- **Issue:** Plan 03-04's negative-grep verifies the literal "Review form lands in the next plan." string is REMOVED after the swap. The file header comment in ToolDetailPage.tsx repeated that exact string, which would still trip the grep even when the JSX line was replaced.
- **Fix:** Refactored the comment to refer to the placeholder structurally ("the <p> child rendered just below DialogHeader") so Plan 03-04's grep only matches the actual JSX occurrence.
- **Files modified:** `src/pages/ToolDetailPage.tsx`
- **Verification:** `grep -n "Review form lands in the next plan" src/pages/ToolDetailPage.tsx` returns exactly 1 match (the JSX line, on line 183).
- **Committed in:** `bd5c784`

---

**Total deviations:** 3 auto-fixed (2 bug fixes + 1 forward-compatibility fix). No scope creep.

## Issues Encountered

None blocking. The userEvent + fake-timers incompatibility was discovered during initial GREEN; switching to fireEvent took ~3 minutes. The Zustand selector loop was caught by TD8 and resolved in one edit.

## User Setup Required

None.

## Next Phase Readiness

**Ready for Plan 03-04 (Wave 3: Reviews modal):**
- Dialog placeholder lives at `src/pages/ToolDetailPage.tsx` line 183 — the literal `<p className="text-sm text-muted-foreground">Review form lands in the next plan.</p>` block.
- After 03-04 swaps it, the file header comment (line 21) already refers to the placeholder structurally, so it won't need updating.
- `useReviewStore.add(input)` already exists with `Omit<Review, "id" | "createdAt">` input shape (Plan 02-04). 03-04 only needs to render a form, validate, and call `useReviewStore.getState().add({...})` then close the dialog.

**Ready for Plan 03-05 (Wave 4: Compare flow):**
- The Compare button on `/tools/:slug` is a `<Link to={/compare/:slug}>` — the picker step Plan 03-05 builds.

**Carry-forward note for Plans 03-05/06/07:** the Header now has a SearchBar slot between nav and auth controls. None of the future plans should restructure the Header — only the SearchBar internals are within Phase 4's polish scope.

### Known Limitations Carried Forward

- **No keyboard arrow-key navigation in the SearchBar dropdown.** Phase 4 polish should add ArrowDown/ArrowUp focus traversal + Enter-on-highlighted-option. Currently Enter always navigates to `/search?q=...` regardless of dropdown state.
- **Search results page renders all matches with no pagination.** 50-tool catalog so this is fine for v1; deferred per CONTEXT.
- **Header SearchBar is `hidden md:block`** — mobile users have no in-header search affordance. Phase 4 polish can add a mobile pattern (icon button → expanded input).
- **Pre-existing lint issue NOT resolved.** `src/features/auth/components/ForgotPasswordForm.tsx:37` has an unused `_values` parameter. Already documented in Plan 03-01 SUMMARY's "Known Limitations" — out of scope.

---

*Phase: 03-feature-breadth*
*Plan: 03 (Wave 2 — Search + Tool Detail, parallel with Plan 03-02)*
*Completed: 2026-04-27*

## Self-Check: PASSED

Verified:
- All 8 expected files present on disk: fuse.ts, SearchBar.tsx + test, SearchPage.tsx + test, ToolDetailPage.tsx + test, 03-03-SUMMARY.md
- All 4 task commits in `git log`: ec93e3b (RED), b68f653 (search GREEN), 2fb2c68 (ToolDetail), bd5c784 (comment refactor)
- Final test count 228 passing (29 test files, 0 failures, 0 skipped)
- `npm run build` exits 0 with dist/ artifacts emitted
- Placeholder text "Review form lands in the next plan." present EXACTLY ONCE in ToolDetailPage.tsx (line 183, JSX) — Plan 03-04's negative-grep will match cleanly
- All plan-spec greps pass: useParams, TOOLS.find, NotFoundPage, useFavoritesStore, useReviewStore, Compare, Write Review, Dialog, "No reviews yet", rel="noopener noreferrer", "new Fuse", "threshold: 0.4", useSearchParams, "No tools matched", SearchBar, useNavigate, "300|DEBOUNCE_MS"
