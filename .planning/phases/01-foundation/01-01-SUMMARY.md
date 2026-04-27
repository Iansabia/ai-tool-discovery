---
phase: 01-foundation
plan: 01
subsystem: testing
tags: [vitest, jsdom, testing-library, jest-dom, npm-scripts]

requires:
  - phase: bootstrap
    provides: empty repo with .planning/ directory
provides:
  - Vitest test runner with jsdom environment
  - Per-test localStorage mock via vi.stubGlobal
  - @testing-library/jest-dom matchers registered globally
  - Canonical test scripts (test, test:run, typecheck, lint:no-direct-localstorage)
  - Sanity test suite proving infra works end-to-end
affects: [02-vite-shadcn-scaffold, all-future-plans-using-npm-test]

tech-stack:
  added:
    - vitest@^1.6.0
    - "@vitest/coverage-v8@^1.6.0"
    - "@testing-library/react@^16.0.0"
    - "@testing-library/jest-dom@^6.4.0"
    - "@testing-library/dom@^10.0.0"
    - "@testing-library/user-event@^14.5.0"
    - jsdom@^25.0.0
    - "@types/node@^22.0.0"
  patterns:
    - "Per-test fresh localStorage via beforeEach + vi.stubGlobal (avoids leakage between tests)"
    - "esbuild jsx: 'automatic' so test files don't need to import React explicitly"
    - "npm scripts use direct node invocation of binaries (works regardless of PATH-hostile directory names)"

key-files:
  created:
    - package.json
    - .gitignore
    - vitest.config.ts
    - tests/setup.ts
    - tests/setup.test.tsx
  modified: []

key-decisions:
  - "Test files containing JSX use .test.tsx extension (anticipated by plan as fallback)"
  - "JSX runtime set to automatic in vitest esbuild config so React doesn't need to be imported per file"
  - "npm scripts call node ./node_modules/<pkg>/<bin> directly to bypass PATH issues caused by colon in working directory path"

patterns-established:
  - "Wave 0 verification command: npm test -- --run (canonical for all subsequent plans)"
  - "All localStorage assertions go through the mock — no test ever touches real jsdom Storage"

requirements-completed: []

duration: 2 min
completed: 2026-04-27
---

# Phase 01 Plan 01: Test Infrastructure (Wave 0) Summary

**Vitest+jsdom test infrastructure with per-test localStorage mock, jest-dom matchers, and four canonical npm scripts (test, test:run, typecheck, lint:no-direct-localstorage) — every later plan can now rely on `npm test -- --run path/to/file.test.ts` working out of the box.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-27T01:29:58Z
- **Completed:** 2026-04-27T01:32:15Z
- **Tasks:** 2
- **Files created:** 5 (package.json, .gitignore, vitest.config.ts, tests/setup.ts, tests/setup.test.tsx)
- **Files modified:** 0

## Accomplishments

- Minimal pre-shadcn `package.json` shipped with vitest stack only (no React/Vite/Tailwind — Plan 02 owns scaffolding and will MERGE additively via `npx shadcn@latest init`)
- `npm install` completes; node_modules/vitest, react, react-dom, @testing-library/* all resolvable
- `vitest.config.ts` configures jsdom + `@/` alias (forward-compatible with future src/) + setup file + automatic JSX runtime
- `tests/setup.ts` registers jest-dom matchers, runs RTL `cleanup()` afterEach, replaces `localStorage` with a controllable in-memory mock per-test
- 5-test sanity suite (`tests/setup.test.tsx`) proves: jsdom present, RTL renders, localStorage mock fresh per test (write-1 + write-2 isolation check), jest-dom `.toBeDisabled()` matcher loaded
- All 5 tests pass in ~330ms; well under 10s budget

## Task Commits

1. **Task 1: Create root package.json with test scripts and devDependencies** — `a5c01bf` (chore)
2. **Task 2: Create Vitest config + test setup + sanity test** — `d77def5` (feat)

_Plan metadata commit follows this summary._

## Files Created/Modified

- `package.json` — name, type=module, four scripts, eight devDependencies (vitest stack only)
- `.gitignore` — node_modules, dist, .DS_Store, coverage, *.log, .env, .env.local, .vite
- `vitest.config.ts` — jsdom env, `@/` alias, setupFiles, include patterns for src/ + tests/, automatic JSX
- `tests/setup.ts` — jest-dom import, afterEach cleanup, beforeEach localStorage mock via vi.stubGlobal
- `tests/setup.test.tsx` — 5-test Wave 0 sanity suite (jsdom + RTL + localStorage isolation + jest-dom matchers)

## Decisions Made

- **JSX in test files via automatic runtime.** Configured `esbuild.jsx: "automatic"` in vitest.config.ts so test files using JSX don't need an explicit `import React`. Cleaner than the plan's classic-runtime assumption.
- **`.test.tsx` over `.test.ts` for JSX-bearing tests.** Plan said either works; classic transform with `.test.ts` does not work in vitest's esbuild path. Renamed `setup.test.ts` → `setup.test.tsx`. Plan explicitly anticipated this fallback ("If linting complains during dev, rename to `.test.tsx`").
- **npm scripts use direct `node ./node_modules/...` invocations.** The working directory contains a colon (`UI:UX Final`); npm splits PATH on `:` and corrupts `node_modules/.bin` resolution. Direct node invocation is PATH-independent and survives this. Future plans should follow the same pattern when adding scripts that invoke local binaries.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm scripts could not resolve local binaries due to colon in directory name**
- **Found during:** Task 2 (Run sanity tests via `npm test`)
- **Issue:** `npm test` reported `sh: vitest: command not found` even though `node_modules/.bin/vitest` exists. Reproduced cause: the working directory `/Users/iansabia/Desktop/UI:UX Final` contains a `:`, which is the POSIX PATH separator. npm's script PATH augmentation splits on `:` and corrupts the `node_modules/.bin` entry. Confirmed by copying `package.json` + symlinking `node_modules` into a colon-free `/tmp` directory — there `npm test` worked immediately.
- **Fix:** Rewrote scripts to invoke binaries directly via node: `test → node ./node_modules/vitest/vitest.mjs`, `test:run → node ./node_modules/vitest/vitest.mjs run`, `typecheck → node ./node_modules/typescript/bin/tsc --noEmit ...`. PATH-independent and works regardless of directory name.
- **Files modified:** package.json
- **Verification:** `npm test -- --run` now exits 0 with `5 passed`.
- **Committed in:** d77def5 (Task 2 commit)

**2. [Rule 1 - Bug] JSX in `.test.ts` failed esbuild transform**
- **Found during:** Task 2 (first attempt to run sanity tests)
- **Issue:** Plan's note "Vitest+esbuild handles JSX in `.ts` files fine" turned out to be incorrect for vitest 1.6.1's default config. esbuild error: `Expected ">" but found "data"` on the first JSX line.
- **Fix:** Renamed `tests/setup.test.ts` → `tests/setup.test.tsx`. Plan explicitly listed this as the documented fallback ("rename to `.test.tsx` — both extensions are in `include`").
- **Files modified:** tests/setup.test.tsx (renamed from .ts)
- **Verification:** Tests now collect and run.
- **Committed in:** d77def5 (Task 2 commit)

**3. [Rule 3 - Blocking] React not defined in JSX scope**
- **Found during:** Task 2 (after fixing #2, tests still failed)
- **Issue:** Even with `.tsx`, esbuild's default classic JSX runtime expanded `<div>` to `React.createElement(...)`, requiring `React` in scope. Tests had no `import React`.
- **Fix:** Added `esbuild: { jsx: "automatic" }` to vitest.config.ts. With the automatic runtime, esbuild emits imports from `react/jsx-runtime` itself, no explicit React import needed. React was already present in node_modules transitively (peer dep of @testing-library/react).
- **Files modified:** vitest.config.ts
- **Verification:** All 5 tests pass.
- **Committed in:** d77def5 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All three fixes were necessary to satisfy the plan's own done-criteria (`npm test -- --run` finishes with 5 passing tests). No scope creep — package.json shape, file count, and test count are exactly as specified. Plan 02 will MERGE its deps into this package.json additively per `shadcn init` behavior; the script changes here do not affect that merge.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration in this plan.

## Next Phase Readiness

- **Ready for Plan 01-02 (Vite + shadcn/ui scaffold).** That plan runs `npx shadcn@latest init -t vite`, which uses `npm install` and merges its devDependencies additively into the existing `package.json`. The vitest stack established here will survive the merge.
- **Important note for Plan 02:** the `npm` scripts use `node ./node_modules/<pkg>/<bin>` invocation. If `shadcn init` overwrites the `scripts` section, restore the existing four scripts (test, test:run, typecheck, lint:no-direct-localstorage) and merge in any new ones (like `dev`, `build`). Do not let shadcn replace `test` with its default.
- **Important note for Plan 02:** the working directory has a colon in its path. Any new npm script that invokes a local binary should use `node ./node_modules/<pkg>/<bin>` rather than relying on PATH (`vite`, `tsc`, `eslint`, etc.).

## Self-Check: PASSED

- File `package.json` exists: FOUND
- File `.gitignore` exists: FOUND
- File `vitest.config.ts` exists: FOUND
- File `tests/setup.ts` exists: FOUND
- File `tests/setup.test.tsx` exists: FOUND
- Commit `a5c01bf` (Task 1): FOUND in git log
- Commit `d77def5` (Task 2): FOUND in git log
- `npm test -- --run` exits 0 with 5 passing tests: PASS
- `npm run lint:no-direct-localstorage` exits 0: PASS

---
*Phase: 01-foundation*
*Completed: 2026-04-27*
