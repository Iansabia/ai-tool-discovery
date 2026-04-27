# Project State: AI Tools Discovery Platform

**Last updated:** 2026-04-27 (Plan 01-01 complete)

## Project Reference

**Core value:** Help students find and choose AI tools faster — every tool has its own real detail page, every comparison reflects the user's actual choice, and every action gives clear, immediate feedback.

**Current focus:** Phase 1 (Foundation) — Plan 01-01 complete (test infrastructure). Ready for Plan 01-02 (Vite + shadcn/ui scaffold).

**Stack:** Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui + react-router v7 + Zustand + Zod v3 + react-hook-form + sonner + next-themes + fuse.js + motion v12

**Timeline:** 2026-04-26 to 2026-05-10 (2 weeks). Week 1: Phases 1-3 (foundation through ugly-but-working features). Week 2: Phases 4-5 (polish + pre-demo hardening).

## Current Position

**Phase:** 1 — Foundation (in progress)
**Plan:** 01-01 complete; next is 01-02 (Vite + shadcn/ui scaffold)
**Status:** Test infrastructure landed; 1/5 plans done in Phase 1

**Overall progress:** [▰▱▱▱▱▱▱▱▱▱] 1/25 plans across all phases (~4%); 0/5 phases complete

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Foundation | In progress | 1/5 plans (20%) |
| 2. Auth + Persistence Stores | Not started | 0% |
| 3. Feature Breadth (Ugly But Working) | Not started | 0% |
| 4. Polish, Dark Mode, Accessibility | Not started | 0% |
| 5. Pre-Demo Hardening | Not started | 0% |

## Performance Metrics

**Requirements coverage:** 70/70 v1 requirements mapped to phases (100%)
**Phases:** 5 (coarse granularity, within 4-6 target)
**Plans completed:** 1
**Commits:** 2 task commits in current phase (a5c01bf, d77def5)

| Plan | Duration | Tasks | Files | Commits |
|------|----------|-------|-------|---------|
| 01-01 (test infrastructure) | 2 min | 2 | 5 | 2 task + 1 metadata |

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

### Open Questions / Todos

- [x] Plan Phase 1 (5 plans defined)
- [x] Plan 01-01 executed (test infrastructure)
- [ ] Plan 01-02: Vite + shadcn/ui scaffold — must MERGE into existing package.json, must preserve direct-node script invocations, will create tsconfig.json (typecheck script becomes useful)
- [ ] Decide logo asset strategy in Phase 1: source from each tool's brand kit vs. generic placeholder mark + name fallback (research flagged this as a gap) — relevant to Plan 01-04 or 01-05 (seed data)
- [ ] Decide mobile responsive scope at Phase 4: PROJECT.md says "tablet required, mobile nice-to-have"; Compare table at 768px is the hardest layout
- [ ] **(Plan 01-01 carryover)** When Plan 02 runs `npx shadcn@latest init`, ensure it does not overwrite the four existing scripts (test, test:run, typecheck, lint:no-direct-localstorage). Manually merge if needed.

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

**Last session:** 2026-04-27 — completed Plan 01-01 (Wave 0 test infrastructure)
**Next action:** Execute Plan 01-02 (Vite + shadcn/ui scaffold)
**Stopped at:** Completed 01-01-PLAN.md

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
