---
phase: 01-foundation
plan: 03
subsystem: types-storage-validators
tags: [typescript, types, zod, localstorage, validators, vitest]

requires:
  - phase: 01-foundation
    plan: 01
    provides: Vitest+jsdom test infrastructure (per-test localStorage mock)
  - phase: 01-foundation
    plan: 02
    provides: Vite+React+TS scaffold with @ alias and zod runtime dep
provides:
  - Domain TypeScript interfaces (Tool, Category, User, Session, Review, UpvoteRecord, Submission)
  - CategorySlug literal union (10 categories) and Vote state-machine type
  - Namespaced localStorage helper (storageKey, safeGet, safeSet, subscribeToKey, clearNamespace)
  - {version, data} Zod-validated storage envelope pattern
  - Build-time validators (__validateSlugsUnique, __validateLogosPresent) for Plan 01-05's tools.ts
affects: [01-04, 01-05, all-phase-2-stores, all-phase-3-features]

tech-stack:
  added: []
  patterns:
    - "Storage envelope: {version: number, data: T} on every persisted store; reads validate via zod safeParse and fall back on any failure (missing key, malformed JSON, schema mismatch, version mismatch)"
    - "Same-tab StorageEvent fan-out via window.dispatchEvent in safeSet (omits storageArea so test mocks of Storage work without TypeError)"
    - "Build-time validators imported into seed data modules and called at module load — fires on dev start AND vite build, throwing fails the build"
    - "@ts-expect-error type-level assertions in test files double as compile-time invariants (failing one means the underlying type lost its constraint)"

key-files:
  created:
    - src/types/index.ts
    - src/types/index.test.ts
    - src/lib/storage.ts
    - src/lib/storage.test.ts
    - src/data/_validate.ts
    - src/data/_validate.test.ts
  modified: []

key-decisions:
  - "Synthetic StorageEvent in safeSet omits storageArea field. jsdom + the Plan 01-01 in-memory Storage mock do not satisfy the real Storage interface, and constructing StorageEvent with a non-Storage storageArea throws TypeError. Subscribers key off event.key only — storageArea is informational. Cleaner than coercing the mock or branching on environment."
  - "safeGet final return uses an explicit `as T` cast. tsc --noEmit accepted the unwrapped Zod result, but tsc -b (project-mode build) flagged the assignability gap from Zod's generic ZodType<T> inferring `data | undefined` in some paths. Cast is safe because it runs only after a successful safeParse."
  - "Lint script src/lib exclusion is sufficient (no test-file carve-out needed). storage.ts and storage.test.ts both live in src/lib, which is excluded by --exclude-dir. Other src/ subtrees are fully scanned."

patterns-established:
  - "Domain types live in src/types/index.ts (single barrel); imports use `from \"@/types\"`"
  - "Build-time data validators are double-underscored (`__validateX`) to signal internal-only and live in src/data/_validate.ts; they are imported and called inside the seed data file at module load"
  - "Test files alongside source (src/lib/storage.test.ts) are picked up by the existing vitest include glob `src/**/*.test.{ts,tsx}` — no config change needed"

requirements-completed: ["FOUND-04", "FOUND-05", "UX-07"]

duration: 3 min
completed: 2026-04-27
---

# Phase 01 Plan 03: Lib + Types + Data Layers Summary

**Three foundational, framework-agnostic modules — TypeScript domain interfaces (10 exports), namespaced+versioned localStorage helper (5 exports + StorageEnvelope), and build-time slug/logo validators — shipped with 40 Vitest tests including @ts-expect-error compile-time assertions; every Phase 2+ persisted store and Plan 01-05's seed `tools.ts` now have a stable, well-tested API to import from.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-27T01:47:08Z
- **Completed:** 2026-04-27T01:50:29Z
- **Tasks:** 3
- **Files created:** 6 (3 source + 3 test files)
- **Files modified:** 0

## Accomplishments

- `src/types/index.ts` exports the 10 domain types: `CategorySlug`, `PricingTier`, `Vote`, `Category`, `Tool`, `User`, `Session`, `Review`, `UpvoteRecord`, `Submission`
- `src/lib/storage.ts` is the only module in the codebase that touches localStorage; exports `storageKey`, `safeGet`, `safeSet`, `subscribeToKey`, `clearNamespace`, `StorageEnvelope<T>`
- `src/data/_validate.ts` exports `__validateSlugsUnique` (with both colliding tool names + slug in error message) and `__validateLogosPresent` (with expected file path in error message)
- 40 Vitest tests across the three test files, all green; Plan 01-01's 5-test sanity suite still passes (45/45 total)
- `npm run typecheck` exits 0; `npm run build` (tsc -b + vite build) emits 139 modules in ~400ms
- `npm run lint:no-direct-localstorage` exits 0 — no rogue localStorage usage anywhere in src/ outside src/lib/

## API Surface (Final Shape)

### `src/types/index.ts` exports

| Export | Kind | Notes |
|---|---|---|
| `CategorySlug` | type alias | Literal union of 10 slugs (writing, coding, research, image, audio, video, productivity, design, data, marketing) |
| `PricingTier` | type alias | `"Free" \| "Freemium" \| "Paid"` (case-sensitive) |
| `Vote` | type alias | `"none" \| "up" \| "down"` — state-machine shape per CONTEXT decision |
| `Category` | interface | slug, name, description, icon |
| `Tool` | interface | slug (required string), name, tagline, description, category, pricing, features, url, rating, logo |
| `User` | interface | id, email, username, displayName, passwordHash, interests, selectedTools, createdAt |
| `Session` | interface | userId, token, issuedAt, expiresAt |
| `Review` | interface | id, toolSlug, userId, username (denormalized), rating, title, body, createdAt |
| `UpvoteRecord` | interface | toolSlug, userId, vote (Vote), votedAt |
| `Submission` | interface | id, submitterId, name, url, category, description, tags, status (`"pending" \| "approved" \| "rejected"`), submittedAt |

### `src/lib/storage.ts` API

```typescript
storageKey(domain: string, scope?: string): string
// Returns "aitools:<domain>:<scope>"; default scope = "global"

safeGet<T>(key: string, schema: ZodType<T>, expectedVersion: number, fallback: T): T
// Returns fallback on: missing key | malformed JSON | envelope shape mismatch
// | version mismatch | Zod validation failure | thrown error. Never throws.

safeSet<T>(key: string, value: T, version: number): void
// Writes {version, data: value}; dispatches synthetic same-tab StorageEvent.
// Logs and continues on QuotaExceededError.

subscribeToKey(key: string, cb: (newValue: string | null) => void): () => void
// Listens for `storage` events filtered to key. Returns unsubscribe.

clearNamespace(): void
// Removes only keys with `aitools:` prefix.

interface StorageEnvelope<T> { version: number; data: T }
```

### `src/data/_validate.ts` API

```typescript
__validateSlugsUnique(tools: ReadonlyArray<Tool>): void
// Throws: '[seed] duplicate slug "<slug>" — found on "<priorName>" and "<currentName>". ...'

__validateLogosPresent(tools: ReadonlyArray<Tool>): void
// Throws: '[seed] tool "<slug>" (<name>) has missing or invalid logo asset. Expected ... "@/assets/tool-logos/<slug>.svg".'
```

## Test Counts

| File | describe blocks | it blocks | Status |
|---|---|---|---|
| `src/types/index.test.ts` | 6 | 10 | passing |
| `src/lib/storage.test.ts` | 5 | 20 | passing |
| `src/data/_validate.test.ts` | 2 | 10 | passing |
| **Plan 01-03 total** | **13** | **40** | **40/40 green** |

Combined with Plan 01-01's 5-test sanity suite: **45/45 tests** passing across the project.

## Task Commits

1. **Task 1: Define TypeScript domain interfaces (src/types/index.ts) with type-level test** — `e60d064` (feat)
2. **Task 2: Implement storage helper (src/lib/storage.ts) with full Vitest coverage** — `f865b01` (feat)
3. **Task 3: Implement build-time validators (src/data/_validate.ts) with Vitest coverage** — `c0c6360` (feat)
4. **Build fix: cast safeGet return to T for tsc -b project-mode** — `69038e5` (fix)

_Plan metadata commit follows this summary._

## Decisions Made

- **Synthetic StorageEvent omits `storageArea`.** When safeSet dispatches the same-tab fan-out event, it intentionally does NOT include `storageArea: localStorage`. Reason: Plan 01-01's per-test localStorage mock (a plain object via `vi.stubGlobal`) does not satisfy DOM's real `Storage` interface, and `new StorageEvent("storage", { storageArea: nonStorage })` throws `TypeError: Failed to construct 'StorageEvent': parameter 2 has member 'storageArea' that is not of type 'Storage'`. Subscribers in `subscribeToKey` only check `event.key`, so storageArea is informational and safely omitted.
- **`as T` cast on safeGet's success path.** `tsc --noEmit` accepted `return result.data.data` (Zod's inferred type), but `tsc -b` (project-mode used by `npm run build`) flagged the assignability gap because Zod's generic `ZodType<T>` chains can infer `data | undefined`. The `as T` cast runs only after a successful `safeParse`, so the runtime guarantee already holds — this is the standard pattern with Zod generics.
- **Lint script needs no test-file carve-out.** The plan's contingency suggested adding `--exclude='*.test.ts'` if test files tripped the lint script. They didn't: `storage.test.ts` lives in `src/lib/`, which is already excluded via `--exclude-dir=src/lib`. The existing script from Plan 01-01 stayed untouched.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] StorageEvent constructor rejects non-Storage storageArea in jsdom + test mocks**
- **Found during:** Task 2 (running storage.test.ts the first time)
- **Issue:** Plan's safeSet dispatched `new StorageEvent("storage", { ..., storageArea: localStorage })`. The Plan 01-01 test setup replaces localStorage with a plain object via `vi.stubGlobal("localStorage", mockObject)`, which is not a real Storage instance. jsdom's StorageEvent constructor enforces the type and throws TypeError. 5 tests failed: `safeSet > dispatches a synthetic StorageEvent on the same tab`, three `subscribeToKey` event-dispatching tests, and the safeSet+subscribeToKey integration.
- **Fix:** Removed `storageArea: localStorage` from the synthetic event in `safeSet` AND from all test-side `new StorageEvent(...)` calls. Subscribers only key off `event.key`, so storageArea is purely informational.
- **Files modified:** src/lib/storage.ts, src/lib/storage.test.ts
- **Verification:** All 20 storage tests pass. Documented inline with a comment in storage.ts explaining why storageArea is omitted.
- **Committed in:** f865b01 (Task 2 commit)

**2. [Rule 1 - Bug] Zod generic inference broke `tsc -b` build mode**
- **Found during:** Final verification (`npm run build`)
- **Issue:** `npm run typecheck` (= `tsc --noEmit`) passed, but `npm run build` (= `tsc -b && vite build`) failed with: `error TS2322: Type 'addQuestionMarks<...>["data"] | undefined' is not assignable to type 'T'`. Project-mode tsc applies stricter assignability checks for generic returns from Zod's `safeParse`.
- **Fix:** Added explicit `as T` cast on `return result.data.data` in safeGet. Safe because the cast is reached only after `result.success === true`, meaning the schema validated `data` against `ZodType<T>` already.
- **Files modified:** src/lib/storage.ts (1-line change)
- **Verification:** `npm run build` exits 0; vite emits 139 chunks; 45/45 tests still pass.
- **Committed in:** 69038e5 (build fix commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 bugs). Both were necessary to satisfy plan verification (`npm test -- --run` and `npm run build`). No scope creep — file count, export count, and test count match plan acceptance criteria exactly.

## Issues Encountered

None beyond the deviations above. All plan verification gates pass:
- `npm test -- --run src/types/ src/lib/ src/data/` → 40 tests passing
- `npm test -- --run` (full suite) → 45 tests passing
- `npm run typecheck` → exits 0
- `npm run build` → exits 0 (tsc -b + vite build)
- `npm run lint:no-direct-localstorage` → exits 0
- `grep -RInE "localStorage\.(set|get|remove|clear)Item" src/ --exclude-dir=src/lib --exclude='*.test.*'` → no matches

## User Setup Required

None.

## Next Phase Readiness

- **Ready for Plan 01-04 (router + AppShell + theme).** Plan 04 can:
  - Import domain types from `@/types` (e.g., `useParams<{ slug: string }>()` typed against `Tool["slug"]`).
  - Use `safeGet` / `safeSet` from `@/lib/storage` for any consumer (next-themes' own storage, future profile/auth state previews).
  - **Important note:** the FOUC-prevention inline `<script>` in `index.html` reads `localStorage` directly. That direct usage is acceptable and the lint script does NOT scan `index.html` (it only scans `src/`). Plan 04 should mention this rationale in its summary so the convention isn't violated elsewhere.

- **Ready for Plan 01-05 (seed data + brand tokens).** Plan 05 should:
  - Import the validators: `import { __validateSlugsUnique, __validateLogosPresent } from "@/data/_validate"`.
  - Call them at MODULE LOAD inside `src/data/tools.ts` (top-level, not inside a function): both `__validateSlugsUnique(tools)` and `__validateLogosPresent(tools)`. This makes a misnamed/duplicated logo or slug fail both `npm run dev` (on first import) AND `npm run build` (during the bundle phase).
  - Use the `Tool` interface as-is. Slug, logo, and category are all required fields; pricing must be one of "Free" | "Freemium" | "Paid" (capitalized).

- **Storage envelope versioning convention:** Plan 02+ stores should pick a starting `version: 1` (not 0), and bump to 2/3/etc when the persisted shape changes incompatibly. The helper falls back to default on version mismatch — no migration logic exists yet.

## Self-Check: PASSED

- File `src/types/index.ts` exists: FOUND
- File `src/types/index.test.ts` exists: FOUND
- File `src/lib/storage.ts` exists: FOUND
- File `src/lib/storage.test.ts` exists: FOUND
- File `src/data/_validate.ts` exists: FOUND
- File `src/data/_validate.test.ts` exists: FOUND
- Commit `e60d064` (Task 1): FOUND in git log
- Commit `f865b01` (Task 2): FOUND in git log
- Commit `c0c6360` (Task 3): FOUND in git log
- Commit `69038e5` (build fix): FOUND in git log
- `npm test -- --run` exits 0 with 45/45 passing: PASS
- `npm run typecheck` exits 0: PASS
- `npm run build` exits 0: PASS
- `npm run lint:no-direct-localstorage` exits 0: PASS

---
*Phase: 01-foundation*
*Completed: 2026-04-27*
