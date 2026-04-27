# Phase 2: Auth + Persistence Stores - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers every persisted concern needed before feature UI: auth (sign up / sign in / sign out / forgot password / guest mode), users registry, onboarding wizard (toggleable interests + tools), protected route gating, and the four non-auth Zustand stores (favorites, upvotes with state machine, reviews, submissions). Every store wires to the namespaced storage helper from Phase 1, validates with Zod, and respects the `{ version, data }` envelope. No feature UI from Phase 3 is built here — Phase 2 is "stores exist and auth works", not "stores get used by feature buttons".

</domain>

<decisions>
## Implementation Decisions

### Auth UX & Form Validation
- Password requirements: minimum 8 characters, must include at least one letter and one number; no special-character or capital-letter requirement
- Sign-in error wording: generic "Email or password is incorrect" — never reveal whether the email exists
- Forgot password mock: always shows "If an account exists, we sent a link" regardless of whether the email is registered (privacy-correct UX even though backend is mock)
- After sign-up, auto-login the user and route directly to `/onboarding/interests` — no separate sign-in step
- Form validation displays inline errors below each field for: invalid email format, password too short / missing required char class, mismatched confirm-password
- Forms use react-hook-form + Zod v3 + shadcn `<Form>` from Phase 1 stack picks

### Mock Auth & Session Implementation
- Password storage: hash via Web Crypto API (SHA-256 with per-user random salt). Not production-grade but materially better than plaintext for a demo; salt stored alongside the user record
- Session shape: `{ userId: string, expiresAt: number }` written to `aitools:auth:session`; expires 30 days from issue; sliding refresh on each authenticated load
- On rehydrate, if `expiresAt < Date.now()`, treat as logged out
- Guest mode: special user record with `userId: 'guest'`. Favorites/votes/reviews are namespaced under that ID. On real sign-in, guest data is cleared (not merged) — keeps the model simple and the demo predictable
- Protected route redirect: send to `/signin?return_to=<encoded-original-url>`, restore on successful sign-in or guest-continue
- All auth operations go through `authStore` actions; no component touches `localStorage` directly

### Onboarding Interactions
- Two routes: `/onboarding/interests` (step 1) and `/onboarding/tools` (step 2) — browser back works naturally
- Interest selection: minimum 1 required to proceed via Continue button; no maximum; no preselected items; each selection is toggleable on click
- Tool selection: fully optional (0 to 50); no preselected items; toggleable
- Skip button on each step routes to `/home` with whatever has been selected so far persisted to user profile (empty if nothing chosen)
- State persists in `authStore` selections during navigation between steps so going back from step 2 keeps step 1's choices
- Final Continue on step 2 calls `authStore.completeOnboarding()` which writes selections to the user record and routes to `/home`

### Persistence Stores (Phase 2 Deliverable, Not Yet Consumed by UI)
- All non-auth stores use Zustand v5 + `persist` middleware, namespaced via `storageKey()` helper
- `favoritesStore`: `{ [userId: string]: Set<slug> }` (serialized as array on persist)
- `upvoteStore`: `{ [userId: string]: { [slug: string]: 'none' | 'up' | 'down' } }` — per-user, per-tool vote state machine
- `reviewStore`: `{ [slug: string]: Review[] }` — reviews keyed by tool, not by user, so all reviews show on a tool detail page
- `submissionStore`: `{ [userId: string]: Submission[] }` — pending submissions per user
- Every persisted store wraps state in `{ version: 1, data: T }` envelope; reads validate via Zod and fall back to defaults on schema mismatch
- Action wrapper utility (`withToast` or similar) emits sonner toasts on success/error for any persisting action — Phase 3 features will use this so toast wiring is centralized
- Stores expose actions only; components never call `set` directly

### Claude's Discretion
- Whether to put auth forms in `src/features/auth/components/` and onboarding in `src/features/onboarding/components/` or unify under `auth` (recommend separate)
- Exact zod schemas for each form (use Phase 2 patterns; pull error messages from a shared file if it reduces duplication)
- Whether to write a `useAuth()` hook in addition to direct store usage (recommend yes for DX)
- Exact toast copy ("Welcome back!" vs "Signed in" etc.) — keep short, friendly
- Whether to seed any sample users in dev mode for testing (acceptable; should not ship to production build)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets (from Phase 1)
- `src/lib/storage.ts` — namespaced + versioned + Zod-validated localStorage helper. All stores must use this, never raw `localStorage.setItem`.
- `src/types/index.ts` — `User`, `Session`, `Review`, `UpvoteRecord`, `Submission` interfaces already defined. Update these in place if shape changes are needed; do not duplicate.
- `src/components/ui/button.tsx`, `card.tsx`, `sonner.tsx` — shadcn primitives ready. Add `<Form>`, `<Input>`, `<Label>`, `<Checkbox>`, `<Toast>` (sonner already shipped) via `npx shadcn@latest add` as needed.
- `src/features/auth/components/ProtectedRoute.tsx` — currently a stub (always renders Outlet). Replace stub with real `authStore` consumer this phase.
- `src/components/theme/ThemeToggle.tsx` — pattern reference for store-subscribed components.
- `src/router.tsx` — 18 routes already registered. Add `/onboarding/interests` and `/onboarding/tools` (currently `/onboarding` is a single placeholder); split into nested route per Decisions Area 3.

### Established Patterns
- TDD-style plans (Phase 1 used this — all storage/types/validators were tested before implementation). Keep this pattern: write tests first, implement, tests pass.
- `node ./node_modules/<pkg>/<bin>` form for npm scripts (workdir-with-colon environment fix).
- Atomic commits per task, one commit message per logical chunk, conventional-commit prefix (`feat(02-NN):`, `test(02-NN):`).
- Per-task `<read_first>`, `<acceptance_criteria>` block discipline from Phase 1 plans.

### Integration Points
- Phase 2 wires `authStore` into `<ProtectedRoute>` (currently stub) — replaces the placeholder always-true check.
- Phase 2 splits `/onboarding` placeholder into `/onboarding/interests` + `/onboarding/tools`. This is a router change to `src/router.tsx`.
- Phase 3 will consume every store from Phase 2 (favorite buttons, vote buttons, review modal, submit form, profile reads). Phase 2 must export clean action signatures.
- The action-wrapper / `withToast` utility added in this phase becomes the canonical pattern Phase 3 features must use.

</code_context>

<specifics>
## Specific Ideas

- The "no preselected items" requirement on onboarding directly fixes a usability finding from the Figma prototype test. Selections must start empty; clicking adds; clicking again removes. Confirm via test: `expect(toggleableItem).not.toHaveClass('selected')` on initial render.
- Guest mode is a key UX call from PROJECT.md — graders should be able to test the app without signing up. The "Continue as Guest" button must be on the Sign In page, visible above the fold.
- Vote state machine `'none' | 'up' | 'down'` is the structural fix for the prototype's buggy vote toggling. Even though Phase 2 doesn't ship the vote button (that's Phase 3), the store action `setVote(userId, slug, nextVote)` must encode the full state machine: clicking same vote → 'none', clicking opposite → opposite. Lock this in tests now.
- The `return_to` query param on `/signin` is a UX detail that matters: if a guest tries to favorite a tool from `/tools/claude`, they get redirected to sign in, then land back at `/tools/claude` after — not at `/home`. Test the round trip.

</specifics>

<deferred>
## Deferred Ideas

- "Remember me" checkbox — out of scope; session is always 30 days
- 2FA — out of scope (PROJECT.md Out of Scope: OAuth/2FA)
- Email verification — out of scope; mock auto-confirms
- Real password reset via email — out of scope; mock shows success state only
- Account merge on guest → real signup — explicitly chose "clear guest data instead" for simplicity
- Soft-delete account — out of scope
- Profile avatar upload — out of scope for Phase 2; avatars in v2 if at all

</deferred>
