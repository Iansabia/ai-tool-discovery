---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 02-04-PLAN.md
last_updated: "2026-04-27T20:57:44.959Z"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 9
  completed_plans: 9
---

# Project State: AI Tools Discovery Platform

**Last updated:** 2026-04-27 (Plan 02-04 complete — non-auth stores + withToast shipped; Phase 2 DONE)

## Project Reference

**Core value:** Help students find and choose AI tools faster — every tool has its own real detail page, every comparison reflects the user's actual choice, and every action gives clear, immediate feedback.

**Current focus:** Phase 2 COMPLETE (4/4 plans done). Plan 02-04 shipped favoritesStore + upvoteStore (with locked vote state machine) + reviewStore + submissionStore + withToast utility, and un-skipped A11/A12 (BLOCKER 2 wire complete). Next is Phase 3 (Feature Breadth — ugly but working).

**Stack:** Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui + react-router v7 + Zustand + Zod v3 + react-hook-form + sonner + next-themes + fuse.js + motion v12

**Timeline:** 2026-04-26 to 2026-05-10 (2 weeks). Week 1: Phases 1-3 (foundation through ugly-but-working features). Week 2: Phases 4-5 (polish + pre-demo hardening).

## Current Position

**Phase:** 2 — Auth + Persistence Stores (COMPLETE)
**Plan:** All 4 plans done. Next phase is 3 (Feature Breadth — Ugly But Working).
**Status:** Phase 2 fully shipped; ready to plan Phase 3.

**Overall progress:** [▰▰▰▰▰▰▰▰▰▱] 9/25 plans across all phases (~36%); 2/5 phases complete

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Foundation | Complete | 5/5 plans (100%) |
| 2. Auth + Persistence Stores | Complete | 4/4 plans (100%) |
| 3. Feature Breadth (Ugly But Working) | Not started | 0% |
| 4. Polish, Dark Mode, Accessibility | Not started | 0% |
| 5. Pre-Demo Hardening | Not started | 0% |

## Performance Metrics

**Requirements coverage:** 70/70 v1 requirements mapped to phases (100%); 29/70 marked complete (FOUND-01..07, DATA-01..03, UX-03, UX-07, UX-08, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, ONBO-01..06)
**Phases:** 5 (coarse granularity, within 4-6 target)
**Plans completed:** 9 (5 Phase 1 + 02-01 + 02-02 + 02-03 + 02-04). Phase 2 COMPLETE.
**Commits:** Phase 1 + 02-01 (177eedd, e09a80a, 4d78fde) + 02-02 (7206a54, 2267763) + 02-03 (37d36b6, 280415a) + 02-04 (7b77d9a, 560f094)

| Plan | Duration | Tasks | Files | Commits |
|------|----------|-------|-------|---------|
| 01-01 (test infrastructure) | 2 min | 2 | 5 | 2 task + 1 metadata |
| 01-02 (vite + shadcn scaffold) | 6 min | 2 | 17 | 2 task + 1 metadata |
| 01-03 (lib + types + data) | 3 min | 3 | 6 | 4 task + 1 metadata |
| 01-04 (router + AppShell + theme) | 4 min | 2 | 32 | 2 task + 1 metadata |
| 01-05 (seed data + brand logos + SPA fallback) | 7 min | 2 | 56 | 2 task + 1 metadata |
| 02-01 (authStore + usersStore + crypto) | ~15 min | 2 | 8 | 2 task + 1 metadata |
| 02-02 (auth pages + ProtectedRoute) | ~12 min | 2 | 21 | 2 task + 1 metadata |
| 02-03 (onboarding wizard) | ~? min | 2 | ? | 2 task + 1 metadata |
| 02-04 (non-auth stores + withToast) | ~4 min | 2 | 11 | 2 task + 1 metadata |

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
- **(Plan 01-04) Toaster mounts at App.tsx root, NOT inside AppShell.** AppShell is itself the parent route element and re-renders on nested route transitions; mounting Toaster inside it would unmount/remount it on every navigation. Mounting at App.tsx root keeps it alive across the entire app lifetime.
- **(Plan 01-04) next-themes uses raw key `"aitools:theme"` (no scope suffix).** This is divergent from the Phase 2 Zustand stores, which will use `storageKey("foo")` returning `"aitools:foo:global"`. ThemeToggle subscribes to the literal `"aitools:theme"` key, NOT to `storageKey("theme")`. Phase 2 must NOT try to "normalize" the theme key — next-themes is a third-party consumer with its own shape.
- **(Plan 01-04) Inline FOUC script in `index.html` is the single permitted localStorage-touching exception in `src/`-adjacent code.** It runs before React mounts and cannot import ESM modules. The lint script (`lint:no-direct-localstorage`) only scans `src/`, so this is structurally exempt. Don't add other exceptions.
- **(Plan 01-04) URL-as-source-of-truth pattern is structurally locked at the placeholder layer.** All param-bearing pages (Tool, Compare, Compare-Picker, Category) read via `useParams`; Search reads via `useSearchParams`. Tests assert that 3 different `/compare/a/vs/b` URLs render 3 different pairs — the prototype's hardcoded-Claude-vs-ChatGPT bug class cannot recur.
- **(Plan 01-05) FOUND-07 build-time enforcement is two-armed.** The plan's wording assumed module-load `__validateSlugsUnique` would fail `npm run build`, but vite build does NOT execute bundled JS. The structural fix is `scripts/check-logos.js` doing a static regex parse for duplicate slugs, chained into the build script BEFORE tsc/vite. The runtime arm (`__validateSlugsUnique(TOOLS)` at module load) is preserved because it fires during dev-server start AND test runs. Both arms together make duplicate slugs unreachable in any execution path. Mutation test confirmed: build exits 1 with `[check-logos] FAIL: duplicate slugs in tools.ts: - "chatgpt" (appears 2 times)`.
- **(Plan 01-05) Brand-logo strategy = 13 simple-icons CC0 + 37 project-authored brand-monograms.** simple-icons covers only 13 of the 50 chosen tools. Rather than ship a shared placeholder mark for the long tail (which would visually re-create the "everything is Claude" bug class), each tool gets a unique brand-monogram (24x24 SVG, rounded square in tool's official primary brand color, initials in high-contrast foreground). Each is unique to its tool — no two share color+initial. Provenance documented in `src/assets/tool-logos/README.md`. Phase 4 polish can progressively swap monograms for official brand-kit SVGs without breaking consumer code (logo URL string is stable).
- **(Plan 01-05) Side-effect import of @/data/tools in src/router.tsx.** No Phase 1 page consumes tools.ts (Phase 3 features will). Without the side-effect import, vite tree-shakes the module out of the production bundle and the runtime validators never fire on a real page load. The 1-line `import "@/data/tools"` in router.tsx keeps the validators reachable. Once Phase 3 starts importing TOOLS by name, the side-effect import becomes redundant but stays harmless.
- **(Plan 01-05) TOOLS shape for Phase 3.** TOOLS is `ReadonlyArray<Tool>` cast `as const`. Operations: `find`, `filter`, `map`, `forEach`, `reduce` work normally. In-place mutators are TypeScript errors. For Rankings sorting (by net upvotes), use `[...TOOLS].sort(...)` or `TOOLS.toSorted(...)` — the spread copy works on ES2022; `.toSorted` requires ES2023 (current tsconfig target is ES2022, so prefer the spread form).
- **(Plan 02-02) ProtectedRoute uses `useEffect` for `touchSession()`.** Calling `set` during render of a component that subscribes to that state would cause "state update during render" warnings (and could spin in dev). The effect runs synchronously after render in RTL, so the sliding-refresh test still verifies the wiring. The 25-day refresh threshold + 60s test tolerance keeps the assertion stable.
- **(Plan 02-02) shadcn `Form` primitive is hand-written.** The radix-nova preset's `form` registry returns an empty item, so we wrote the standard shadcn Form component directly into `src/components/ui/form.tsx`. Uses `radix-ui` meta-package's `Slot.Root` (matches Phase 1 Button conventions). Phase 4 polish can converge with shadcn's stock Form if/when nova ships it.
- **(Plan 02-02) Auth-aware Header renders three exclusive affordance sets.** Real-user / guest / unauthenticated each get their own block. Keeps the auth-state surface explicit at the layout level — easy to test (each state has a unique testid) and easy to extend (Phase 4 can add a profile dropdown without disturbing the others).
- **(Plan 02-02) `safeReturnTo` in SignInForm rejects absolute URLs.** Open-redirect protection: `params.get("return_to")` is only honored if it starts with `/`. Otherwise falls back to `/home`. Production posture, not just demo.
- **(Plan 02-02) `tests/setup.ts` has a `window.matchMedia` polyfill.** Sonner's Toaster reads it at mount time and jsdom doesn't ship it. Without the polyfill, every form test that mounts `<Toaster />` crashes. The polyfill returns `{ matches: false, ... }` for any query — narrow shape, no behavioral effect on tests.
- **(Plan 02-02) `useAuth()` is the standard component-facing API.** Components consume `useAuth()`, not `useAuthStore` directly. The hook returns reactive `session` (subscribed) plus action references and a non-reactive `currentUser`. Components that need to react to user-record updates (interests, displayName) should subscribe to `useUsersStore` directly.
- **(Plan 02-02) Sign In error wording is set via `form.setError("password", { message: r.error })`.** The literal string lives only in `@/features/auth/types` (`GENERIC_SIGNIN_ERROR`). SignInForm never duplicates it — preserves single source of truth and structurally prevents the wording from drifting between unknown-email and wrong-password paths.
- **(Plan 02-04) Vote state machine canonical phrasing.** `setVote(userId, slug, next: 'up'|'down')` resolves to `current === next ? "none" : next`. This single expression covers all 6 transitions (none↔up, none↔down, up↔down, plus the same-vote toggle-off paths). Phase 3's vote button must NOT re-implement this logic — it dispatches `setVote(_, _, "up" | "down")` and reads `getVote(_, _)` for the visual state.
- **(Plan 02-04) All 4 non-auth stores use `:global` scope with per-user data nested.** Keys: `aitools:favorites:global`, `aitools:upvotes:global`, `aitools:reviews:global`, `aitools:submissions:global`. The `{[userId]: ...}` map shape lives inside `data`. `clearByUser(userId)` removes that user's entry from the map (idempotent). reviewStore's clearByUser is special — reviews are keyed by tool slug, so it scans every slug bucket and filters by userId.
- **(Plan 02-04) `withToast` is unconstrained-generic with one ESLint disable.** The `(...args: any[]) => any` constraint on the wrapped function is necessary for pass-through typing — constraining tighter would force callers to retype every action. The disable is scoped to the file. All other code in the project remains strictly typed.
- **(Plan 02-04) BLOCKER 2 wire-completion.** `clearGuestData()` in authStore (Plan 02-01) dynamic-imports the four non-auth stores via `[...].join("/")` and calls `clearByUser?.('guest')` with optional-chain. As of this plan, all 4 stores ship clearByUser, so the wire is fully closed. A11/A12 in `src/features/auth/store.test.ts` un-skipped and passing.

### Open Questions / Todos

- [x] Plan Phase 1 (5 plans defined)
- [x] Plan 01-01 executed (test infrastructure)
- [x] Plan 01-02 executed (Vite + shadcn/ui scaffold; FOUND-01 satisfied)
- [x] Plan 01-03 executed (lib + types + data layers; FOUND-04, FOUND-05, UX-07 satisfied)
- [x] Plan 01-04 executed (router + AppShell + theme; FOUND-02, FOUND-03, FOUND-06, UX-03, UX-08 satisfied)
- [x] Plan 01-05 executed (seed data + brand logos + SPA fallback; FOUND-07, DATA-01, DATA-02, DATA-03 satisfied)
- [x] Logo asset strategy decided in Plan 01-05: 13 from simple-icons (CC0) + 37 project-authored brand-monograms (each unique, brand-color anchored). Phase 4 polish can progressively replace monograms with official brand-kit SVGs without breaking consumer code.
- [x] Plan 02-01 executed (authStore + usersStore + Web Crypto password helpers; AUTH-03 + AUTH-09 partial via clearGuestData scaffolding)
- [x] Plan 02-02 executed (auth pages + ProtectedRoute; AUTH-01, AUTH-02, AUTH-04..08 satisfied)
- [x] Plan 02-03 executed (onboarding wizard; ONBO-01..06 satisfied; `/onboarding/interests` and `/onboarding/tools` routes exist; final write path locked through `authStore.completeOnboarding`)
- [x] Plan 02-04 executed (favoritesStore + upvoteStore + reviewStore + submissionStore + withToast; vote state machine locked; clearByUser shipped on all 4 stores; A11/A12 un-skipped and passing — BLOCKER 2 wire complete)
- [ ] Phase 3 — feature breadth (favorite buttons, vote buttons, review modals, submit form, profile reads). Consume the Phase 2 stores via `withToast(...)`.
- [ ] Decide mobile responsive scope at Phase 4: PROJECT.md says "tablet required, mobile nice-to-have"; Compare table at 768px is the hardest layout
- [x] **(Plan 01-02 carryover, completed in Plan 01-04)** src/App.tsx now wraps RouterProvider in ThemeProvider; Toaster mounts at App.tsx root; src/index.css updated with brand override variables (--primary emerald, --accent orange) for both :root and .dark.

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

**Last session:** 2026-04-27T20:57:44.955Z
**Next action:** Plan Phase 3 (Feature Breadth — Ugly But Working). Phase 2 stores are ready for consumption: favorite buttons → `useFavoritesStore.toggle`, vote buttons → `useUpvoteStore.setVote`, review modal → `useReviewStore.add`, submit form → `useSubmissionStore.add`, all wrapped in `withToast(...)`.
**Stopped at:** Completed 02-04-PLAN.md (Phase 2 complete)

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
