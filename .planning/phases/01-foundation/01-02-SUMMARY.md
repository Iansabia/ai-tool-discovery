---
phase: 01-foundation
plan: 02
subsystem: scaffolding
tags: [vite, react18, typescript, tailwind-v4, shadcn-ui, react-router, zustand, zod, next-themes, simple-icons]

requires:
  - phase: 01-foundation
    plan: 01
    provides: Vitest+jsdom test infrastructure with PATH-safe npm scripts
provides:
  - Vite 6 dev server on port 5173 with @ alias resolving to ./src
  - React 18.3 + TypeScript 5.6 with strict + noUncheckedIndexedAccess
  - Tailwind v4 via @tailwindcss/vite plugin (no postcss.config.js)
  - shadcn/ui registry configured (radix base, nova preset) with cn helper and three primitives (Button, Card, Toaster/sonner)
  - Phase 1 runtime deps installed (react-router 7, zustand 5, zod 3, next-themes 0.4, simple-icons 16)
  - tsconfig.app.json includes both src/ and tests/ so typecheck covers the test suite
affects: [01-03, 01-04, 01-05, all-phase-2-onwards]

tech-stack:
  added:
    - "react@^18.3.1"
    - "react-dom@^18.3.1"
    - "vite@^6.0.0"
    - "@vitejs/plugin-react@^4.3.3"
    - "typescript@~5.6.0"
    - "tailwindcss@^4.2.4"
    - "@tailwindcss/vite@^4.2.4"
    - "tw-animate-css@^1.4.0"
    - "@fontsource-variable/geist@^5.2.8"
    - "shadcn@^4.5.0 (registry runtime)"
    - "radix-ui@^1.4.3"
    - "lucide-react@^1.11.0"
    - "class-variance-authority@^0.7.1"
    - "clsx@^2.1.1"
    - "tailwind-merge@^3.5.0"
    - "react-router@^7.14.2"
    - "zustand@^5.0.12"
    - "zod@^3.25.76"
    - "next-themes@^0.4.6"
    - "simple-icons@^16.18.0"
    - "sonner@^2.0.7"
  patterns:
    - "Path alias @/ → ./src configured in vite.config.ts (via path.resolve) AND tsconfig.app.json + tsconfig.json (paths field)"
    - "Tailwind v4 imported via @import \"tailwindcss\" in src/index.css; no postcss.config.js, no tailwind.config.js"
    - "All npm scripts invoke local binaries via node ./node_modules/<pkg>/<bin> form (PATH-safe in colon-containing working directory)"
    - "tsconfig.app.json includes both src/ and tests/ so typecheck covers test files"

key-files:
  created:
    - vite.config.ts
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - eslint.config.js
    - components.json
    - index.html
    - public/favicon.svg
    - src/main.tsx
    - src/App.tsx
    - src/index.css
    - src/lib/utils.ts
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/sonner.tsx
  modified:
    - package.json (Vite/React/TS/Tailwind/shadcn deps + Phase 1 runtime deps merged in additively, scripts kept PATH-safe)
    - package-lock.json (regenerated)

key-decisions:
  - "shadcn/ui CLI 4.5 changed semantics: -t vite expects an existing Vite project, not a one-shot scaffold; we used create-vite first, then ran shadcn init with -b radix -p nova (radix-nova style) — the closest equivalent to the plan's New York/Neutral default"
  - "Pinned React to 18.3 explicitly; create-vite defaults to React 19 but the plan + research stack target React 18 (peer deps for testing-library/react@16 and the rest of Phase 1 ecosystem are validated against 18)"
  - "Pinned TypeScript to ~5.6; create-vite defaults to TS 6 which uses experimental compilerOptions (erasableSyntaxOnly) the rest of the plan does not assume"
  - "tsconfig.app.json include = [src, tests] so typecheck catches test-file regressions (Plan 01-01 test files now type-check too)"

patterns-established:
  - "Vite + Tailwind v4 stack uses zero PostCSS config — Tailwind ships as a Vite plugin only"
  - "Path alias @ is set in three places (vite.config.ts resolve.alias, tsconfig.json compilerOptions.paths, tsconfig.app.json compilerOptions.paths) — all three needed: Vite for runtime, tsconfig.json for shadcn CLI detection, tsconfig.app.json for tsc --noEmit"
  - "Plan 01-01's PATH-safe script form (node ./node_modules/<pkg>/<bin>) extends to dev/build/preview/lint/typecheck for Plan 02"

requirements-completed: ["FOUND-01"]

duration: 6 min
completed: 2026-04-27
---

# Phase 01 Plan 02: Vite + Shadcn/UI Scaffold Summary

**Vite 6 + React 18 + TypeScript 5.6 + Tailwind v4 + shadcn/ui (radix-nova preset) scaffolded at the repo root with @ path alias, strict TypeScript including noUncheckedIndexedAccess, and three shadcn primitives (Button, Card, Toaster) — Phase 1 runtime deps (react-router 7, zustand 5, zod 3, next-themes 0.4, simple-icons 16) installed; dev server boots on 5173, production build succeeds, Plan 01-01 sanity tests still pass.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-27T01:36:04Z
- **Completed:** 2026-04-27T01:42:08Z
- **Tasks:** 2
- **Files created:** 15 (vite.config.ts, 3 tsconfigs, eslint.config.js, components.json, index.html, public/favicon.svg, 4 src/* files, 3 ui/* primitives)
- **Files modified:** 2 (package.json, package-lock.json)

## Accomplishments

- Vite 6 + React 18.3 + TypeScript 5.6 scaffolded; dev server boots on http://localhost:5173 in <1s
- Tailwind v4 wired via @tailwindcss/vite plugin (postcss.config.js confirmed absent)
- shadcn/ui registry initialized (radix base, nova preset → style: "radix-nova"); components.json + cn helper at src/lib/utils.ts
- Three shadcn primitives ready: Button, Card, Toaster (sonner-backed, next-themes-aware)
- Path alias @ → ./src works in Vite runtime AND tsc typecheck; src/App.tsx imports `from "@/components/ui/button"` end-to-end
- Phase 1 runtime deps in dependencies: react-router@7.14.2, zustand@5.0.12, zod@3.25.76, next-themes@0.4.6, simple-icons@16.18.0
- TypeScript strict + noUncheckedIndexedAccess + noUnusedLocals + noFallthroughCasesInSwitch + isolatedModules all active
- tsconfig.app.json `include` = ["src", "tests"] so Plan 01-01's test suite is also typecheck-covered
- npm test (Plan 01-01 sanity suite) still passes 5/5 in ~25ms after the scaffolding merge
- npm run build emits dist/index.html + chunked JS/CSS in 407ms

## Task Commits

1. **Task 1: Scaffold Vite + install Phase 1 runtime deps** — `24d3df2` (feat)
2. **Task 2: Tighten tsconfig.app.json + add card/sonner primitives** — `17f39ab` (feat)

_Plan metadata commit follows this summary._

## Files Created/Modified

**Created (root):**
- `vite.config.ts` — Vite config with @vitejs/plugin-react, @tailwindcss/vite, @ alias, server.port=5173
- `tsconfig.json` — references both app + node configs, also defines baseUrl + paths so shadcn CLI detects the alias
- `tsconfig.app.json` — strict + noUncheckedIndexedAccess + isolatedModules + verbatimModuleSyntax; includes src/ and tests/
- `tsconfig.node.json` — bundler mode TS config for vite.config.ts itself
- `eslint.config.js` — flat config from create-vite (Plan 03+ may extend)
- `components.json` — shadcn registry config (radix-nova style, neutral base, css vars on)
- `index.html` — Vite entry HTML, title="AI Tools Discovery"
- `public/favicon.svg` — Vite default favicon (replaceable later)

**Created (src/):**
- `src/main.tsx` — createRoot + StrictMode + App
- `src/App.tsx` — minimal placeholder with `<Button>Click me</Button>` from @/components/ui/button (proves alias)
- `src/index.css` — `@import "tailwindcss"` + tw-animate-css + Geist font + shadcn theme variables (neutral base) for both `:root` and `.dark`
- `src/lib/utils.ts` — `export function cn(...inputs: ClassValue[])` (twMerge + clsx)
- `src/components/ui/button.tsx` — shadcn Button primitive (cva variants)
- `src/components/ui/card.tsx` — shadcn Card primitive (Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter)
- `src/components/ui/sonner.tsx` — shadcn Toaster (wraps sonner, reads next-themes color scheme)

**Modified:**
- `package.json` — full additive merge: 2 dependencies → 17, 8 devDependencies → 18; scripts now include dev/build/preview/lint plus the four Plan 01 scripts, all using `node ./node_modules/<pkg>/<bin>` form
- `package-lock.json` — regenerated for the new dependency tree

## Decisions Made

- **shadcn 4.5 init flow change.** The plan assumed `npx shadcn@latest init -t vite` would scaffold a complete Vite project in one shot. As of shadcn 4.5.0, `-t vite` is a *framework template hint* — the CLI now requires an existing Vite project and exits with "We could not detect a supported framework" otherwise. Workaround: ran `npm create vite@latest temp-vite -- --template react-ts` first, then copied the scaffolding files (index.html, src/, tsconfigs, eslint.config.js) into the repo root, installed @tailwindcss/vite + tailwindcss@^4, then ran `shadcn init -t vite -b radix -p nova` which detected Vite + Tailwind v4 + the @ alias and completed cleanly. Documented in deviations below.
- **React 18.3 / TS 5.6 explicit pin.** create-vite (v9.0.6) defaults to React 19.2 + TS 6.0. Plan + research target React 18 (testing-library/react@16 peer-deps, Phase 1 ecosystem). Overrode the create-vite defaults in package.json before `npm install` re-resolved the tree. Also dropped `erasableSyntaxOnly` from the tsconfigs since TS 5.6 doesn't have it.
- **Style preset = radix-nova.** Plan said "Style: New York, Base color: Neutral". shadcn 4.5 replaced the New York/default style picker with named presets (nova/vega/maia/lyra/mira/luma/sera). Picked `nova` (Lucide + Geist) as the closest visual cousin of the plan's intent, with `-b radix` for the component library and `--css-variables` matching the plan. Result: `style: "radix-nova"` in components.json. baseColor still neutral.
- **Path alias defined in three places.** Vite runtime needs `resolve.alias`, tsc needs `compilerOptions.paths` in tsconfig.app.json, and the shadcn CLI needs `compilerOptions.paths` in the *root* tsconfig.json (it reads that file specifically). Set all three to keep dev/build/typecheck/shadcn-add all consistent.
- **tsconfig.app.json includes tests/.** Plan asked for this so tsc --noEmit also checks the test suite. Confirmed working: `npm run typecheck` exits 0.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn 4.5 init no longer scaffolds Vite — needs an existing project**
- **Found during:** Task 1, Step 2 (running `npx shadcn@latest init -t vite`)
- **Issue:** CLI exited with "We could not detect a supported framework at /Users/iansabia/Desktop/UI:UX Final. Visit https://ui.shadcn.com/docs/installation/manual to manually configure your project." The plan's assumption that `init -t vite` is a one-shot scaffolder is no longer correct as of shadcn 4.5.0.
- **Fix:** Ran `npm create vite@latest temp-vite -- --template react-ts --yes` to generate a Vite project; copied the relevant files (index.html, eslint.config.js, tsconfig.*.json, src/main.tsx, src/index.css) into the repo root; deleted the temp-vite directory; replaced the demo App.tsx with a minimal placeholder; replaced index.css with `@import "tailwindcss";`; installed `tailwindcss@^4` and `@tailwindcss/vite@^4`; rewrote vite.config.ts to include the tailwindcss plugin + @ alias + server.port=5173; then re-ran `shadcn init -t vite -b radix -p nova --css-variables --yes` which succeeded (preflight, Vite detected, Tailwind v4 detected, @ alias detected, components.json + utils.ts + button.tsx written, index.css populated with shadcn theme variables).
- **Files affected:** vite.config.ts (created), tsconfig.json (updated to include paths for shadcn CLI), tsconfig.app.json/tsconfig.node.json (downgraded to TS 5.6 compatible), src/index.css (replaced), src/App.tsx (replaced), src/main.tsx (kept as-is from Vite default)
- **Verification:** shadcn init succeeded; components.json present; src/lib/utils.ts and src/components/ui/button.tsx exist with expected exports.
- **Committed in:** 24d3df2 (Task 1)

**2. [Rule 1 - Bug] create-vite defaults clash with plan's React 18 / TS 5.6 stack**
- **Found during:** Task 1, immediately after copying create-vite scaffold (before npm install)
- **Issue:** create-vite v9.0.6 produces a package.json pinned to React 19.2 + TypeScript 6.0 + ESLint 10. The plan and Phase 1 research target React 18.3 (peer-dep range for @testing-library/react@^16) and TS 5.6. TS 6 also adds `erasableSyntaxOnly` to the default tsconfig which doesn't exist in 5.6 and would block the build.
- **Fix:** Hand-edited the merged package.json to pin react/react-dom@^18.3.1, @types/react@^18.3.12, typescript@~5.6.0, vite@^6.0.0, @vitejs/plugin-react@^4.3.3, eslint@^9.13.0; deleted node_modules + package-lock.json; ran `npm install` to regenerate the tree; removed `erasableSyntaxOnly` from tsconfig.app.json and tsconfig.node.json; lowered `target` from es2023 to ES2022.
- **Files affected:** package.json, package-lock.json, tsconfig.app.json, tsconfig.node.json
- **Verification:** `npm run build` exits 0; React 18.3.1 resolves; testing-library/react@16 peer-deps satisfied; Plan 01-01 sanity tests pass.
- **Committed in:** 24d3df2 (Task 1)

**3. [Rule 2 - Critical functionality] Plan's required style "New York / Neutral" no longer exists in shadcn 4.5**
- **Found during:** Task 1, Step 2 (interactive prompts)
- **Issue:** shadcn 4.5 replaced the legacy style picker (Default/New York) with named presets (nova/vega/maia/lyra/mira/luma/sera) chosen via `-p`. The classic "New York" preset is no longer a CLI option. Without picking one, the init prompts indefinitely.
- **Fix:** Picked `-b radix -p nova` (radix component library + nova preset = Lucide icons + Geist font), the closest aesthetic to the plan's New York intent. Resulting components.json has `"style": "radix-nova"` and `"baseColor": "neutral"` as required. cssVariables: true preserved.
- **Files affected:** components.json
- **Verification:** components.json exists; style+baseColor as documented above; shadcn add card/sonner works against the registry.
- **Committed in:** 24d3df2 (Task 1)

**4. [Rule 2 - Critical functionality] tsconfig.json needed paths field for shadcn CLI alias detection**
- **Found during:** Task 1, Step 2 (re-running shadcn init after vite scaffold)
- **Issue:** shadcn init's "Validating import alias" step reads the *root* tsconfig.json (not tsconfig.app.json). The create-vite root tsconfig.json only has `references`, no compilerOptions. Without paths there the CLI would fail validation or prompt for manual alias entry.
- **Fix:** Added `compilerOptions.baseUrl` + `compilerOptions.paths["@/*"]` to tsconfig.json *in addition to* tsconfig.app.json. Both are needed.
- **Files affected:** tsconfig.json
- **Verification:** shadcn init logged "Validating import alias. ✔" and proceeded.
- **Committed in:** 24d3df2 (Task 1)

---

**Total deviations:** 4 auto-fixed (1 blocking, 1 bug, 2 critical functionality)
**Impact on plan:** All four fixes were structural — required to satisfy the plan's done-criteria (Vite scaffolded, shadcn primitives present, React 18 in deps). No scope creep: final file count and dependency list match the plan's must_haves and acceptance_criteria. The "New York" style label is the only must_have that did not survive (replaced with "radix-nova") because shadcn 4.5 dropped New York from the CLI; functionally equivalent.

## Issues Encountered

None beyond the deviations above. All plan verification commands pass:
- `npm run dev` → boots on http://localhost:5173, serves HTML with `<div id="root">` and `<script type="module" src="/src/main.tsx">`
- `npm run build` → exits 0, produces `dist/index.html` + chunks
- `npm run typecheck` → exits 0
- `npm test -- --run tests/setup.test.tsx` → 5/5 passing (Plan 01-01 sanity suite)
- `npm run lint:no-direct-localstorage` → exits 0
- `! test -f postcss.config.js` → confirmed absent
- `package.json` lists react-router, zustand, zod, next-themes, simple-icons, vitest

## User Setup Required

None — no external service configuration. The dev server runs purely locally.

## Next Phase Readiness

- **Ready for Plan 01-03 (lib + types + data layers).** Path alias `@/` works; runtime deps zod + zustand + next-themes are installed; src/lib/utils.ts is the canonical place for shared helpers (the plan can colocate storage.ts here). Plan 03 can now author types under src/types/, data under src/data/, and lib helpers without further dep installs.
- **Ready for Plan 01-04 (router + AppShell).** react-router@7.14 is installed; the three shadcn primitives Plan 04 needs (Button, Card, Toaster) are present at @/components/ui/{button,card,sonner}. App.tsx is currently a placeholder that imports Button — Plan 04 owns replacing it with `<ThemeProvider><RouterProvider /></ThemeProvider>` + a single `<Toaster />`.
- **Important note for Plan 03+:** when shadcn add brings in new primitives, they will continue to be written into src/components/ui/ and any new transitive deps merged into dependencies. shadcn registry is at "radix-nova" — keep using `npx shadcn@latest add <name>` for additional primitives.
- **Important note for Plan 04 re: theming:** src/index.css already has the full shadcn neutral-base CSS variable set for both :root and .dark, plus tw-animate-css and Geist font imports. Plan 04 only needs to add the brand override variables (--primary: emerald, --accent: orange) per CONTEXT.md, not the full theme scaffolding.

## Self-Check: PASSED

- File `vite.config.ts` exists: FOUND
- File `tsconfig.app.json` exists with `"noUncheckedIndexedAccess": true`: FOUND
- File `components.json` exists: FOUND
- File `src/lib/utils.ts` exists with `cn` export: FOUND
- File `src/components/ui/button.tsx` exists: FOUND
- File `src/components/ui/card.tsx` exists: FOUND
- File `src/components/ui/sonner.tsx` exists: FOUND
- File `src/index.css` contains `@import "tailwindcss"`: FOUND
- File `index.html` at repo root: FOUND
- File `postcss.config.js`: ABSENT (as required)
- `package.json` dependencies contains "react-router", "zustand", "zod", "next-themes", "simple-icons", react@^18: FOUND
- `package.json` devDependencies contains "vitest": FOUND
- Commit `24d3df2` (Task 1): FOUND in git log
- Commit `17f39ab` (Task 2): FOUND in git log
- `npm run dev` boots on 5173: PASS
- `npm run build` exits 0 with dist/index.html: PASS
- `npm run typecheck` exits 0: PASS
- `npm test -- --run tests/setup.test.tsx` exits 0 with 5 passing: PASS
- `npm run lint:no-direct-localstorage` exits 0: PASS

---
*Phase: 01-foundation*
*Completed: 2026-04-27*
