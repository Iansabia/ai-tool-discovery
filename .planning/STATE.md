---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
stopped_at: Completed 01-03-PLAN.md
last_updated: "2026-04-27T01:52:07.703Z"
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 5
  completed_plans: 3
---

# Project State: AI Tools Discovery Platform

**Last updated:** 2026-04-27 (Plan 01-03 complete)

## Project Reference

**Core value:** Help students find and choose AI tools faster — every tool has its own real detail page, every comparison reflects the user's actual choice, and every action gives clear, immediate feedback.

**Current focus:** Phase 1 (Foundation) — Plans 01-01 + 01-02 + 01-03 complete (test infrastructure + Vite/shadcn scaffold + lib/types/data layers). Ready for Plan 01-04 (router + AppShell + theme).

**Stack:** Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui + react-router v7 + Zustand + Zod v3 + react-hook-form + sonner + next-themes + fuse.js + motion v12

**Timeline:** 2026-04-26 to 2026-05-10 (2 weeks). Week 1: Phases 1-3 (foundation through ugly-but-working features). Week 2: Phases 4-5 (polish + pre-demo hardening).

## Current Position

**Phase:** 1 — Foundation (in progress)
**Plan:** 01-03 complete; next is 01-04 (router + AppShell + theme)
**Status:** Foundation modules in place — types/storage/validators all tested; 3/5 plans done in Phase 1

**Overall progress:** [▰▰▰▱▱▱▱▱▱▱] 3/25 plans across all phases (~12%); 0/5 phases complete

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Foundation | In progress | 3/5 plans (60%) |
| 2. Auth + Persistence Stores | Not started | 0% |
| 3. Feature Breadth (Ugly But Working) | Not started | 0% |
| 4. Polish, Dark Mode, Accessibility | Not started | 0% |
| 5. Pre-Demo Hardening | Not started | 0% |

## Performance Metrics

**Requirements coverage:** 70/70 v1 requirements mapped to phases (100%); 4/70 marked complete (FOUND-01, FOUND-04, FOUND-05, UX-07)
**Phases:** 5 (coarse granularity, within 4-6 target)
**Plans completed:** 3
**Commits:** 8 task commits in current phase (a5c01bf, d77def5, 24d3df2, 17f39ab, e60d064, f865b01, c0c6360, 69038e5)

| Plan | Duration | Tasks | Files | Commits |
|------|----------|-------|-------|---------|
| 01-01 (test infrastructure) | 2 min | 2 | 5 | 2 task + 1 metadata |
| 01-02 (vite + shadcn scaffold) | 6 min | 2 | 17 | 2 task + 1 metadata |
| 01-03 (lib + types + data) | 3 min | 3 | 6 | 4 task + 1 metadata |

## Accumulated Context

### Key Decisions

- **URL is source of truth for Compare and Tool Detail.** `/tools/:slug` and `/compare/:a/vs/:b` use `useParams` lookups against a slug-keyed seed array. No component-local state for "selected tool." This is the structural fix for the two prototype bugs.
- **Vote state is `'none' | 'up' | 'down'` per (user, tool)** in a single global Zustand store. Count is derived. Functional state updaters only. This is the structural fix for the upvote bug.
- **Persistence stores precede feature UI.** Phase 2 builds all stores before Phase 3 builds any feature buttons.
- **Breadth before polish.** Phase 3 ships every feature ugly-but-working. Phase 4 is polish. No interleaving.
- **Pre-demo hardening is its own phase.** Fresh-browser walkthrough, production build, deploy smoke test, demo account auto-fill — all gated to Phase 5 to prevent demo-day fresh-browser bugs.
- **Zod v3, not v4.** `@hookform/resolvers@5.2` has TypeScript overload issues with Zod v4.3 as of March 2026.
- **(Plan 01-01) JSX in test files via automatic runtime + .test.tsx extension.** vitest.config.ts has `esbuild: { jsx: "automatic" }`; test files containing JSX use `.test.tsx`. No `import React` needed in tests.
- **(Plan 01-01) npm scripts invoke local binaries via `node ./node_modules/<pkg>/<bin>`.** The working directory contains a colon (`UI:UX Final`) which corrupts npm's PATH augmentation. All npm scripts that reference local binaries must use direct node invocation, not bare names like `vitest` or `vite`. This rule applies to ALL future plans.
- **(Plan 01-02) shadcn 4.5 init no longer scaffolds Vite.** The CLI requires an existing Vite project as of v4.5. We bootstrap with `npm create vite@latest -- --template react-ts`, then run `shadcn init -t vite -b radix -p nova` to layer the registry on top.
- **(Plan 01-02) Pinned React 18.3 + TS 5.6.** create-vite defaults to React 19.2 + TS 6.0; we override to match the plan's stack. testing-library/react@^16 peer-deps need React 18.
- **(Plan 01-02) Style preset = radix-nova.** shadcn 4.5 dropped New York/Default style names in favor of named presets (nova/vega/...). Picked `nova` (Lucide + Geist) as functional equivalent of plan's "New York" intent. baseColor still neutral.
- **(Plan 01-02) Path alias @ defined in three places.** vite.config.ts (resolve.alias for runtime), tsconfig.json (paths for shadcn CLI detection), tsconfig.app.json (paths for tsc typecheck). All three are required.
- **(Plan 01-03) Synthetic StorageEvent omits `storageArea`.** Plan 01-01's per-test localStorage mock (plain object via `vi.stubGlobal`) does NOT satisfy the real DOM `Storage` interface. Constructing `new StorageEvent("storage", { storageArea: nonStorage })` throws TypeError in jsdom. Subscribers only key off `event.key`, so storageArea is informational. Apply this convention to any future code that synthesizes StorageEvents.
- **(Plan 01-03) Zod safeGet uses explicit `as T` cast.** `tsc --noEmit` accepted the unwrapped Zod result, but `tsc -b` (project-mode used by `npm run build`) flagged the assignability gap. Cast is safe because `result.success === true` already validated `data` against `ZodType<T>`. Standard pattern with Zod generics.
- **(Plan 01-03) Build-time validators live in `src/data/_validate.ts` (double-underscored, internal-only).** Plan 01-05's `tools.ts` MUST import them and call them at module load (top-level, not inside a function) so they fire on dev-server startup AND during `vite build`.
- **(Plan 01-03) Storage envelope versioning convention: start at `version: 1`.** Stores bump to 2/3/etc when persisted shape changes. The helper falls back to default on version mismatch — no migration logic exists yet. Phase 2 stores should start at version 1.

### Open Questions / Todos

- [x] Plan Phase 1 (5 plans defined)
- [x] Plan 01-01 executed (test infrastructure)
- [x] Plan 01-02 executed (Vite + shadcn/ui scaffold; FOUND-01 satisfied)
- [x] Plan 01-03 executed (lib + types + data layers; FOUND-04, FOUND-05, UX-07 satisfied)
- [ ] Plan 01-04: router + AppShell — react-router 7 installed, App.tsx is placeholder ready to be replaced
- [ ] Plan 01-05: seed data + brand tokens — must call `__validateSlugsUnique` and `__validateLogosPresent` from `@/data/_validate` at module load in `tools.ts`
- [ ] Decide logo asset strategy in Phase 1: source from each tool's brand kit vs. generic placeholder mark + name fallback (research flagged this as a gap) — relevant to Plan 01-04 or 01-05 (seed data)
- [ ] Decide mobile responsive scope at Phase 4: PROJECT.md says "tablet required, mobile nice-to-have"; Compare table at 768px is the hardest layout
- [ ] **(Plan 01-02 carryover)** Plan 04 will replace src/App.tsx with `<ThemeProvider><RouterProvider /></ThemeProvider>` + a single `<Toaster />`. src/index.css already has the full neutral-base shadcn theme variables; Plan 04 only needs to add brand override variables (--primary: emerald, --accent: orange).

### Blockers

None.

### Risks Watchlist

| Risk | Phase | Mitigation |
|------|-------|------------|
| Compare/Tool-Detail bugs recur | Phase 1 (structural prevention) + Phase 3 (verification via 9-combination click-test) | URL-as-source-of-truth + slug primary keys + build-time uniqueness validation |
| Vote toggle inconsistency | Phase 2 (store before UI) | State machine in `upvoteStore` before Phase 3 ranking UI exists |
| FOUC / hydration flicker | Phase 1 | Inline `<script>` in `index.html` + lazy `useState` for persisted state |
| Polish-before-correctness timeline trap | Phase ordering (Phase 4 only after Phase 3) | Hard rule: no animation, spacing tweaks, or custom typography in Phase 3 |
| Demo-day fresh-browser bugs | Phase 5 | Dedicated incognito walkthrough + production build verification + deploy smoke test |
| localStorage schema drift | Phase 1 | Zod-validated reads + version fields in storage helper from day one |

## Session Continuity

**Last session:** 2026-04-27T01:52:07.701Z
**Next action:** Execute Plan 01-04 (router + AppShell + theme)
**Stopped at:** Completed 01-03-PLAN.md

**Files of record:**
- `.planning/PROJECT.md` — vision, scope, constraints, key decisions
- `.planning/REQUIREMENTS.md` — 70 v1 requirements + traceability table
- `.planning/ROADMAP.md` — 5 phases with success criteria
- `.planning/research/SUMMARY.md` — research synthesis
- `.planning/research/STACK.md` — dependency picks (HIGH confidence)
- `.planning/research/ARCHITECTURE.md` — folder layout, route map, data model
- `.planning/research/PITFALLS.md` — 12 critical pitfalls with phase mappings

---
*State initialized: 2026-04-26*
