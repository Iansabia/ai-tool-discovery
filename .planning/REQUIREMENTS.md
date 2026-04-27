# Requirements: AI Tools Discovery Platform

**Defined:** 2026-04-26
**Core Value:** Help students find and choose AI tools faster — every tool has its own real detail page, every comparison reflects the user's actual choice, and every action gives clear feedback.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui project scaffolded with `@/` path alias and dev server running
- [x] **FOUND-02**: Router skeleton registers every route (`/`, `/signin`, `/signup`, `/forgot-password`, `/onboarding`, `/home`, `/categories`, `/categories/:slug`, `/tools/:slug`, `/compare/:a`, `/compare/:a/vs/:b`, `/search`, `/favorites`, `/profile`, `/rankings`, `/submit`, `/submit/success`, `*`)
- [x] **FOUND-03**: AppShell component renders Header, Footer, and a single `<Toaster />` mounted at root
- [x] **FOUND-04**: TypeScript interfaces defined for Tool, Category, User, Session, Review, Vote, Submission with required `slug` field on Tool
- [x] **FOUND-05**: Storage helper (`src/lib/storage.ts`) wraps localStorage with namespaced keys (`aitools:<domain>:<scope>`), Zod-validated reads, and version fields
- [x] **FOUND-06**: Brand color tokens (green primary, orange accent) defined as CSS variables in `globals.css` for both `:root` and `.dark`
- [x] **FOUND-07**: Build-time validation enforces unique slugs across the seed tool dataset

### Authentication

- [x] **AUTH-01**: User can create account with email and password via Sign Up form
- [x] **AUTH-02**: User can log in with email and password via Sign In form
- [ ] **AUTH-03**: User session persists across browser refresh (localStorage)
- [x] **AUTH-04**: User can log out from any page via header menu
- [x] **AUTH-05**: User can request password reset via Forgot Password form (mock — shows success state, no email sent)
- [x] **AUTH-06**: Form validation displays inline errors for invalid email, weak password, mismatched confirm-password
- [x] **AUTH-07**: User can continue as guest via "Continue as Guest" button on Sign In page — guest gets a temporary session with limited persistence (favorites/votes/reviews scoped to guest, cleared on next sign-in)
- [x] **AUTH-08**: Protected routes (`/onboarding`, `/home`, `/favorites`, `/profile`, `/submit`) redirect unauthenticated users to `/signin` with return-URL preservation

### Onboarding

- [ ] **ONBO-01**: After sign up, user is routed to two-step onboarding wizard
- [ ] **ONBO-02**: Step 1 asks user to select interests (categories) — selections are toggleable (clicking deselects), no preselected items
- [ ] **ONBO-03**: Step 2 asks user to select familiar tools — selections are toggleable, no preselected items
- [ ] **ONBO-04**: User can navigate back to step 1 from step 2 without losing selections
- [ ] **ONBO-05**: Onboarding completion routes to `/home` and persists interests + selected tools to user profile
- [ ] **ONBO-06**: User can skip onboarding from either step (lands on `/home` with empty preferences)

### Discovery

- [ ] **DISC-01**: Landing page (`/`) renders hero ("Discover the best AI tools for any task"), three value pillars (Discover/Compare/Community), and trusted-by row
- [ ] **DISC-02**: Landing page provides "Get Started — Free" and "Browse Tools" CTAs plus "Skip to Demo" entry point
- [ ] **DISC-03**: Logged-in home (`/home`) shows personalized recommendations based on user's selected interests
- [ ] **DISC-04**: Each personalized recommendation displays a "Recommended because you picked [Category]" reasoning line
- [ ] **DISC-05**: All Categories page (`/categories`) shows every category with tool counts
- [ ] **DISC-06**: Category detail page (`/categories/:slug`) lists all tools in that category
- [ ] **DISC-07**: Search bar in header navigates to `/search?q=...` and renders matching tools (fuzzy match via fuse.js)
- [ ] **DISC-08**: Search empty state renders when no tools match the query, with suggestions to browse categories

### Tool Detail

- [ ] **TOOL-01**: Tool detail page (`/tools/:slug`) renders unique content for every tool in the dataset, sourced from `tools.find(t => t.slug === slug)`
- [ ] **TOOL-02**: Tool detail page shows tool name, description, category, pricing tier, key features, and external link
- [ ] **TOOL-03**: Tool detail page includes a Compare button that routes to `/compare/:slug` (the picker step for choosing the second tool)
- [ ] **TOOL-04**: Tool detail page includes a Favorite button that toggles favorite state and persists per user
- [ ] **TOOL-05**: Tool detail page includes a Write Review button that opens the review modal
- [ ] **TOOL-06**: Tool detail page lists existing reviews for that tool with rating, author display name, and review text
- [ ] **TOOL-07**: Tool detail page renders a NotFound state when slug does not match any tool
- [ ] **TOOL-08**: Direct URL navigation to `/tools/:slug` works without prior navigation (no broken refresh, no auth gate)

### Compare

- [ ] **COMP-01**: From a tool detail page or tool card, clicking Compare navigates to `/compare/:a` (picker for second tool)
- [ ] **COMP-02**: Picker page shows the origin tool fixed and a searchable list of all other tools to choose from
- [ ] **COMP-03**: Selecting a second tool navigates to `/compare/:a/vs/:b` and renders side-by-side comparison
- [ ] **COMP-04**: Compare page (`/compare/:a/vs/:b`) renders unique data for tools `a` and `b`, sourced from URL params (never hardcoded)
- [ ] **COMP-05**: Compare table shows feature, pricing, rating, and category rows
- [ ] **COMP-06**: Compare table tones down (de-emphasizes) rows where the two tools share the same value, so differences stand out
- [ ] **COMP-07**: User can swap which tool is on the left/right via a swap button
- [ ] **COMP-08**: User can change either tool from the compare page without going back to a tool detail
- [ ] **COMP-09**: Compare page renders NotFound state if either slug is invalid; dev assertion warns if `a === b`
- [x] **COMP-10**: User can save a comparison; saved comparisons persist in localStorage and are listed on the user's profile or a dedicated saved-comparisons surface

### Community

- [ ] **COMM-01**: Rankings page (`/rankings`) shows all tools ordered by net upvotes (upvotes minus downvotes)
- [ ] **COMM-02**: Each ranking row has working upvote and downvote buttons that respond consistently to every click
- [ ] **COMM-03**: Vote state is modeled as `'none' | 'up' | 'down'` per user per tool — clicking the same vote toggles it off, clicking the opposite vote switches sides
- [ ] **COMM-04**: Vote action persists immediately to localStorage and emits a toast confirmation
- [ ] **COMM-05**: Write Review modal accepts star rating (1-5) and review text and persists the review on submit
- [ ] **COMM-06**: Submitting a review emits a toast confirmation
- [ ] **COMM-07**: Submit a Tool form (`/submit`) accepts tool name, URL, category, description, and tags
- [ ] **COMM-08**: Submitted tools are added to a local "pending review" queue (visible on user's profile), not to the public rankings
- [ ] **COMM-09**: Submission success page (`/submit/success`) confirms submission and links back to home

### User State

- [ ] **USER-01**: Favorites page (`/favorites`) lists all tools the user has favorited; empty state renders when no favorites exist
- [ ] **USER-02**: Profile page (`/profile`) shows the user's display name, email, selected interests, and submitted tools (pending queue)
- [ ] **USER-03**: User can edit display name and selected interests from the profile page; changes persist
- [x] **USER-04**: Favorite button on tool cards and tool detail pages toggles state and persists per user

### Cross-Cutting UX

- [x] **UX-01**: Toast notifications confirm every persisting action (favorite, unfavorite, upvote, downvote, review submitted, tool submitted, profile saved, comparison saved)
- [ ] **UX-02**: Light and dark mode toggle in the header; theme persists across sessions
- [x] **UX-03**: Inline `<script>` in `index.html` applies the persisted theme class before React mounts (prevents FOUC)
- [ ] **UX-04**: All interactive elements have visible keyboard focus states
- [ ] **UX-05**: All modals trap focus, close on Escape, and restore focus to the trigger element on close (uses shadcn `<Dialog>`)
- [x] **UX-06**: All lists ship with empty states (favorites empty, no reviews, no pending submissions, no search results, no rankings)
- [x] **UX-07**: All persisting actions write through the shared storage helper — no raw `localStorage.setItem` calls in feature code
- [x] **UX-08**: Multi-tab consistency — when state changes in another tab (favorites, votes, theme), the current tab reflects the update via `storage` event listener

### Data

- [x] **DATA-01**: Seed dataset contains ~50 AI tools across ~10 categories, each with unique slug, name, description, category, pricing tier, key features, and external URL
- [x] **DATA-02**: Categories include Writing, Coding, Research, Image, Audio, Video, Productivity, Design, Data/Analytics, Marketing
- [x] **DATA-03**: Each tool has a logo asset (sourced or placeholder mark with name fallback)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Real Backend

- **BACK-01**: Real auth (Supabase) replaces mock auth
- **BACK-02**: Real persistence (Postgres) replaces localStorage
- **BACK-03**: Real-time multi-device sync
- **BACK-04**: Server-side moderation queue for submitted tools

### Advanced Features

- **ADV-01**: ⌘K command palette for quick navigation
- **ADV-02**: Pricing-tier filtering on category and search pages
- **ADV-03**: Edit/delete own review
- **ADV-04**: Tool changelog / freshness indicators
- **ADV-05**: 3+ tool comparison
- **ADV-06**: OAuth sign-in (Google, GitHub)
- **ADV-07**: Real email-based password reset

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real backend (Supabase, API server) | 2-week timeline, UI/UX final scope; localStorage proves the design |
| Real email sending for password reset | No backend; flow exists as mock for the UX demo |
| Server-side moderation | No backend; submissions stay in local pending queue |
| Multi-device sync | No backend; same-browser experience only (multi-tab handled) |
| Mobile-native app | Responsive web only |
| Admin dashboard | No admin role, no review/approve UI |
| Payments / pricing tiers (the platform's, not tool pricing displayed) | Out of scope for a directory/discovery product |
| OAuth (Google, GitHub) | Mock email/password covers the auth UX; OAuth adds setup with no demo value |
| AI chat assistant | Not a directory feature; would dilute Discover/Compare/Community focus |
| Real-time collaborative compare | No backend; not a directory feature |
| Direct messages between users | Not a directory feature |
| Threaded review replies | Adds complexity, hurts discoverability of top reviews |
| Gamification (points, badges, streaks) | Misaligned with student-trust audience framing |
| Live tool API integration (real-time pricing/features) | No backend; data freshness is v2+ concern |
| 3rd-party review aggregation (G2, Capterra) | Licensing complexity; community reviews suffice for v1 |
| Newsletter subscription | Out of scope; no email infrastructure |
| Affiliate link tracking | Not a discovery-product concern |
| 3+ tool comparison | Compare table at 2 tools is already complex at tablet width |
| Edit/delete own review | Out of scope for v1; reviews are immutable |
| Tool changelog / freshness indicators | Requires data update pipeline; v2+ |

## Traceability

Which phases cover which requirements. All 70 v1 requirements mapped (100% coverage).

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1: Foundation | Complete |
| FOUND-02 | Phase 1: Foundation | Complete (Plan 01-04) |
| FOUND-03 | Phase 1: Foundation | Complete (Plan 01-04) |
| FOUND-04 | Phase 1: Foundation | Complete |
| FOUND-05 | Phase 1: Foundation | Complete |
| FOUND-06 | Phase 1: Foundation | Complete (Plan 01-04) |
| FOUND-07 | Phase 1: Foundation | Complete |
| AUTH-01 | Phase 2: Auth + Persistence Stores | Complete |
| AUTH-02 | Phase 2: Auth + Persistence Stores | Complete |
| AUTH-03 | Phase 2: Auth + Persistence Stores | Pending |
| AUTH-04 | Phase 2: Auth + Persistence Stores | Complete |
| AUTH-05 | Phase 2: Auth + Persistence Stores | Complete |
| AUTH-06 | Phase 2: Auth + Persistence Stores | Complete |
| AUTH-07 | Phase 2: Auth + Persistence Stores | Complete |
| AUTH-08 | Phase 2: Auth + Persistence Stores | Complete |
| ONBO-01 | Phase 2: Auth + Persistence Stores | Pending |
| ONBO-02 | Phase 2: Auth + Persistence Stores | Pending |
| ONBO-03 | Phase 2: Auth + Persistence Stores | Pending |
| ONBO-04 | Phase 2: Auth + Persistence Stores | Pending |
| ONBO-05 | Phase 2: Auth + Persistence Stores | Pending |
| ONBO-06 | Phase 2: Auth + Persistence Stores | Pending |
| DISC-01 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-02 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-03 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-04 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-05 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-06 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-07 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| DISC-08 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-01 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-02 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-03 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-04 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-05 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-06 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-07 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| TOOL-08 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-01 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-02 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-03 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-04 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-05 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-06 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-07 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-08 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-09 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMP-10 | Phase 3: Feature Breadth (Ugly But Working) | Complete |
| COMM-01 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-02 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-03 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-04 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-05 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-06 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-07 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-08 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| COMM-09 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| USER-01 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| USER-02 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| USER-03 | Phase 3: Feature Breadth (Ugly But Working) | Pending |
| USER-04 | Phase 3: Feature Breadth (Ugly But Working) | Complete |
| UX-01 | Phase 3: Feature Breadth (Ugly But Working) | Complete |
| UX-02 | Phase 4: Polish, Dark Mode, Accessibility | Pending |
| UX-03 | Phase 1: Foundation | Complete (Plan 01-04) |
| UX-04 | Phase 4: Polish, Dark Mode, Accessibility | Pending |
| UX-05 | Phase 4: Polish, Dark Mode, Accessibility | Pending |
| UX-06 | Phase 3: Feature Breadth (Ugly But Working) | Complete |
| UX-07 | Phase 1: Foundation | Complete |
| UX-08 | Phase 1: Foundation | Complete (Plan 01-04) |
| DATA-01 | Phase 1: Foundation | Complete |
| DATA-02 | Phase 1: Foundation | Complete |
| DATA-03 | Phase 1: Foundation | Complete |

**Coverage:**
- v1 requirements: 70
- Mapped to phases: 70
- Unmapped: 0

**Phase distribution:**
- Phase 1 (Foundation): 13 requirements (FOUND-01..07, DATA-01..03, UX-03, UX-07, UX-08)
- Phase 2 (Auth + Persistence Stores): 14 requirements (AUTH-01..08, ONBO-01..06)
- Phase 3 (Feature Breadth): 40 requirements (DISC-01..08, TOOL-01..08, COMP-01..10, COMM-01..09, USER-01..04, UX-01, UX-06)
- Phase 4 (Polish, Dark Mode, Accessibility): 3 requirements (UX-02, UX-04, UX-05)
- Phase 5 (Pre-Demo Hardening): 0 new requirements (verifies all 70 in fresh-browser walkthrough)

---
*Requirements defined: 2026-04-26*
*Last updated: 2026-04-26 — traceability populated by roadmapper*
