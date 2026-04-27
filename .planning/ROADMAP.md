# Roadmap: AI Tools Discovery Platform

**Created:** 2026-04-26
**Granularity:** coarse (4-6 phases)
**Total v1 requirements:** 70
**Mapped to phases:** 70/70 (100% coverage)
**Timeline:** 2 weeks (2026-04-26 to 2026-05-10)

## Core Value

Help students find and choose AI tools faster — every tool has its own real detail page, every comparison reflects the user's actual choice, and every action gives clear, immediate feedback.

## Strategy

This roadmap encodes three load-bearing decisions from research:

1. **URL-as-source-of-truth is a Foundation deliverable.** Slug routes (`/tools/:slug`, `/compare/:a/vs/:b`) and slug-keyed seed data are wired before any feature UI. This structurally prevents the Compare and Tool-Detail bugs the rebuild exists to fix.
2. **Persistence stores precede feature UI.** The vote store (with `'none' | 'up' | 'down'` state machine), favorites store, review store, and submission store all exist with localStorage hooks before their buttons get built. Building the vote button before the vote store recreates the upvote bug.
3. **Breadth before polish.** End of Week 1 = every required feature has an ugly-but-working version. No animation, spacing tweaks, or custom typography in Week 1. Polish, dark-mode visual sweep, and accessibility are their own phase. Pre-demo hardening (incognito walkthrough, production build, deploy smoke test) is its own short final phase.

## Phases

- [ ] **Phase 1: Foundation** — URL-as-truth scaffolding, types, storage layer, seed data, theme tokens, FOUC script
- [ ] **Phase 2: Auth + Persistence Stores** — All Zustand stores, mock auth, protected routes, two-step onboarding
- [ ] **Phase 3: Feature Breadth (Ugly But Working)** — Every feature shipped with empty states + toasts; visuals deliberately unpolished
- [ ] **Phase 4: Polish, Dark Mode, Accessibility** — Visual sweep, focus traps, keyboard pass, motion, "recommended because" reasoning, toned-down compare rows
- [ ] **Phase 5: Pre-Demo Hardening** — Incognito walkthrough, production build verification, deploy smoke test, demo account auto-fill

## Phase Details

### Phase 1: Foundation

**Goal**: A scaffolded SPA with every architectural pitfall structurally prevented before a single feature is built — URL is source of truth, slugs are unique, storage is namespaced and validated, theme tokens are defined for both modes.

**Depends on**: Nothing (first phase)

**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, DATA-01, DATA-02, DATA-03, UX-03, UX-07, UX-08

**Success Criteria** (what must be TRUE):
1. Direct URL navigation to `/tools/:slug` and `/compare/:a/vs/:b` works for any seed tool — refreshing on either route renders the correct content sourced from the URL, not from any in-memory state.
2. The seed dataset of ~50 tools across ~10 categories is loaded with build-time uniqueness validation — duplicate slugs fail the build, every tool has a name, description, category, pricing, features, and external URL.
3. Toggling between system light and dark color schemes in DevTools shows brand green primary and orange accent values from CSS variables (no `bg-green-*` or `text-orange-*` literals exist in app code) — and there is no FOUC on hard refresh because the inline `index.html` script applies the theme class before React mounts.
4. Every route in the app is registered (placeholder pages OK), `<Toaster />` is mounted exactly once at root via AppShell, and the storage helper exposes namespaced keys (`aitools:<domain>:<scope>`) with Zod-validated reads and a `storage` event listener wired for multi-tab consistency.

**Plans**: 5 plans

Plans:
- [x] 01-foundation/01-01-PLAN.md — Wave 0: Vitest test infrastructure (config, setup, sanity test, npm scripts) ✓ 2026-04-27
- [x] 01-foundation/01-02-PLAN.md — Wave 1: Vite + React + TS + Tailwind v4 + shadcn/ui scaffold via shadcn CLI; install runtime deps; enable TS strict + noUncheckedIndexedAccess; add button/card/sonner primitives ✓ 2026-04-27
- [ ] 01-foundation/01-03-PLAN.md — Wave 2: Domain types (Tool/Category/User/Session/Review/UpvoteRecord/Submission), storage helper (namespaced + Zod-validated + same/cross-tab events), build-time slug + logo validators, all with Vitest coverage
- [ ] 01-foundation/01-04-PLAN.md — Wave 3: Router (18 routes), AppShell + Toaster mount, brand tokens (CSS vars for :root and .dark), inline FOUC script, next-themes ThemeProvider + ThemeToggle, ProtectedRoute stub, placeholder pages with useParams, multi-tab theme consistency
- [ ] 01-foundation/01-05-PLAN.md — Wave 4: Categories seed (10), Tools seed (50+), real brand SVG logos (no fallbacks), wire build-time validators in tools.ts, SPA fallback configs (vercel.json + Netlify _redirects), check-logos CLI script

---

### Phase 2: Auth + Persistence Stores

**Goal**: Every persisted concern (auth, users, favorites, votes, reviews, submissions) has its Zustand store wired to localStorage with the correct state shape — including the vote state machine — and users can sign up, sign in, sign out, complete two-step onboarding, and have selections survive refresh.

**Depends on**: Phase 1 (storage helper, types, AppShell, router, theme)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, ONBO-01, ONBO-02, ONBO-03, ONBO-04, ONBO-05, ONBO-06

**Success Criteria** (what must be TRUE):
1. A new user can sign up with email and password, land on the two-step onboarding wizard, toggle interests on and off (no preselected items, clicking deselects), navigate back to step 1 from step 2 without losing selections, finish, and arrive at `/home` with their interests and selected tools persisted to their user record.
2. Sign in with email/password succeeds, the session survives a full browser refresh, the user can log out from the header on any page, and a guest user can continue without an account via "Continue as Guest" with a clearly-scoped guest session.
3. Visiting any protected route (`/onboarding`, `/home`, `/favorites`, `/profile`, `/submit`) while signed out redirects to `/signin` and preserves the original URL so the user lands back on it after authenticating.
4. All non-auth Zustand stores exist and persist to namespaced localStorage keys before any feature UI is built — `favoritesStore`, `upvoteStore` (with `'none' | 'up' | 'down'` per-(user,tool) state machine), `reviewStore`, `submissionStore` — each with version field, Zod-validated reads, and a single write path through the persist middleware.
5. Form validation displays inline errors for invalid email, weak password, and mismatched confirm-password; the mock forgot-password flow shows the same reassuring success state regardless of whether the email exists.

**Plans**: TBD (1-3 plans, parallelizable after stores are scaffolded)

---

### Phase 3: Feature Breadth (Ugly But Working)

**Goal**: Every required v1 feature has a working, deliberately unpolished implementation — Compare picks two tools and renders their data in a 2-column div, Rankings is a flat list with working votes, every persisting action emits a toast, every empty list ships its empty state. No animation, no spacing tweaks, no custom typography.

**Depends on**: Phase 2 (all stores wired, auth works)

**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06, DISC-07, DISC-08, TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, TOOL-08, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMM-01, COMM-02, COMM-03, COMM-04, COMM-05, COMM-06, COMM-07, COMM-08, COMM-09, USER-01, USER-02, USER-03, USER-04, UX-01, UX-06

**Success Criteria** (what must be TRUE):
1. **The Compare bug cannot recur.** From any tool detail page, clicking Compare routes to `/compare/:slug` (picker), selecting a second tool routes to `/compare/:a/vs/:b`, and the side-by-side table renders unique data sourced from URL params for both tools — verified by the 9-combination click-test (3 origin tools × 3 second tools all render unique content). Swap, change-either-tool, save-comparison, and `a === b` dev assertion all work.
2. **The Tool Detail bug cannot recur.** Every tool in the ~50-tool dataset routes to its own page at `/tools/:slug` with unique name, description, category, pricing, features, and external link — clicking 10 random tools shows 10 different pages — and an unknown slug renders the NotFound state, not a fallback tool.
3. **Every persisting action gives clear feedback.** Favoriting, unfavoriting, upvoting (state machine: clicking same vote toggles off, opposite vote switches sides), downvoting, submitting a review, submitting a tool, saving a profile change, and saving a comparison each emit a sonner toast — and the rankings list reorders by net upvotes after every vote.
4. **Discovery flows work end-to-end.** Landing page renders hero + value pillars + trusted-by + CTAs and Skip-to-Demo; logged-in home shows recommendations based on the user's selected interests; All Categories shows every category with tool counts; per-category page lists all tools in that category; header search navigates to `/search?q=...` and renders fuse.js fuzzy matches with an empty state when no tools match.
5. **Community + user-state surfaces are real.** Rankings shows all tools ordered by net upvotes; Write Review modal accepts 1-5 star rating + text and persists per tool; Submit-a-Tool form accepts name/URL/category/description/tags, adds to a local pending queue (visible on profile), and routes to a success screen; Favorites page lists saved tools; Profile shows display name, email, interests, and pending submissions; user can edit display name and interests.
6. **Every list ships an empty state in the same commit as the feature.** Favorites-empty, no-reviews-yet, no-pending-submissions, no-search-results, and no-onboarding-selections all render friendly states — never a blank screen, never `undefined` in the UI.

**Plans**: TBD (2-3 plans, heavily parallelizable across feature areas)

---

### Phase 4: Polish, Dark Mode, Accessibility

**Goal**: Every feature that worked ugly in Phase 3 now feels polished — dark mode is visually correct on every component, every interactive element has a visible focus ring, modals trap focus and restore it on close, the compare table de-emphasizes matching rows, motion adds confidence to vote and modal interactions, and the "Recommended because…" reasoning shows on home.

**Depends on**: Phase 3 (every feature working ugly)

**Requirements**: UX-02, UX-04, UX-05

**Success Criteria** (what must be TRUE):
1. The header theme toggle switches between light and dark, the choice persists across sessions, every component (cards, modals, forms, toasts, rankings, compare table) is visually correct in both modes — and a grep of app code finds zero raw color literals (no `bg-green-*`, no `text-orange-*`, no `bg-white dark:bg-gray-900`); all colors come from semantic tokens.
2. A full Tab pass through the app reveals a visible focus ring on every interactive element (buttons, links, inputs, cards, vote buttons, theme toggle, search bar) — axe DevTools shows zero critical or serious violations.
3. Opening any modal (Write Review, edit profile) traps focus inside the dialog, closes on Escape, and restores focus to the trigger element on close — using shadcn `<Dialog>` consistently.
4. The Compare table tones down (de-emphasizes) rows where the two tools share the same value so differences stand out visually; the logged-in home shows "Recommended because you picked [Category]" reasoning beneath each personalized recommendation.
5. Motion polish makes interactions feel intentional — Rankings list reorders on vote with a smooth animation, modals enter/exit cleanly, page transitions use `<AnimatePresence mode="wait">`, and the landing hero has a subtle entrance — without crossing into gratuitous animation.

**Plans**: TBD (1-2 plans, can parallelize accessibility sweep with visual polish)

---

### Phase 5: Pre-Demo Hardening

**Goal**: The deployed app survives a fresh-browser, direct-URL, production-build walkthrough by a grader who has never seen it before — no FOUC, no blank screens, no `undefined` in the UI, no auth-flow friction.

**Depends on**: Phase 4 (polish complete)

**Requirements**: (no new requirements — this phase verifies all 70 v1 requirements survive a fresh-browser walkthrough)

**Success Criteria** (what must be TRUE):
1. An incognito-window walkthrough hits every route by direct URL (not by clicking through), exercises every persisting action, and surfaces no blank screens, no `undefined` text, no console errors, and no broken refreshes — including direct navigation to `/tools/:slug`, `/compare/:a/vs/:b`, `/categories/:slug`, and `/search?q=...`.
2. `vite build && vite preview` produces a working static site that behaves identically to the dev server — auth, favorites, votes, reviews, submissions, and theme all persist across refresh in the production bundle.
3. The site is deployed to Vercel or Netlify and the deployed URL passes the same smoke test as `vite preview` — including a real-domain refresh on `/compare/:a/vs/:b` working without 404 (SPA fallback configured).
4. The Sign In page offers a one-click demo affordance ("Try it: demo@bu.edu / demo" auto-fill, or "Sign in as demo user" button) so a grader can reach the logged-in experience in under 10 seconds — and a dev-only reset-app button is available for re-running the fresh-browser walkthrough.

**Plans**: TBD (1 plan, sequential — final hardening pass before submission)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/5 | In Progress | - |
| 2. Auth + Persistence Stores | 0/? | Not started | - |
| 3. Feature Breadth (Ugly But Working) | 0/? | Not started | - |
| 4. Polish, Dark Mode, Accessibility | 0/? | Not started | - |
| 5. Pre-Demo Hardening | 0/? | Not started | - |

## Coverage Summary

| Category | Count | Phase Mapping |
|----------|-------|---------------|
| Foundation (FOUND-01..07) | 7 | Phase 1 |
| Authentication (AUTH-01..08) | 8 | Phase 2 |
| Onboarding (ONBO-01..06) | 6 | Phase 2 |
| Discovery (DISC-01..08) | 8 | Phase 3 |
| Tool Detail (TOOL-01..08) | 8 | Phase 3 |
| Compare (COMP-01..10) | 10 | Phase 3 |
| Community (COMM-01..09) | 9 | Phase 3 |
| User State (USER-01..04) | 4 | Phase 3 |
| Cross-Cutting UX (UX-01..08) | 8 | Phase 1 (UX-03, UX-07, UX-08) + Phase 3 (UX-01, UX-06) + Phase 4 (UX-02, UX-04, UX-05) |
| Data (DATA-01..03) | 3 | Phase 1 |
| **Total v1** | **70** | **70 mapped, 0 orphaned** |

## Out-of-Scope Confirmation

Per PROJECT.md and REQUIREMENTS.md `Out of Scope`:
- No real backend (Supabase, API server) — all persistence is localStorage
- No real email sending for forgot-password (mock only)
- No server-side moderation (submissions stay in local pending queue)
- No multi-device sync (multi-tab handled via storage event in Phase 1)
- No mobile-native, no admin dashboard, no payments, no OAuth, no AI chat

v2 deferred (BACK-*, ADV-*) — not in this roadmap.

---
*Roadmap created: 2026-04-26*
