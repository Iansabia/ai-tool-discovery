---
phase: 02-auth-persistence-stores
plan: 04
subsystem: stores
tags: [zustand, persistence, vote-state-machine, favorites, upvotes, reviews, submissions, sonner, with-toast, clear-by-user, blocker-2-completion]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: storage helper (storageKey/safeGet/safeSet), Vote/Review/Submission types, sonner Toaster
  - phase: 02-auth-persistence-stores (Plan 02-01)
    provides: clearGuestData() in authStore (dynamic-imports the four non-auth stores; optional-chains clearByUser)
provides:
  - useFavoritesStore — per-user favorites Set + clearByUser
  - useUpvoteStore — vote state machine (`current === next ? "none" : next`) + clearByUser + netCount
  - useReviewStore — reviews per tool slug + clearByUser
  - useSubmissionStore — pending tool submissions per user + clearByUser + listAll
  - withToast — centralized action wrapper for sonner toasts (sync + async pass-through)
  - BLOCKER 2 wire-completion: A11/A12 un-skipped and passing in src/features/auth/store.test.ts
affects: [03-feature-breadth (favorite buttons, vote buttons, review modals, submit form, profile reads)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All 4 non-auth stores follow the same shape: `data: T` initialized via safeGet, every mutating action writes via safeSet inside the action body, clearByUser is idempotent, no closure-stale reads"
    - "Vote state machine: `setVote(userId, slug, next: 'up'|'down')` resolves via `current === next ? 'none' : next` — locked here, exhaustively tested, will be consumed by Phase 3 vote button"
    - "withToast is the canonical action wrapper Phase 3 features must use — wraps any (sync or async) action and toasts success/error consistently"
    - "Persistence keys follow `aitools:<domain>:global` convention (per-user data nested inside as { [userId]: ... } maps)"

key-files:
  created:
    - src/features/tools/store.ts
    - src/features/tools/store.test.ts
    - src/features/rankings/store.ts
    - src/features/rankings/store.test.ts
    - src/features/reviews/store.ts
    - src/features/reviews/store.test.ts
    - src/features/submit/store.ts
    - src/features/submit/store.test.ts
    - src/lib/withToast.ts
    - src/lib/withToast.test.ts
  modified:
    - src/features/auth/store.test.ts (un-skipped A11 + A12)

key-decisions:
  - "Storage keys use `:global` scope (e.g. `aitools:favorites:global`) with per-user data nested inside as a `{[userId]: ...}` map — keeps the four stores symmetrical with each other and with auth-store keys (`aitools:users:registry`, `aitools:auth:session`)."
  - "Vote state machine logic is one expression: `current === next ? 'none' : next`. Locked phrasing ensures Phase 3 vote button cannot diverge — the test files assert this resolves all 6 transitions correctly."
  - "reviewStore validates `rating ∈ {1..5}` as defense-in-depth (Phase 3 forms also validate before calling). Throws on invalid input — easier to surface as a toast.error via withToast."
  - "submissionStore.add always sets `status='pending'`; status-change actions (approve/reject) are out of scope for v1 per CONTEXT (no server moderation)."
  - "withToast uses unconstrained `AnyFn` generics (with one ESLint disable for `no-explicit-any`) — this is necessary for the pass-through pattern; constraining the input/output would force callers to retype every action."
  - "clearByUser is idempotent across all 4 stores. favorites/upvotes/submissions short-circuit on `!(userId in prev)`; reviews scan every slug bucket and short-circuit if no review by that userId was found."

requirements-completed: []
# Note: Plan 02-04 has no requirement IDs of its own. The clearByUser actions
# CLOSE OUT AUTH-07 (guest-data clear-on-real-signin) which was claimed by
# Plan 02-01; A11/A12 in store.test.ts now pass without skip, completing the
# end-to-end test of that requirement. The stores themselves enable Phase 3
# requirements (USER-04, COMM-02..06, COMM-07..09) but those land in Phase 3.

# Metrics
duration: ~4 min
completed: 2026-04-27
---

# Phase 02 Plan 04: Non-auth persistence stores + withToast Summary

**Four non-auth Zustand stores (favorites, upvotes, reviews, submissions) with exhaustive vote state machine, the `withToast` action wrapper, and BLOCKER 2 wire-completion (clearByUser ships, A11/A12 un-skipped).**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-27T20:51:46Z
- **Completed:** 2026-04-27T20:56:12Z (approx)
- **Tasks:** 2
- **Files created:** 10
- **Files modified:** 1

## Accomplishments

- All 4 non-auth Zustand stores shipped, each with the same architectural shape: `data` initialized via `safeGet`, mutators write via `safeSet`, `clearByUser` idempotent.
- **Vote state machine locked:** `setVote(userId, slug, next: 'up'|'down')` resolves to `current === next ? 'none' : next`. All 6 transitions explicit by name in test descriptions:
  - V1 none → up
  - V2 none → down
  - V3 up → none (clicking same vote toggles off)
  - V4 up → down (opposite vote switches)
  - V5 down → none (clicking same vote toggles off)
  - V6 down → up (opposite vote switches)
  - V11 also tests rapid-click safety: 3 sync `setVote(_, _, "up")` calls land in `up` (up → none → up), proving no closure-stale-value bug.
- **BLOCKER 2 wire complete.** All 4 non-auth stores expose `clearByUser(userId)`. authStore.signIn / signUp call `clearGuestData()` (Plan 02-01), which dynamic-imports each store and calls `clearByUser('guest')`. **A11 and A12 in `src/features/auth/store.test.ts` un-skipped and passing.**
- `withToast` is the canonical action wrapper for Phase 3 — accepts any sync or async function, toasts success on resolve / error on reject, preserves return value, re-throws errors. Falls back to `err.message ?? "Action failed"` if `options.error` not provided.
- **Test counts:** 134 tests + 2 skipped (Plan 02-03 baseline) → **182 tests + 0 skipped** (this plan) across 24 test files. Net delta: +46 new tests, +2 unskipped, 0 still-skipped.
- All gates green: vitest, tsc, lint, vite build. Production bundle 477 KB / 144 KB gzip (no change vs 02-03 — these are tree-shakeable stores with no UI yet).

## Task Commits

| Task | Hash | Type | Description |
|---|---|---|---|
| 1 | `7b77d9a` | feat | favoritesStore + upvoteStore with exhaustive vote state machine + clearByUser |
| 2 | `560f094` | feat | reviewStore + submissionStore + withToast utility; complete BLOCKER 2 wire (un-skip A11/A12) |

## Final API surface

### `useFavoritesStore` (`src/features/tools/store.ts`)

```ts
interface FavoritesState {
  data: Record<string /* userId */, string[] /* slugs */>
  isFavorite(userId: string, slug: string): boolean
  list(userId: string): string[]                  // insertion order
  toggle(userId: string, slug: string): void
  clearByUser(userId: string): void               // idempotent
}
```

Storage key: `aitools:favorites:global`. Envelope: `{version: 1, data: {[userId]: slug[]}}`.

### `useUpvoteStore` (`src/features/rankings/store.ts`)

```ts
interface UpvoteState {
  data: Record<string /* userId */, Record<string /* slug */, Vote>>
  getVote(userId: string, slug: string): Vote     // 'none' | 'up' | 'down'
  setVote(userId: string, slug: string, next: "up" | "down"): void
  netCount(slug: string): number                  // ups - downs across all users
  clearByUser(userId: string): void               // idempotent
}
```

State machine: `current === next ? "none" : next`. Storage key: `aitools:upvotes:global`.

### `useReviewStore` (`src/features/reviews/store.ts`)

```ts
type ReviewInput = Omit<Review, "id" | "createdAt">
interface ReviewState {
  data: Record<string /* toolSlug */, Review[]>
  add(input: ReviewInput): Review                 // throws if rating ∉ {1..5}
  listByTool(slug: string): Review[]              // newest first (createdAt desc)
  clearByUser(userId: string): void               // idempotent; scans every slug
}
```

Storage key: `aitools:reviews:global`.

### `useSubmissionStore` (`src/features/submit/store.ts`)

```ts
type SubmissionInput = Omit<Submission, "id" | "status" | "submittedAt">
interface SubmissionState {
  data: Record<string /* submitterId */, Submission[]>
  add(input: SubmissionInput): Submission         // status='pending', auto id + submittedAt
  listByUser(userId: string): Submission[]
  listAll(): Submission[]                         // flat cross-user list
  clearByUser(userId: string): void               // idempotent
}
```

Storage key: `aitools:submissions:global`.

### `withToast` (`src/lib/withToast.ts`)

```ts
interface WithToastOptions {
  success: string
  error?: string                                  // fallback: err.message || "Action failed"
}
function withToast<F extends (...args: any[]) => any>(
  fn: F,
  options: WithToastOptions,
): F
```

Pass-through wrapper. Detects thenable returns and chains `toast.success` / `toast.error` properly for both sync and async. Re-throws after toasting on error.

## localStorage keys persisted by Phase 2 (6 total)

| Key | Owner | Envelope shape |
|---|---|---|
| `aitools:users:registry` | useUsersStore (Plan 02-01) | `{version: 1, data: User[]}` |
| `aitools:auth:session` | useAuthStore (Plan 02-01) | `{version: 1, data: AuthSession}` (key removed via safeRemove on logout) |
| `aitools:favorites:global` | useFavoritesStore (this plan) | `{version: 1, data: {[userId]: string[]}}` |
| `aitools:upvotes:global` | useUpvoteStore (this plan) | `{version: 1, data: {[userId]: {[slug]: Vote}}}` |
| `aitools:reviews:global` | useReviewStore (this plan) | `{version: 1, data: {[toolSlug]: Review[]}}` |
| `aitools:submissions:global` | useSubmissionStore (this plan) | `{version: 1, data: {[submitterId]: Submission[]}}` |

(Plus the third-party `aitools:theme` key owned by next-themes from Plan 01-04 — explicitly NOT a Phase 2 store.)

## BLOCKER 2 wire-completion confirmation

- `clearGuestData()` in authStore (Plan 02-01) dynamic-imports the four stores via `[...].join("/")` to defer Vite's static resolver.
- Each `useXxxStore.getState().clearByUser('guest')` is called via optional-chain `?.clearByUser?.(...)`. The chain is now redundant (every store ships `clearByUser`) but it's kept for defensive symmetry.
- A11 (`signIn` clears guest data) and A12 (`signUp` clears guest data) in `src/features/auth/store.test.ts` are un-skipped — `it.skip` → `it`. Both pass.
- Verified: `grep -F "it.skip" src/features/auth/store.test.ts` returns no matches.

## Test counts

- **Before Plan 02-04:** 136 tests (134 passing + 2 skipped) across 19 test files.
- **After Plan 02-04:** 182 tests (182 passing + 0 skipped) across 24 test files.
- **New:** 46 tests
  - 9 favoritesStore (F1..F9)
  - 15 upvoteStore (V1..V12 + isolation/persistence/rapid-click variants)
  - 8 reviewStore (R1..R8)
  - 7 submissionStore (S1..S7)
  - 7 withToast (W1..W7)
- **Un-skipped:** 2 (A11, A12)

## Verification gates

| Gate | Status |
|---|---|
| `node ./node_modules/vitest/vitest.mjs run` | PASS — 182 passed, 0 skipped |
| `node ./node_modules/typescript/bin/tsc --noEmit` | PASS — exits 0 |
| `npm run lint:no-direct-localstorage` | PASS — exits 0 |
| `npm run build` | PASS — `[check-logos] OK` + tsc + vite build, 1.37s |
| All 6 vote transitions explicit in test names | PASS — V1..V6 by name |
| State machine canonical phrase | PASS — `current === next ? "none" : next` present |
| All 4 stores expose clearByUser | PASS — 4/4 |
| All 4 stores use safeGet/safeSet | PASS — 4/4 |
| A11/A12 un-skipped | PASS — `it.skip` absent |

## Deviations from Plan

None. Plan executed exactly as written. No deviation rules triggered.

## Notes for Phase 3 consumers

### Favorite buttons (USER-04)

```tsx
const { userId } = useAuth()
const isFav = useFavoritesStore(s => s.isFavorite(userId, slug))
const onClick = withToast(
  () => useFavoritesStore.getState().toggle(userId, slug),
  { success: isFav ? "Removed from favorites" : "Added to favorites" },
)
```

### Vote buttons (COMM-02..06)

```tsx
const { userId } = useAuth()
const vote = useUpvoteStore(s => s.getVote(userId, slug))   // 'none' | 'up' | 'down'
const net = useUpvoteStore(s => s.netCount(slug))           // for the count badge
const onUp = () => useUpvoteStore.getState().setVote(userId, slug, "up")
const onDown = () => useUpvoteStore.getState().setVote(userId, slug, "down")
// The store handles toggle-to-none internally — components just dispatch the click.
```

### Rankings list

```tsx
const sorted = [...TOOLS].sort(
  (a, b) => useUpvoteStore.getState().netCount(b.slug)
          - useUpvoteStore.getState().netCount(a.slug)
)
// Or with a selector for reactivity. Consider memoizing if list is long.
```

### Review modal (COMM-07..09)

```tsx
const onSubmit = withToast(
  (input: ReviewInput) => useReviewStore.getState().add(input),
  { success: "Review posted", error: "Couldn't post review" },
)
// listByTool is already createdAt-desc — render directly.
```

### Submit form

```tsx
const onSubmit = withToast(
  (input: SubmissionInput) => useSubmissionStore.getState().add(input),
  { success: "Submitted for review" },
)
// Profile pending queue → useSubmissionStore.listByUser(userId)
```

## Self-Check: PASSED

Verified files exist:
- `src/features/tools/store.ts` — FOUND
- `src/features/tools/store.test.ts` — FOUND
- `src/features/rankings/store.ts` — FOUND
- `src/features/rankings/store.test.ts` — FOUND
- `src/features/reviews/store.ts` — FOUND
- `src/features/reviews/store.test.ts` — FOUND
- `src/features/submit/store.ts` — FOUND
- `src/features/submit/store.test.ts` — FOUND
- `src/lib/withToast.ts` — FOUND
- `src/lib/withToast.test.ts` — FOUND

Verified commits exist:
- `7b77d9a` — Task 1 (favorites + upvote)
- `560f094` — Task 2 (reviews + submissions + withToast + un-skip)

Verified all gates pass: vitest 182/182, typecheck clean, lint clean, build clean.

Verified A11/A12 un-skipped via `! grep -F "it.skip" src/features/auth/store.test.ts`.

---
*Phase: 02-auth-persistence-stores*
*Plan: 04 (Wave 4 — final plan of Phase 2)*
*Completed: 2026-04-27*
