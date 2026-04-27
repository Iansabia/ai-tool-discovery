# Project Research Summary

**Project:** AI Tools — Discovery, Compare & Community Platform
**Domain:** Static React SPA — AI tools directory with localStorage-only persistence (UI/UX final)
**Researched:** 2026-04-26
**Confidence:** HIGH

## Executive Summary

This is a localStorage-only React SPA in a mature product category (Product Hunt / There's An AI For That / Futurepedia analog). The PROJECT.md Active list already covers 100% of table-stakes features; the win is execution quality, not scope expansion. The stack (Vite + React 18 + TS + Tailwind v4 + shadcn/ui) is fixed, and the surrounding picks (react-router v7, Zustand+persist, react-hook-form+Zod v3, sonner, next-themes, fuse.js, motion) are well-established with HIGH confidence on every recommendation.

The dominant risk is **regressing the same usability bugs the rebuild exists to fix.** The Compare bug ("hardcoded Claude vs ChatGPT") and the Tool-Detail bug ("everything is Claude") are the same class of bug: state-not-derived-from-URL. Both are structurally prevented by one Foundation-phase decision — make slug-based URL routes the source of truth (`/tools/:slug`, `/compare/:a/vs/:b`) and forbid component-local state for selected tools. The vote-toggle bug is similarly preventable with a single global vote store using a state machine (`'none' | 'up' | 'down'`) rather than per-component state. Get these three architectural decisions right in week 1 and the highest-stakes bugs cannot recur.

The second-largest risk is the 2-week timeline trap: shadcn defaults look polished immediately, which seduces students into spacing tweaks instead of feature breadth. The roadmap must encode **breadth-before-polish**: end of week 1 = every required feature has an ugly, working version (Compare picks two tools and renders their data in a 2-column div); week 2 = dark mode, animations, empty states, accessibility sweep. Polish moved earlier means features moved later, which means features cut.

## Key Findings

### Recommended Stack

The base (Vite + React 18.3 + TS + Tailwind v4 + shadcn/ui CLI v4) is fixed by the user. The supporting stack is a tight, conventional set with no exotic picks; everything is HIGH confidence.

**Core technologies:**
- **react-router v7** (declarative mode) — all routing; URL is source of truth for Compare/Tool-Detail (the load-bearing architectural decision)
- **Zustand v5 + persist middleware** — one store per concern (auth, users, favorites, votes, reviews, submissions); built-in localStorage persistence
- **react-hook-form v7 + @hookform/resolvers v5 + Zod v3** — forms + validation; **Zod v3 not v4** (resolver TS overload mismatch with v4.3 as of March 2026)
- **shadcn/ui (CLI v4) + Tailwind v4 + tw-animate-css** — components and design system; do not install `tailwindcss-animate` (deprecated)
- **sonner** — toasts (already shipped via shadcn `add sonner`); mount `<Toaster />` once at root, never per page
- **next-themes** — dark/light toggle (works in Vite despite the name); pairs with inline `<script>` in `index.html` to prevent FOUC
- **motion v12** (formerly framer-motion) — animations for week-2 polish; AnimatePresence for route transitions, list reorder for Rankings
- **fuse.js v7** — fuzzy search over the ~50-tool catalog
- **lucide-react** — icons (shadcn default)

**Don't install (already shipped by shadcn):** sonner, react-hook-form, lucide-react, clsx, tailwind-merge, tw-animate-css, cmdk. **Don't use:** TanStack Query, Redux, Zod v4, react-hot-toast, framer-motion (renamed), tailwindcss-animate, Material/Chakra/Mantine, Yup, react-icons, react-helmet, postcss.config.js.

### Expected Features

PROJECT.md Active list maps 1:1 to the 18 table-stakes features expected in this category. **No coverage gaps.** Differentiation lives in execution and audience focus, not in additional features.

**Must have (table stakes — all in PROJECT.md Active):**
- Mock auth (sign up / sign in / forgot password)
- All-categories index + per-category browsing
- Free-text search with results page + empty state
- Per-tool detail pages (one URL per tool, unique content)
- Side-by-side compare flow (origin-tool-anchored)
- Rankings with upvote/downvote
- Write Review modal
- Favorites/bookmarks
- Submit-a-Tool form + pending queue + success screen
- User profile page
- Two-step onboarding (interests, then tools — toggleable)
- Personalized logged-in home
- Toast notifications on every persisting action
- Landing page (hero, value pillars, demo CTA)
- ~50 seed tools across ~10 categories
- Light + dark mode
- Keyboard nav + visible focus states
- localStorage persistence for all user state

**Should have (cheap differentiators worth promoting):**
- Toned-down rows in compare table where values match (D5)
- "Recommended because you picked Coding" reasoning text on home (D8)
- Empty/loading states beyond search (favorites-empty, no-reviews, no-pending) (D10)

**Defer (v2+):**
- Saved comparisons (D9) — only if persistence layer is well-factored at end of week 2
- Pricing-tier filtering (A20) — only if seed data has accurate pricing

**Anti-features to enumerate in PROJECT.md Out of Scope:** AI chat, real-time collab compare, DMs, threaded review replies, gamification, live tool API integration, 3rd-party review aggregation, newsletter, affiliate tracking, 3+ tool compare, edit/delete own review, tool changelog/freshness.

### Architecture Approach

Layered SPA: React Router v7 → Pages (composition only) → Features (`features/<domain>/`, co-located components+hooks+store+types) → shadcn UI primitives → Zustand stores with `persist` middleware → static TS data modules → localStorage with namespaced keys (`aitools:<domain>:<scope>`).

**Major components:**
1. **Routing layer** — `createBrowserRouter` with one nested `<AppShell>` (Header/Footer/Toaster); `<ProtectedRoute>` wrapper for `/onboarding`, `/home`, `/favorites`, `/profile`, `/submit`
2. **Feature folders** — `auth`, `tools`, `compare`, `reviews`, `rankings`, `search`, `submit`, `onboarding` — each owns its store, types, hooks, components
3. **Zustand stores** — `authStore`, `usersStore`, `favoritesStore`, `reviewStore`, `upvoteStore`, `submissionStore` (all persisted); `compareStore` (in-memory only — URL is source of truth); theme via `next-themes`
4. **Static data layer** — `src/data/tools.ts` and `src/data/categories.ts` as typed TS arrays (not JSON), imported directly with build-time slug-uniqueness validation
5. **`src/lib/storage.ts`** — namespaced key helper, safe JSON wrappers, validated reads with Zod fallbacks

**Load-bearing patterns:**
- **URL as source of truth** for Compare (`/compare/:a/vs/:b`) and Tool Detail (`/tools/:slug`) — structurally prevents the two prototype bugs
- **Slug as primary key** — `tools.find(t => t.slug === slug)` everywhere; never numeric indices
- **Feature-scoped stores** — orthogonal persistence boundaries, no god store
- **Single Toaster at root** — never inside pages

### Critical Pitfalls

**The two prototype bugs are the same class of bug — URL must be the source of truth.** Pitfalls #1 (Compare) and #2 (Tool Detail) both stem from component-local state or hardcoded imports for "selected tool." The roadmap must encode the URL-driven routing pattern as a Foundation-phase deliverable, not a feature-phase concern. If `/tools/:slug` and `/compare/:a/vs/:b` are real routes with `useParams` lookups against a slug-keyed seed array from day one, neither bug can recur. If they aren't, the rebuild ships the same bugs the rebuild exists to fix.

Top pitfalls the roadmap must structurally prevent:

1. **Hardcoded Compare and Hardcoded Tool Detail — same root cause.** Foundation phase: define `Tool` type with required `slug`, write seed data with build-time uniqueness validation, register `/tools/:slug` and `/compare/:a/vs/:b` routes with `useParams`-driven lookups before any feature work. Test: 9-combination click-test (3 origin tools × 3 second tools) all render unique content.
2. **Vote toggle inconsistency** — model votes as `'none' | 'up' | 'down'` per (user, tool) in a single global Zustand store; count is derived. Always use functional state updaters. Single write path to localStorage via the store's `persist` middleware. Persistence layer must exist before vote UI.
3. **Hydration flicker / FOUC** — inline `<script>` in `index.html` reads `localStorage.theme` and applies `dark` class before React mounts. Use lazy `useState(() => loadFromLocalStorage())` for auth/favorites/votes, never `useEffect` for state needed on first paint.
4. **localStorage schema drift** — every read goes through a Zod-validated parser with default fallback. Version stored payloads (`{ version: 1, data }`); bump version on shape changes. Never type-assert (`as User`) on parsed JSON.
5. **shadcn theming via raw color literals** — define brand tokens (`--primary` green, `--accent` orange) in `globals.css` for both `:root` and `.dark`. Use `bg-primary`, `text-accent` everywhere. Lint or grep for `bg-green-*` / `text-orange-*` literals — must be zero in app code.
6. **Polish before correctness** — encode breadth-before-polish in roadmap ordering. End of week 1 = every required feature has an ugly working version. No animation, no spacing tweaks, no custom typography in week 1.
7. **Empty states / fresh-browser bugs** — every list ships with an empty state in the same commit as the feature. Demo in incognito before every commit to main. Direct-URL navigation must not break routes that work via clicking through.

Secondary pitfalls (handle in normal execution): multi-tab inconsistency (`storage` event listener in storage utility from day one), onboarding toggle bug (`Set<string>` of slugs, persist on Finish), missing toasts (centralize all persistence actions through a single layer), accessibility (use shadcn `<Button>` and `<Dialog>` everywhere; axe DevTools sweep in week 2).

## Implications for Roadmap

Based on research, the suggested phase structure encodes **(a) URL-as-source-of-truth from Foundation, (b) breadth-before-polish for week 1, and (c) feature parallelization once Foundation lands.**

### Phase 1: Foundation (week 1, days 1–2) — sequential, do not parallelize

**Rationale:** Eight hard prerequisites gate every downstream feature. Skipping any one causes structural rework or regressed bugs.

**Delivers:**
1. Vite + TS + Tailwind v4 + shadcn/ui CLI v4 scaffolding with `@/` path alias (drop `postcss.config.js`; use `@tailwindcss/vite`)
2. `src/lib/storage.ts` — namespaced key helpers, Zod-validated safe-read wrappers, version field convention
3. `src/data/tools.ts` + `src/data/categories.ts` — typed TS arrays (placeholder content OK), build-time `__validateSlugsUnique()` check
4. TypeScript interfaces — `Tool`, `Category`, `User`, `Session`, `Review`, `UpvoteRecord`, `Submission`
5. Router skeleton — every route registered (`/`, `/signin`, `/signup`, `/forgot-password`, `/onboarding`, `/home`, `/categories`, `/categories/:slug`, `/tools/:slug`, `/compare/:a`, `/compare/:a/vs/:b`, `/search`, `/favorites`, `/profile`, `/rankings`, `/submit`, `/submit/success`, `*`); placeholder pages OK
6. `AppShell` + `Header` + `Footer` + `<Toaster />` mounted once
7. `ThemeProvider` (next-themes, `attribute="class"`, `storageKey="aitools:theme"`) + inline FOUC-prevention script in `index.html`
8. `authStore` + `usersStore` + `<ProtectedRoute>` wrapper + `globals.css` with green/orange tokens for `:root` and `.dark`

### Phase 2: Persistence + State Stores (week 1, day 2–3)

**Rationale:** Vote state, favorites, reviews, and submissions all need their stores defined and wired to localStorage *before* any feature UI is built.

**Delivers:**
- `favoritesStore`, `upvoteStore` (with `'none' | 'up' | 'down'` state machine), `reviewStore`, `submissionStore` — Zustand `persist`, namespaced keys, version fields
- Action wrapper that always emits a sonner toast on success/error (try/catch around localStorage writes)
- `storage` event listener in storage utility for multi-tab consistency

### Phase 3: Feature Breadth — Ugly But Working (week 1, days 3–7)

**Rationale:** With Foundation and Persistence locked, features parallelize cleanly. **End-of-week-1 success criterion: every required feature has an ugly working version.** No animation, no spacing tweaks, no custom typography. Compare renders two tools in a 2-column div. Rankings is a flat list with working votes.

**Delivers (all P1, parallelizable in any order after Foundation):**
- Auth flows (sign up / sign in / forgot password)
- Tool detail page (`/tools/:slug` → `tools.find` → NotFound if missing)
- Compare flow (`/compare/:a` picker → `/compare/:a/vs/:b` table; URL-driven; dev assertion if `a === b` or either tool missing)
- Categories index + per-category page
- Search with fuse.js + empty state
- Favorites page (protected) + heart button on cards
- Rankings page with upvote/downvote
- Write Review modal + review list on tool detail
- Submit-a-Tool form + pending queue + success screen
- Two-step onboarding (Set-based selection state, persist-on-Finish)
- Personalized home (reads `currentUser.interests` + `selectedTools`)
- Landing page (static, no animations yet)
- User profile page
- Seed data: ~50 tools across ~10 categories with unique slugs

### Phase 4: Polish + Dark Mode + Accessibility (week 2, days 8–12)

**Rationale:** Polish only after every feature works.

**Delivers:**
- Dark mode visual pass — every component reviewed against `.dark` tokens; no raw color literals
- Empty states beyond search — favorites-empty, no-reviews-yet, no-pending-submissions, no-onboarding-selections
- Keyboard nav + focus state audit (axe DevTools sweep, full Tab pass)
- Toast polish — `visibleToasts: 3`, per-action duration, positioning
- Compare flow visual polish — toned-down rows where values match
- "Recommended because…" reasoning text on home
- Motion polish — page transitions (`<AnimatePresence mode="wait">`), Rankings list reorder on vote, modal enter/exit
- Responsive tablet pass (1440 / 1024 / 768)
- Landing page hero animation

### Phase 5: Pre-Demo Hardening (week 2, days 13–14)

**Rationale:** Demo-day failures happen in fresh browsers, on direct URLs, on production builds — none of which match dev experience.

**Delivers:**
- Incognito-window walkthrough — every route via direct URL, every flow end to end
- `vite build && vite preview` verification — production build behaves identically to dev
- Vercel/Netlify deploy + smoke test on the deployed URL
- Demo user account auto-fill on login screen ("Try it: demo@bu.edu / demo")
- Reset-app dev button (or wipe-storage Easter egg)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every pick verified against current docs (April 2026); Zod v3 vs v4 decision is load-bearing |
| Features | HIGH | Mature category with multiple direct competitors; PROJECT.md Active list maps 1:1 to 18 table-stakes features |
| Architecture | HIGH | Patterns verified against current shadcn, Zustand, react-router v7 docs; URL-as-source-of-truth and slug-as-PK are direct fixes for documented bugs |
| Pitfalls | HIGH | Every pitfall traces to verified sources, the documented usability findings, the no-backend constraint, or shadcn-specific behavior |

**Overall confidence:** HIGH

### Gaps to Address

- **Seed data quality and authorship time** — 50 tools × ~10 fields each is non-trivial content work. Estimate ~4–6 hours; lock the schema in Foundation, parallelize authorship across week 1.
- **Logo assets for ~50 tools** — either source from each tool's official brand kit or use generic placeholder mark + name-only treatment. Decide in Foundation phase.
- **Mobile responsive scope** — PROJECT.md says "responsive down to tablet; mobile is nice-to-have." Compare table at 768px is the hardest layout; decide in Phase 4.
- **Demo data seeding** — fresh-browser graders need either auto-seeded sample reviews/votes or a "Sign in as demo user" button. Decide in Phase 5.

---
*Research completed: 2026-04-26*
*Ready for roadmap: yes*
