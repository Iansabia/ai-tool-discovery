# Phase 3: Feature Breadth (Ugly But Working) - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Every required v1 feature has a working, deliberately unpolished implementation: discovery flows (landing, home with personalized recommendations, categories, search), tool detail pages (unique per tool, URL-driven), compare flow (origin-tool-anchored, URL-as-truth, swap, save), rankings with vote buttons consuming the upvoteStore state machine, write review modal, submit-a-tool form with pending queue, favorites page, profile page. Every persisting action emits a sonner toast. Every list ships with an empty state in the same commit. NO animation, NO custom typography, NO spacing tweaks, NO dark-mode work. End-of-week-1 success criterion: every feature works in incognito with a fresh browser. Polish is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Compare Flow Details
- Picker step at `/compare/:a` shows "Compare X with…" header + searchable picker grid of all other tools as cards (clicking selects)
- Compare table at `/compare/:a/vs/:b` renders 5 rows: Pricing, Category, Rating (stars), Key features (top 5 bulleted), URL (link)
- Swap button rewrites URL: `/compare/a/vs/b` → `/compare/b/vs/a` (URL stays the source of truth)
- Each side has a small "Change" button that routes to `/compare/:keptSide` (re-enters picker for the other slot)
- Saved comparisons persist per user as `[{ a: slug, b: slug, savedAt: ISO }]`; visible in a Profile page section "Saved Comparisons"
- "Save comparison" button on `/compare/:a/vs/:b` adds the pair (de-duplicated by sorted slug pair)
- NotFound state when either slug is invalid; dev-only console.warn when `a === b`

### Search & Discovery
- Header search input: debounced 300ms live autocomplete dropdown (top 6 fuzzy matches); Enter routes to `/search?q=...`
- Search engine: fuse.js v7 with `keys: ["name", "tagline", "description", "features"]`, `threshold: 0.4`, `includeMatches: false`
- `/search?q=...` page renders all matches as cards
- Empty state on search: "No tools matched 'X'" + 3 category shortcut chips (top categories from seed data)
- Logged-in home (`/home`) shows recommendations grouped by user's selected interests; each card displays "Recommended because you picked **[Category Name]**" beneath the tagline
- All Categories page (`/categories`) lists every category with tool count; cards link to `/categories/:slug`
- Per-category page (`/categories/:slug`) shows all tools in that category as a grid

### Rankings & Reviews
- Rankings page (`/rankings`) sorts by net upvotes (up − down) descending; ties broken by total vote count, then alphabetically by name
- Vote affordance: two stacked buttons (▲ count ▼) — pressed state filled, unpressed outlined; clicking same vote toggles to "none"; clicking opposite switches sides
- Vote actions emit toast: "Voted up" / "Voted down" / "Vote removed"
- Write Review modal (shadcn `<Dialog>`): star rating 1–5 (required), title optional ≤80 chars, body required ≤500 chars
- Review display: newest first on tool detail page; show top 3 by default with "Show all (N)" expansion that reveals the full list
- Multiple reviews per user per tool allowed (simple — no edit/delete in v1)

### Submit a Tool Flow
- Form fields: name (required, ≤80), URL (required, valid URL), category (required dropdown of 10 categories), description (required, ≤300), tags (optional, comma-separated, max 5)
- Submission persists to `submissionStore` under current user (or guest); status starts as "pending"
- Success page `/submit/success` confirms submission with the submitted tool's name and a link back to home
- Profile page shows the user's pending submissions in a "Submissions" section

### User State (Favorites, Profile)
- Favorites page (`/favorites`, protected) shows the user's favorited tools as a grid of cards; empty state with "No favorites yet — Browse tools" CTA
- Heart icon Favorite button on tool detail page and tool cards: toggle adds/removes from favoritesStore; emits "Added to favorites" / "Removed from favorites" toast
- Profile page (`/profile`, protected) renders 3 sections:
  1. **Identity:** display name + email; "Edit" enables inline editing of display name; email is read-only
  2. **Preferences:** chips of selected interests + selected tools; "Edit" routes to `/onboarding/interests` or modal allowing re-selection
  3. **My Activity:** "Saved Comparisons" subsection (if any) + "Submissions" subsection listing pending submitted tools

### Cross-Cutting UX
- All persisting actions emit a sonner toast via the `withToast` utility from Plan 02-04. Standard wording (short + friendly):
  - Favorites: "Added to favorites" / "Removed from favorites"
  - Votes: "Voted up" / "Voted down" / "Vote removed"
  - Reviews: "Review posted"
  - Submissions: "Tool submitted for review"
  - Saved comparisons: "Comparison saved"
  - Profile edits: "Profile saved"
- Every empty state uses pattern: lucide icon (lg) + 1-line message + primary CTA button. No fancy illustrations.
- Landing page (`/`) renders hero ("Discover the best AI tools for any task") + 3 value pillar cards (Discover/Compare/Community) + "Trusted by students at" row with university chips + "Get Started — Free" + "Browse Tools" + "Skip to Demo" (signs in as a pre-seeded demo user — Phase 5 hardening, but the button can route to /signin for now if seeding isn't feasible in this phase)

### Tool Detail Page
- `/tools/:slug` → `tools.find(t => t.slug === slug)`; renders unique content for every tool (the structural fix from Phase 1 still holds)
- Layout: header (logo + name + tagline + pricing badge + category chip + external link button), description block, key features list, action row (Compare, Favorite, Write Review), reviews list
- "Compare" button routes to `/compare/:slug` (picker step)
- "Favorite" toggles favoritesStore for current user (or guest)
- "Write Review" opens shadcn `<Dialog>` modal
- NotFound state when slug doesn't match any tool

### Claude's Discretion
- Exact card grid breakpoints (recommend 1 col mobile, 2 col tablet, 3 col desktop) — Phase 4 polish refines
- Layout of "Recommended because" — under tagline or as a chip; either is fine
- Whether the demo user is auto-seeded in dev mode — defer to Phase 5 if it becomes a hardening concern
- Exact placement of "Save comparison" button — top-right of compare table is fine
- Pagination thresholds — defer; v1 renders all (50 tools is small enough)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets (from Phases 1 & 2)
- `src/data/tools.ts` — 50 tools with unique slugs, real SVG logos
- `src/data/categories.ts` — 10 categories
- `src/lib/storage.ts` — namespaced + versioned storage helpers (safeGet, safeSet, safeRemove, subscribeToKey)
- `src/lib/withToast.ts` — action wrapper for toast emission (Plan 02-04)
- `src/features/auth/store.ts` — useAuthStore + useUsersStore
- `src/features/auth/hooks/useAuth.ts` — facade hook with signIn/signOut/continueAsGuest/currentUser/isGuest/userId
- `src/features/tools/store.ts` — useFavoritesStore (toggle, list, has, clearByUser)
- `src/features/rankings/store.ts` — useUpvoteStore (vote state machine, getNetVotes, list, clearByUser)
- `src/features/reviews/store.ts` — useReviewStore (add, listByTool, clearByUser)
- `src/features/submit/store.ts` — useSubmissionStore (add, listByUser, clearByUser)
- `src/components/ui/` — Button, Card, Input, Label, Form, Checkbox, Sonner (Toaster), Dialog (need to add this), Badge (need to add this)
- 18 placeholder pages in `src/pages/` already routed; Phase 3 replaces their placeholder content

### Established Patterns
- TDD where it makes sense (stores already TDD'd in Phase 2; Phase 3 components benefit from interaction tests via @testing-library/user-event)
- shadcn `<Dialog>` for modals (Write Review). Add via `npx shadcn@latest add dialog badge select textarea`
- react-hook-form + Zod v3 for any form (Submit a Tool, Profile edit, Write Review)
- `useAuth()` for auth state in components (don't reach into the raw stores)
- All toasts via the `withToast` wrapper or direct `toast.success/error` from sonner
- URL-as-source-of-truth for routes that take params (proven in Phase 1)
- Atomic commits per task; each plan ships its empty states + toasts in the same commit as the feature
- npm scripts use `node ./node_modules/<pkg>/<bin>` form

### Integration Points
- Header.tsx already has SignIn/SignUp/SignOut affordance and ThemeToggle. Phase 3 adds the search input.
- Router.tsx already registers all 18 routes. Phase 3 fills their pages with real content.
- AppShell.tsx already wraps every route with Header + Outlet + Footer + Toaster. No changes needed.
- ProtectedRoute.tsx is real and wires touchSession. Phase 3's protected pages (favorites, profile) just declare themselves under the ProtectedRoute element.

</code_context>

<specifics>
## Specific Ideas

- **The 9-combination Compare click-test** that was set up structurally in Phase 1 (Compare placeholder reading useParams) becomes a real assertion in Phase 3: render `/compare/claude/vs/chatgpt`, `/compare/midjourney/vs/dalle`, `/compare/cursor/vs/github-copilot`, assert each shows two distinct tool names + features. This locks the URL-driven contract.
- **Breadth-before-polish discipline:** end of Phase 3 = every feature works in incognito on a fresh load. Compare flow: pick any 2 tools, see different data each time. Rankings: vote buttons all work consistently. Favorites: heart toggles persist. Reviews: post one, see it listed. Submit: form persists to pending queue. Profile: edits save. NO animations. NO spacing finesse. NO custom typography. Phase 4 is the polish phase.
- **Empty state in the same commit as the feature:** every list MUST ship its empty state in the same commit as the list. Favorites with no items, search with no results, reviews with none, submissions with none, rankings with no votes — each renders a friendly empty state, never `undefined` or a blank screen.

</specifics>

<deferred>
## Deferred Ideas

- Pagination on rankings / search / categories — 50 tools is small; render all
- Edit/delete own review — explicitly out of scope (REQUIREMENTS v2)
- Tool screenshots in submit form — not in v1 fields list
- Real-time vote counts (multi-tab sync) — Phase 2's storage event listener already covers this; no extra work in Phase 3
- Real demo user account auto-fill — Phase 5 hardening
- Profile avatar upload — out of scope
- Toast position/duration polish — Phase 4

</deferred>
