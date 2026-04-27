---
phase: 03-feature-breadth
plan: 01
subsystem: ui
tags: [shadcn, dialog, badge, select, textarea, react, zustand, zod, tdd]

# Dependency graph
requires:
  - phase: 02-auth-persistence-stores
    provides: useAuth() hook, useFavoritesStore, withToast, storage helpers
  - phase: 01-foundation
    provides: shadcn radix-nova preset, Tool type, TOOLS seed catalog
provides:
  - shadcn Dialog primitive (used by Plan 03-04 Write Review modal)
  - shadcn Badge primitive (used by ToolCard pricing+category, Plan 03-03 vote count display)
  - shadcn Select primitive (used by Plan 03-06 Submit Tool category dropdown)
  - shadcn Textarea primitive (used by Plan 03-04 Write Review body, Plan 03-06 Submit Tool description)
  - ToolCard component — canonical tool rendering primitive (used by every list in Plans 03-02 through 03-07)
  - useSavedComparisonsStore — read/write API for Plans 03-05 (Save) and 03-07 (Profile read)
  - localStorage key aitools:saved-comparisons:global (per-user nested data shape)
affects: [03-02-search-discovery, 03-03-rankings-detail, 03-04-reviews-modal, 03-05-compare-flow, 03-06-submit-tool, 03-07-favorites-profile, 04-polish, 05-pre-demo]

# Tech tracking
tech-stack:
  added:
    - "shadcn dialog primitive (radix-ui DialogPrimitive)"
    - "shadcn badge primitive (cva-based variants)"
    - "shadcn select primitive (radix-ui SelectPrimitive)"
    - "shadcn textarea primitive (native textarea forwardRef)"
  patterns:
    - "ToolCard is the single rendering primitive — every list in Phase 3 imports and reuses it; no list authors its own card variant"
    - "Stores keyed under aitools:<domain>:global with per-user data nested under data.userId — mirrors Plan 02-04's four non-auth stores; consistent across the codebase"
    - "Components consume useAuth() for userId, NOT raw useAuthStore subscriptions — preserves the Phase 2 facade pattern"
    - "Persisting actions wrap their store call in withToast({success: '...'}) — preserves the Phase 2 toast convention"
    - "shadcn ui/ files canonically co-locate component + variants/hooks (e.g. Badge + badgeVariants); eslint config now suppresses react-refresh/only-export-components for src/components/ui/**"

key-files:
  created:
    - "src/components/ui/dialog.tsx (168 lines)"
    - "src/components/ui/badge.tsx (49 lines)"
    - "src/components/ui/select.tsx (190 lines)"
    - "src/components/ui/textarea.tsx (18 lines)"
    - "src/features/tools/components/ToolCard.tsx (96 lines)"
    - "src/features/tools/components/ToolCard.test.tsx (190 lines, 11 tests)"
    - "src/features/compare/store.ts (96 lines)"
    - "src/features/compare/store.test.ts (98 lines, 8 tests)"
  modified:
    - "eslint.config.js — fixed broken react-hooks plugin path; suppressed react-refresh rule for ui/"

key-decisions:
  - "Used shadcn's auto-add for all four primitives (no hand-write fallback needed unlike Plan 02-02's form primitive). Registry returned full implementations for dialog/badge/select/textarea against the radix-nova preset."
  - "ToolCard heart uses preventDefault + stopPropagation belt-and-suspenders. The heart sits absolute-positioned outside the Link in the current layout, but the handler defends against future layouts that may nest it inside."
  - "TC9 test was rewritten during GREEN: from inspecting event.defaultPrevented (unreliable across React synthetic + native listener boundary) to asserting a parent click handler does NOT see the bubbled event. This directly tests the stopPropagation contract."
  - "Saved-comparisons store NOT wired into authStore.clearGuestData(). The Plan 02-01 wire enumerates four stores by hardcoded path (favorites, rankings, reviews, submit). Documented as KNOWN LIMITATION; Phase 5 hardening can extend the enumeration."
  - "Category chip displays the raw category slug (lowercase), not the human-readable Category.name. Plan-specified for v1; Phase 4 polish will swap to display name once design lands."

patterns-established:
  - "ToolCard prop API for downstream plans: { tool: Tool; recommendedBecause?: string }"
  - "Saved-comparisons SavedComparison shape: { a: string; b: string; savedAt: string } where a < b ascending"
  - "ToolCard is the import path for any list: import { ToolCard } from '@/features/tools/components/ToolCard'"

requirements-completed: [UX-01, UX-06, COMP-10, USER-04]

# Metrics
duration: 6 min
completed: 2026-04-27
---

# Phase 3 Plan 1: Wave 1 Foundation Summary

**Four shadcn primitives (dialog/badge/select/textarea), the canonical ToolCard component, and useSavedComparisonsStore — every Phase 3 list, modal, and form now has its imports ready.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-27T21:49:50Z
- **Completed:** 2026-04-27T21:55:52Z
- **Tasks:** 2 (Task 1: shadcn add; Task 2: TDD ToolCard + saved-comparisons)
- **Files created:** 8
- **Files modified:** 1 (eslint.config.js)
- **Test delta:** +19 (11 ToolCard + 8 saved-comparisons store)
- **Total tests:** 201 passing (was 182)

## Accomplishments

- Four shadcn primitives installed via `npx shadcn add` against the radix-nova preset; full implementations returned by the registry (no hand-write fallback needed unlike Plan 02-02's form primitive). No new `@radix-ui/react-*` packages — all four use the existing `radix-ui` meta-package.
- ToolCard component renders a Tool with logo, name, tagline, optional "Recommended because" line, pricing Badge, category Badge, and a Favorite heart with full `aria-pressed` toggle states. Disabled when signed out (userId null).
- Heart click is wired to `useFavoritesStore.toggle(userId, slug)` wrapped in `withToast({ success })` — toast wording "Added to favorites" / "Removed from favorites" matches the CONTEXT decisions exactly. `preventDefault + stopPropagation` ensure the click never navigates.
- `useSavedComparisonsStore` provides `add / remove / list / clearByUser` with canonical pair ordering (a < b ascending) for stable dedup. Persists at `aitools:saved-comparisons:global` with the `{version: 1, data}` envelope.
- TDD discipline maintained: RED commit before GREEN, both modules' tests fail at module-import time before implementation, then 19/19 pass after.

## Task Commits

Plan executed atomically across 3 commits:

1. **Task 1: Install shadcn primitives** - `fe23716` (feat) — adds dialog/badge/select/textarea + fixes eslint config (Rule 3 blocking)
2. **Task 2 RED: failing tests** - `b91bb0c` (test) — 19 failing tests for ToolCard + useSavedComparisonsStore
3. **Task 2 GREEN: implementations** - `718b955` (feat) — production code makes all 19 tests pass; full suite 201/201

_Note: TDD task produced 2 commits (test → feat). No refactor commit — implementation was clean from GREEN._

## Files Created/Modified

### Created
- `src/components/ui/dialog.tsx` — Dialog/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose
- `src/components/ui/badge.tsx` — Badge component + badgeVariants (default, secondary, destructive, outline)
- `src/components/ui/select.tsx` — Select/SelectContent/SelectTrigger/SelectItem/SelectGroup/SelectLabel/SelectValue
- `src/components/ui/textarea.tsx` — Textarea forwardRef wrapper
- `src/features/tools/components/ToolCard.tsx` — canonical tool card primitive
- `src/features/tools/components/ToolCard.test.tsx` — 11 tests (TC1–TC10 + TC10b)
- `src/features/compare/store.ts` — useSavedComparisonsStore
- `src/features/compare/store.test.ts` — 8 tests (SC1–SC8)

### Modified
- `eslint.config.js` — fixed broken `eslint-plugin-react-hooks` import path (was `configs.flat.recommended`, now `configs['recommended-latest']`); added a per-directory override that disables `react-refresh/only-export-components` for `src/components/ui/**` (false-positives on shadcn's canonical pattern of co-locating Component + variants).

## Decisions Made

- **Used shadcn auto-add for all four primitives.** Plan 02-02's form primitive required hand-write because the registry returned an empty entry — that didn't recur here. Dialog/Badge/Select/Textarea registry entries are all complete in the current radix-nova preset.
- **ToolCard prop API: `{ tool: Tool; recommendedBecause?: string }`.** Optional `recommendedBecause` consumed by /home recommendations only; absent on /search, /categories, /favorites cards.
- **Saved-comparisons NOT wired into clearGuestData().** Documented as a known limitation in `src/features/compare/store.ts`. Plan 02-01's `clearGuestData()` enumerates four stores by hardcoded path. Extending it requires touching authStore — out of scope for this plan, deferred to Phase 5 hardening.
- **Category chip uses the raw slug as label.** Plan-specified for v1. Phase 4 polish will look up `CATEGORIES.find(c => c.slug === tool.category).name` for human-readable display.
- **TC9 test rewritten during GREEN.** Original assertion was `event.defaultPrevented === true` observed by a later-attached DOM listener — unreliable across React synthetic + native event boundary. New assertion: a parent `<div onClick={parentClick}>` wrapping the ToolCard does NOT see the heart click — directly tests the `stopPropagation` contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing eslint config breakage**
- **Found during:** Task 1 (running lint verification gate)
- **Issue:** `eslint.config.js` referenced `reactHooks.configs.flat.recommended`, but the installed `eslint-plugin-react-hooks` no longer exposes `configs.flat`. ESLint crashed with "Cannot read properties of undefined (reading 'recommended')" on every file. The acceptance criterion "eslint on the four new files exits 0" was unreachable.
- **Fix:** Switched to `reactHooks.configs['recommended-latest']` (the current flat-config-compatible export). Then added a per-directory override to disable `react-refresh/only-export-components` for `src/components/ui/**` — that rule false-positives on shadcn's canonical co-location of Component + variants (Badge + badgeVariants, Button + buttonVariants).
- **Files modified:** `eslint.config.js`
- **Verification:** `node ./node_modules/eslint/bin/eslint.js src/components/ui/{dialog,badge,select,textarea}.tsx` exits 0
- **Committed in:** `fe23716` (Task 1 commit)
- **Side effect (out of scope but resolved):** The same lint suppression incidentally fixes pre-existing `react-refresh/only-export-components` errors in `src/components/ui/button.tsx` and `src/components/ui/form.tsx`. These were never caught before because the eslint config was crashing for the entire project. The alternative — disabling per-file with comments — would have required touching the same shadcn files for a fix-by-convention rule. Configuring at the directory level is the canonical shadcn pattern.

**2. [Rule 1 - Bug] tsc -b stricter than tsc --noEmit; tightened test type assertions**
- **Found during:** Task 2 (build verification after GREEN tests passed)
- **Issue:** `tsc --noEmit` (run during typecheck gate) accepted `list[0].a` reads after `expect(list).toHaveLength(1)`. `tsc -b` (project mode used by `npm run build`) flagged 11 errors with `noUncheckedIndexedAccess`: "Object is possibly 'undefined'". Build was blocked.
- **Fix:** Hoisted `const entry = list[0]!` non-null assertion (after the length guard) in three SC tests. Mirrors the existing pattern in Plan 01-03's safeGet (which used `as T` with the same Zod-validated guard). Runtime correctness preserved.
- **Files modified:** `src/features/compare/store.test.ts`
- **Verification:** `npm run build` exits 0; vite emits the production bundle.
- **Committed in:** `718b955` (Task 2 GREEN commit)

---

**Total deviations:** 2 auto-fixed (1 blocking config, 1 strict-mode type tightening)
**Impact on plan:** Both auto-fixes were necessary to unblock the verification gates the plan itself specified (lint, build). No scope creep — neither fix introduced new functionality. The eslint config repair will benefit every future plan that runs lint.

## Issues Encountered

None. All planned tasks completed; both auto-fixes were transparent gate-unblocking work.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03-02 (Wave 2: Discovery — Landing, Home, Categories, Search):**
- ToolCard is the single import every list will use:
  ```typescript
  import { ToolCard } from "@/features/tools/components/ToolCard"
  ```
- `recommendedBecause` prop is ready for /home recommendations.

**Ready for Plan 03-03 (Wave 3: Rankings, Tool Detail, Compare Picker):**
- Badge primitive ready for vote count chips.
- ToolCard reusable on rankings list.

**Ready for Plan 03-04 (Wave 3: Reviews modal):**
- Dialog primitive ready for the Write Review shadcn modal.
- Textarea primitive ready for the review body field.

**Ready for Plan 03-05 (Wave 4: Compare flow + Save):**
- `useSavedComparisonsStore.add(userId, a, b)` writes a canonicalized pair (no caller needs to sort).
- Toast wording suggestion for the save action: `"Comparison saved"` (per CONTEXT cross-cutting toast table).

**Ready for Plan 03-06 (Wave 4: Submit a Tool):**
- Select primitive ready for the category dropdown.
- Textarea primitive ready for the description field.

**Ready for Plan 03-07 (Wave 4: Favorites + Profile):**
- `useSavedComparisonsStore.list(userId)` returns the user's saved pairs in insertion order with savedAt timestamps for the Profile "Saved Comparisons" section.
- ToolCard reused on /favorites with same prop shape.

### Known Limitations Carried Forward

- **clearGuestData() does NOT clear saved comparisons.** Plan 02-01's `authStore.clearGuestData()` enumerates four stores by hardcoded dynamic-import path (favorites, rankings, reviews, submit). The new `useSavedComparisonsStore` is NOT in that list. On guest→real-user transitions, saved comparisons under userId="guest" persist. Documented in `src/features/compare/store.ts` as a code comment near `clearByUser`. Phase 5 hardening can extend the enumeration to include this fifth store.
- **Pre-existing lint issue NOT resolved:** `src/features/auth/components/ForgotPasswordForm.tsx` line 37 has an unused `_values` parameter. Out of scope for this plan; logged here for visibility.

---

*Phase: 03-feature-breadth*
*Plan: 01 (Wave 1 — Foundation)*
*Completed: 2026-04-27*

## Self-Check: PASSED

Verified:
- All 8 created files exist on disk: `src/components/ui/{dialog,badge,select,textarea}.tsx`, `src/features/tools/components/ToolCard.{tsx,test.tsx}`, `src/features/compare/store.{ts,test.ts}`
- Modified file: `eslint.config.js` reflects the change in `git log` for commit fe23716
- All three task commits present in `git log`: fe23716 (feat shadcn), b91bb0c (test RED), 718b955 (feat GREEN)
- Final test count 201 passing (182 prior + 19 new) confirmed by `vitest run`
- Build green: `npm run build` produces dist/ artifacts
- All shadcn primitives import without runtime errors (full test suite passes, including tests that mount Toaster)
- `aitools:saved-comparisons:global` localStorage key persists per-user data correctly (SC8 round-trip test passes)
