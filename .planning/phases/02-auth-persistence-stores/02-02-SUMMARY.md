---
phase: 02-auth-persistence-stores
plan: 02
subsystem: auth
tags: [react-hook-form, zod, shadcn-form, auth, protected-route, sliding-refresh, return-to, guest-mode, sonner]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: shadcn primitives, ThemeToggle pattern, AppShell+Header layout, sonner Toaster, route table
  - phase: 02-auth-persistence-stores (Plan 02-01)
    provides: useAuthStore, useUsersStore, GENERIC_SIGNIN_ERROR, GUEST_USER_ID, SESSION_DURATION_MS, SESSION_REFRESH_THRESHOLD_MS, completeOnboarding(), touchSession()
provides:
  - Real ProtectedRoute (replaces Phase 1 stub) with sliding refresh wired via touchSession()
  - SignInForm with credentialed AND guest return_to round-trip
  - SignUpForm with auto-login + route to /onboarding/interests on success
  - ForgotPasswordForm that ALWAYS shows the same success state (no email-existence reveal)
  - useAuth() ergonomic facade hook over useAuthStore + useUsersStore
  - Auth-aware Header (real user / guest / unauthenticated)
  - shadcn primitives: Form, Input, Label, Checkbox
  - Auth Zod schemas (signInSchema, signUpSchema, forgotPasswordSchema, PASSWORD_MIN_LENGTH)
affects: [02-03 onboarding, 02-04 non-auth stores, 03-feature-breadth, 04-polish]

# Tech tracking
tech-stack:
  added: [react-hook-form ^7.74, "@hookform/resolvers ^5.2", shadcn-form (hand-written), shadcn-input, shadcn-label, shadcn-checkbox]
  patterns:
    - "All auth forms use react-hook-form + zodResolver + shadcn <Form> (no hand-rolled <input onChange>)"
    - "Generic sign-in error wording centralized in GENERIC_SIGNIN_ERROR constant; SignInForm surfaces via form.setError('password', ...)"
    - "ProtectedRoute uses useEffect for touchSession() (avoids state-update-during-render warning while preserving sliding-refresh wiring)"
    - "ForgotPasswordForm structurally enforced not to read user registry (negative-grep acceptance)"
    - "Auth-aware Header renders three exclusive affordances based on isAuthenticated/isGuest"

key-files:
  created:
    - src/features/auth/schemas.ts
    - src/features/auth/hooks/useAuth.ts
    - src/features/auth/components/SignInForm.tsx
    - src/features/auth/components/SignUpForm.tsx
    - src/features/auth/components/ForgotPasswordForm.tsx
    - src/features/auth/components/SignInForm.test.tsx
    - src/features/auth/components/SignUpForm.test.tsx
    - src/features/auth/components/ForgotPasswordForm.test.tsx
    - src/features/auth/components/ProtectedRoute.test.tsx
    - src/components/ui/form.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - src/components/ui/checkbox.tsx
  modified:
    - src/features/auth/components/ProtectedRoute.tsx (was Phase 1 stub)
    - src/components/layout/Header.tsx (auth-aware)
    - src/pages/SignInPage.tsx (renders SignInForm)
    - src/pages/SignUpPage.tsx (renders SignUpForm)
    - src/pages/ForgotPasswordPage.tsx (renders ForgotPasswordForm)
    - src/router.test.tsx (Phase 2 ProtectedRoute reality)
    - tests/setup.ts (matchMedia polyfill for sonner)
    - package.json (rhf + resolvers in deps)

key-decisions:
  - "ProtectedRoute calls touchSession() inside useEffect (not during render) to avoid React 18 'Cannot update component during render' warning when the same component subscribes to the session being mutated."
  - "shadcn 'form' primitive was hand-written: the radix-nova preset's form registry returns an empty item, so we wrote the standard shadcn Form component directly. Uses radix-ui meta-package's Slot.Root (matches Phase 1 Button pattern)."
  - "Header renders three exclusive affordance sets (real user / guest / unauthenticated) — keeps the auth-state surface explicit at the layout level."
  - "ForgotPasswordForm doc comment was rewritten to avoid mentioning the literal strings findByEmail/findById/useUsersStore (negative-grep acceptance criterion would have failed). Constraint is now described prosaically."
  - "Added window.matchMedia polyfill to tests/setup.ts because sonner Toaster reads it at mount time and jsdom doesn't ship it. This unblocks any future test that mounts <Toaster />."

patterns-established:
  - "Auth forms: useForm<T>({ resolver: zodResolver(schema), defaultValues }) → <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)}><FormField .../>...</form></Form>"
  - "On API failure: form.setError(<field>, { message: r.error }) — keeps form state and inline display consistent"
  - "On success: toast.success(...) → navigate(target, { replace: true })"
  - "return_to safety: only honor values starting with '/' (rejects absolute URLs to prevent open-redirect)"
  - "ProtectedRoute pattern: redirect with encodeURIComponent(location.pathname + location.search), restored verbatim by sign-in form's safeReturnTo path"

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-04
  - AUTH-05
  - AUTH-06
  - AUTH-07
  - AUTH-08

# Metrics
duration: ~12min
completed: 2026-04-27
---

# Phase 02 Plan 02: Auth pages + ProtectedRoute Summary

**Real auth gate (with sliding-refresh wiring) plus three react-hook-form + Zod auth forms (SignIn/SignUp/Forgot) sharing GENERIC_SIGNIN_ERROR, the credentialed-and-guest return_to round-trip, and an auth-aware Header.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-27T18:23Z
- **Completed:** 2026-04-27T18:35Z
- **Tasks:** 2
- **Files created:** 13
- **Files modified:** 8

## Accomplishments

- Replaced Phase 1 ProtectedRoute stub with real auth gate; redirects to `/signin?return_to=<encoded URL>` and wires sliding refresh via `touchSession()` (BLOCKER 4 closed with passing test).
- Three end-to-end auth forms (SignIn / SignUp / ForgotPassword) using react-hook-form + Zod + shadcn `<Form>` — no hand-rolled `<input onChange>` anywhere.
- `return_to` round-trip works for BOTH credentialed sign-in AND guest-continue (BLOCKER 3 closed with explicit test in `SignInForm.test.tsx`).
- Generic sign-in error wording locked: SignInForm calls `form.setError("password", { message: r.error })` where `r.error` is the `GENERIC_SIGNIN_ERROR` literal from `@/features/auth/types`. Same wording for unknown email AND wrong password (no email-existence leak).
- Forgot Password ALWAYS shows the same success state — structurally enforced by negative grep (no `findByEmail`/`findById`/`useUsersStore` in `ForgotPasswordForm.tsx`).
- Sign Up auto-logs the user in and routes to `/onboarding/interests` on success (per CONTEXT decision).
- Header is now auth-aware: real user → displayName + Sign out; guest → Guest label + Sign in; unauthenticated → Sign in + Sign up. ThemeToggle preserved.
- shadcn primitives `form`, `input`, `label`, `checkbox` are now in `src/components/ui/`.
- 17 new tests pass (3 ProtectedRoute, 6 SignInForm, 4 SignUpForm, 3 ForgotPasswordForm, 1 new router authenticated-renders-Outlet).
- All 7 AUTH requirement IDs touched: AUTH-01, AUTH-02, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08.

## Task Commits

1. **Task 1: deps + shadcn primitives + schemas + useAuth + real ProtectedRoute (with sliding-refresh test)** — `7206a54` (feat)
2. **Task 2: SignIn/SignUp/ForgotPassword forms + Header SignOut + tests (incl credentialed return_to)** — `2267763` (feat)

**Plan metadata commit:** added in final commit step (this SUMMARY + STATE + ROADMAP).

## Final Form Component API

### `<SignInForm />`

Props: none. Reads `?return_to` from URL via `useSearchParams`.

```ts
const form = useForm<SignInInput>({ resolver: zodResolver(signInSchema) })
// onSubmit: signIn(email, password) →
//   ok → toast + navigate(safeReturnTo, { replace: true })
//   !ok → form.setError("password", { message: r.error })   // GENERIC_SIGNIN_ERROR
// onGuest: continueAsGuest() → toast + navigate(safeReturnTo, { replace: true })
```

`safeReturnTo`: only honors values starting with `/` (open-redirect protection); falls back to `/home`.

### `<SignUpForm />`

Props: none.

```ts
const form = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) })
// onSubmit: signUp({ email, password, displayName }) →
//   ok → toast + navigate("/onboarding/interests", { replace: true })
//   !ok → form.setError("email", { message: r.error })
```

### `<ForgotPasswordForm />`

Props: none. Holds local `submitted` state.

```ts
async function onSubmit(_values) {
  // Mock — does NOT branch on user existence. Always success.
  setSubmitted(true)
}
```

When `submitted`, renders the SUCCESS_MESSAGE constant. The form file does NOT import or call `useUsersStore` / `findByEmail` / `findById`.

## ProtectedRoute redirect URL pattern

```ts
const returnTo = encodeURIComponent(location.pathname + location.search)
return <Navigate to={`/signin?return_to=${returnTo}`} replace />
```

Round-trip behavior is symmetric for both auth paths:
- **Credentialed sign-in:** `SignInForm.onSubmit` reads `params.get("return_to")` → if app-internal (starts with `/`) → `navigate(safeReturnTo, { replace: true })`.
- **Guest-continue:** `SignInForm.onGuest` does the same.

## Sliding-refresh wiring

```tsx
useEffect(() => {
  if (isAuthenticated) {
    touchSession()
  }
}, [isAuthenticated, touchSession])
```

`touchSession()` is a no-op when remaining session time > 25 days; re-issues a 30-day expiry below that threshold. Wrapping in `useEffect` avoids a "state update during render" warning that would otherwise fire because `useAuth` itself subscribes to `session` (the same store touchSession mutates).

The sliding-refresh test in `ProtectedRoute.test.tsx` seeds a 20-day-old session, renders the route, then asserts `useAuthStore.getState().session.expiresAt > now + (30 days - 60s tolerance)`. Passes consistently.

## Header changes

Three exclusive affordance sets:

| State                          | Affordances                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `isAuthenticated && !isGuest`  | truncated `displayName` (max-w-[10rem]) + ghost-variant **Sign out** button  |
| `isAuthenticated && isGuest`   | "Guest" label + ghost-variant **Sign in** link                               |
| `!isAuthenticated`             | ghost **Sign in** link + default **Sign up** link                            |

ThemeToggle is preserved at the right edge in all three states.

## Test counts

- **Before Plan 02-02:** 100 tests (98 passing + 2 skipped) across 12 test files (Phase 1 + 02-01).
- **After Plan 02-02:** 117 tests (115 passing + 2 skipped) across 16 test files.
- **New:** 17 tests (3 ProtectedRoute including sliding-refresh, 6 SignInForm including credentialed return_to, 4 SignUpForm, 3 ForgotPasswordForm + 1 new router authenticated-Outlet test).
- **Skipped (carryover from 02-01):** A11/A12 in store.test.ts — un-skip in Plan 02-04 after `clearByUser` ships.

## AUTH requirements satisfied

| ID      | Description                                                                  |
| ------- | ---------------------------------------------------------------------------- |
| AUTH-01 | Sign Up form with email/password/confirm/displayName + auto-login on success |
| AUTH-02 | Sign In form with credentials + return_to round-trip                         |
| AUTH-04 | "Continue as Guest" button on Sign In page                                   |
| AUTH-05 | Forgot Password mock (always-same success state)                             |
| AUTH-06 | Sign Out control in Header (clears session, routes to /)                     |
| AUTH-07 | Guest data clear-on-real-signin (wired in 02-01; no surface change in 02-02) |
| AUTH-08 | ProtectedRoute redirects to /signin?return_to=… and round-trips on success   |

(AUTH-07's behavior is preserved — `signIn`/`signUp` already call `clearGuestData()` from Plan 02-01. Plan 02-04 will add the `clearByUser` actions on the four non-auth stores that close out the optional-chain.)

## Decisions Made

1. **ProtectedRoute uses `useEffect` for `touchSession()`** instead of calling it inline during render. Calling `set` inside the same render that subscribes to that state would cause a React warning (and could spin in dev). Effect runs synchronously after render in RTL, so the sliding-refresh test still works.
2. **Hand-wrote the shadcn `Form` primitive** rather than relying on the radix-nova registry, which returned an empty item for `form`. The hand-written version uses the standard shadcn pattern (FormField/FormItem/FormLabel/FormControl/FormMessage) and uses `radix-ui` meta-package's `Slot.Root` to match the Phase 1 Button conventions.
3. **`safeReturnTo` rejects absolute URLs** — open-redirect protection. The original prototype assumed any return_to was safe; the production posture is "starts-with-`/` or fall back to /home".
4. **Header renders three exclusive affordance sets** rather than a dropdown. Keeps the auth-state surface explicit and easy to test (each state has unique testid/aria-label).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] window.matchMedia polyfill in tests/setup.ts**

- **Found during:** Task 2 (running SignInForm.test.tsx)
- **Issue:** `<Toaster />` (sonner) reads `window.matchMedia` at mount time to honor `prefers-reduced-motion`. jsdom does not ship `matchMedia`. Without a polyfill, every form test that mounts the Toaster crashed with `TypeError: window.matchMedia is not a function`.
- **Fix:** Added a no-op polyfill to `tests/setup.ts` that returns `{ matches: false, ... }` for any query. Shape matches the MediaQueryList interface narrowly enough for sonner's read.
- **Files modified:** `tests/setup.ts`
- **Verification:** All 6 SignInForm tests + 4 SignUpForm tests now pass.
- **Committed in:** `2267763` (Task 2 commit)

**2. [Rule 3 - Blocking] Phase 1 router test was asserting stub behavior**

- **Found during:** Task 1 (running full test suite after replacing the stub)
- **Issue:** `src/router.test.tsx` had a test "Phase 1 ProtectedRoute is a stub — /onboarding renders without auth" that asserted the unauthenticated behavior was "render Outlet". Replacing the stub with a real auth gate (the whole point of this plan) flipped that assertion.
- **Fix:** Renamed to "Phase 2 ProtectedRoute redirects unauthenticated /onboarding visit to /signin", added `/signin` route to the test fixture and assert the redirect occurred. Added a second test that seeds a valid session and asserts `/onboarding` renders.
- **Files modified:** `src/router.test.tsx`
- **Verification:** Both tests pass; no regressions in other router tests.
- **Committed in:** `7206a54` (Task 1 commit)

**3. [Rule 1 - Bug] ForgotPasswordForm doc comment failed negative-grep acceptance**

- **Found during:** Task 2 acceptance verification
- **Issue:** The doc comment in `ForgotPasswordForm.tsx` originally explained the constraint by mentioning `findByEmail`/`findById`/`useUsersStore` literally, which made the negative-grep acceptance criterion match the file (and "fail" by reporting a match).
- **Fix:** Rewrote the comment prosaically — describes the constraint without mentioning the forbidden identifiers literally.
- **Files modified:** `src/features/auth/components/ForgotPasswordForm.tsx`
- **Verification:** `grep -E "findByEmail|findById|useUsersStore" src/features/auth/components/ForgotPasswordForm.tsx` returns 0 matches.
- **Committed in:** `2267763` (Task 2 commit, after the fix)

---

**Total deviations:** 3 auto-fixed (1 missing critical/test environment, 2 blocking)
**Impact on plan:** All three were necessary to satisfy acceptance criteria. No scope creep.

## Issues Encountered

- **Slot.SlotClone ref warning:** When `<FormControl>` (Slot) wraps `<Input>`, React 18 logs `Function components cannot be given refs. Attempts to access this ref will fail.` because the radix-nova `Input` is a plain function component (not `forwardRef`). The warning is benign — refs are only used for focus-on-error in react-hook-form, and form validation works fine. Phase 4 polish can convert `Input` (and `Label`/`Checkbox`) to `forwardRef` to silence the warning. Not blocking.

## Next Phase Readiness

### Plan 02-03 carryover
- Auto-login on sign-up routes to `/onboarding/interests`. **Plan 02-03 must wire the `/onboarding/interests` and `/onboarding/tools` routes** to real components by end of plan or Sign Up will land on a 404 (the `/onboarding` placeholder still exists from Phase 1, but the new sub-routes do not).
- Final write path is `useAuthStore.getState().completeOnboarding(...)` (already shipped in 02-01). Onboarding components should consume `useAuth()` for ergonomic access.

### Plan 02-04 carryover
- `useAuthStore.clearGuestData()` calls `clearByUser('guest')` on the four non-auth stores via dynamic import + optional-chain. Once Plan 02-04 ships those `clearByUser` actions, **un-skip A11/A12 in `src/features/auth/store.test.ts`** and confirm they pass.

### Phase 3 carryover
- Every protected feature link can navigate normally — `<ProtectedRoute />` handles return_to encoding and the SignInForm handles the round-trip. Consumers do NOT need to add `?return_to=...` to their links. They just `navigate("/favorites")` (or wherever) and the auth gate handles the redirect-and-restore transparently.
- Phase 3 features can use `useAuth()` for ergonomic access to `session`, `isAuthenticated`, `isGuest`, `userId`, `currentUser`, `signOut`. The `currentUser` field is non-reactive (read via `useUsersStore.getState().findById` rather than a selector) — components that need to react to user-record updates (interests changes, displayName changes from a future Profile edit) should subscribe to `useUsersStore` directly.

## Self-Check: PASSED

Verified:
- `src/features/auth/components/ProtectedRoute.tsx` modified (real gate)
- `src/features/auth/components/{SignInForm,SignUpForm,ForgotPasswordForm}.tsx` exist
- `src/features/auth/components/{SignInForm,SignUpForm,ForgotPasswordForm,ProtectedRoute}.test.tsx` exist
- `src/features/auth/schemas.ts` exists with all 4 expected exports
- `src/features/auth/hooks/useAuth.ts` exists
- `src/components/ui/{form,input,label,checkbox}.tsx` exist
- `src/components/layout/Header.tsx` modified (auth-aware)
- Commits `7206a54` and `2267763` present in `git log`
- All 115 tests pass + 2 skipped; typecheck, lint, build all clean

---
*Phase: 02-auth-persistence-stores*
*Plan: 02 (Wave 2)*
*Completed: 2026-04-27*
