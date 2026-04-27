---
phase: 02-auth-persistence-stores
verified: 2026-04-26T17:02:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Sign up → onboarding → finish → refresh browser"
    expected: "User lands back at /home with interests and selectedTools shown in their profile, localStorage contains aitools:users:registry with their data"
    why_human: "End-to-end persistence across a real browser refresh requires a running dev server; cannot verify from static grep"
  - test: "Sign in → close tab → reopen → still authenticated"
    expected: "Session survives tab close and reopen (30-day persistence)"
    why_human: "Requires real browser with localStorage; jsdom tests prove the code path but not the actual browser environment"
  - test: "Visit /favorites while signed out → redirected to /signin?return_to=%2Ffavorites → sign in → land at /favorites"
    expected: "return_to round-trip works end-to-end in the running app"
    why_human: "UI flow requires running dev server; automated tests prove the logic"
---

# Phase 2: Auth + Persistence Stores Verification Report

**Phase Goal:** Every persisted concern (auth, users, favorites, votes, reviews, submissions) has its Zustand store wired to localStorage with the correct state shape — including the vote state machine — and users can sign up, sign in, sign out, complete two-step onboarding, and have selections survive refresh.

**Verified:** 2026-04-26T17:02:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Auth store + users store exist, persist via `{version:1,data}` envelope through `@/lib/storage`, session survives rehydrate | VERIFIED | `src/features/auth/store.ts` uses `safeGet`/`safeSet`/`safeRemove`; test A8 confirms expired sessions are nulled on rehydrate; test A10 confirms only canonical keys are written |
| 2 | Sign-in error is `"Email or password is incorrect"` for both unknown email and wrong password | VERIFIED | `GENERIC_SIGNIN_ERROR` constant in `src/features/auth/types.ts`; `store.ts` returns it on both failure branches; tests A3a + A3b confirm both paths |
| 3 | Session sliding refresh: 20-day-old session refreshed to ~30 days on ProtectedRoute render | VERIFIED | `touchSession()` in `useAuthStore` with `SESSION_REFRESH_THRESHOLD_MS = 25d`; `ProtectedRoute.tsx` calls it via `useEffect`; ProtectedRoute test "refreshes a 20-day-old session to ~30 days" passes |
| 4 | ProtectedRoute redirects to `/signin?return_to=<encoded>` and return_to round-trip works for both credentialed AND guest sign-in | VERIFIED | `ProtectedRoute.tsx` encodes `location.pathname + location.search`; `SignInForm.tsx` reads `params.get("return_to")` and navigates to it; test "respects return_to query param after successful sign-in with credentials" passes |
| 5 | Sign-up auto-logs in and routes to `/onboarding/interests` | VERIFIED | `SignUpForm.tsx` calls `signUp()` then `navigate("/onboarding/interests")`; test "auto-logs in and routes to /onboarding/interests on success" passes |
| 6 | Guest session: userId === "guest", set by "Continue as Guest" button, scoped per-user | VERIFIED | `continueAsGuest()` calls `newSession(GUEST_USER_ID)` where `GUEST_USER_ID = "guest"`; test A5 confirms; SignInForm has "Continue as Guest" button calling `onGuest()` |
| 7 | Two-step onboarding wizard: toggleable chips, no preselection, back-nav preserves state, Finish writes via `authStore.completeOnboarding` (single write path) | VERIFIED | `OnboardingInterestsStep.tsx` and `OnboardingToolsStep.tsx` use `useOnboardingStore` (Set-based, in-memory) and call `useAuth().completeOnboarding()` on Skip/Finish; neither calls `useUsersStore.updateUser` directly; all onboarding tests pass |
| 8 | Continue button on step 1 disabled until 1+ interest selected | VERIFIED | `continueDisabled = interests.size < 1` in `OnboardingInterestsStep.tsx`; test "Continue is disabled when 0 interests selected" and "clicking a chip toggles aria-pressed and enables Continue" pass |
| 9 | Vote state machine: 6 exhaustive transitions (none→up, none→down, up→none, up→down, down→none, down→up) | VERIFIED | `src/features/rankings/store.ts` implements `current === next ? "none" : next`; all 6 transitions named and tested as V1-V6 in `store.test.ts`; 7 total transition-name matches found in test file |
| 10 | All 4 non-auth stores ship `clearByUser(userId)` | VERIFIED | `clearByUser` present in tools/store.ts, rankings/store.ts, reviews/store.ts, submit/store.ts; 12 total occurrences (interface + impl across 4 files) |
| 11 | Guest data cleared on real sign-in and sign-up (A11/A12 un-skipped) | VERIFIED | Tests A11 and A12 in `src/features/auth/store.test.ts` are not skipped; both pass; `clearGuestData()` in authStore uses dynamic imports to call `clearByUser('guest')` on all 4 non-auth stores |
| 12 | All 4 non-auth stores persist via `@/lib/storage` with namespaced keys and `version:1` envelope | VERIFIED | All 4 stores import and use `storageKey`, `safeGet`, `safeSet` from `@/lib/storage`; keys are `aitools:favorites:global`, `aitools:upvotes:global`, `aitools:reviews:global`, `aitools:submissions:global` |
| 13 | No raw localStorage calls in feature code | VERIFIED | `npm run lint:no-direct-localstorage` exits 0; only `src/lib/storage.ts` touches `localStorage` directly |
| 14 | Full test suite green: 182 tests pass, 0 failures | VERIFIED | `vitest run` output: "Test Files  24 passed (24) / Tests  182 passed (182)" |

**Score:** 14/14 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/crypto.ts` | hashPassword + verifyPassword | VERIFIED | Exports both functions + PasswordHash type; SHA-256 with per-call random 32-byte salt |
| `src/lib/crypto.test.ts` | 5 tests for hash/verify | VERIFIED | 5 `it(` blocks covering round-trip, salt randomness, verify-true, verify-false, tampered-salt |
| `src/features/auth/types.ts` | AuthSession, UsersRegistry, SESSION_DURATION_MS, SESSION_REFRESH_THRESHOLD_MS, GUEST_USER_ID, GENERIC_SIGNIN_ERROR | VERIFIED | All 6 exports present; `GENERIC_SIGNIN_ERROR = "Email or password is incorrect"` |
| `src/features/auth/store.ts` | useAuthStore + useUsersStore | VERIFIED | Both exported; sliding session, guest mode, completeOnboarding, clearGuestData dynamic-import wiring |
| `src/features/auth/store.test.ts` | 14+ it blocks (A11/A12 un-skipped) | VERIFIED | 23 `it(` blocks; A11 and A12 are live (no `it.skip`) |
| `src/features/auth/schemas.ts` | signInSchema, signUpSchema, forgotPasswordSchema, PASSWORD_MIN_LENGTH | VERIFIED | All 4 exports; password rules: min 8 chars, 1 letter, 1 number |
| `src/features/auth/hooks/useAuth.ts` | useAuth hook | VERIFIED | Exports `useAuth`; wraps authStore + usersStore ergonomically |
| `src/features/auth/components/ProtectedRoute.tsx` | Real auth gate with touchSession + return_to | VERIFIED | Calls `touchSession()` in `useEffect`; encodes `return_to`; no longer contains Phase 1 stub TODO |
| `src/features/auth/components/ProtectedRoute.test.tsx` | 3 tests including sliding-refresh | VERIFIED | 3 tests: redirect-unauthenticated, render-outlet-when-authenticated, sliding-refresh-20day |
| `src/features/auth/components/SignInForm.tsx` | Form with react-hook-form + zodResolver + return_to | VERIFIED | Uses `useForm` + `zodResolver(signInSchema)`; reads `useSearchParams` for return_to; "Continue as Guest" button present |
| `src/features/auth/components/SignUpForm.tsx` | Form routing to /onboarding/interests | VERIFIED | Routes to `/onboarding/interests` on success |
| `src/features/auth/components/ForgotPasswordForm.tsx` | Always-same success state | VERIFIED | No `findByEmail`/`findById`/`useUsersStore` references; `setSubmitted(true)` on any submit |
| `src/components/ui/form.tsx` | shadcn Form primitive | VERIFIED | File exists; used in all 3 auth forms |
| `src/components/ui/input.tsx` | shadcn Input | VERIFIED | File exists |
| `src/components/ui/label.tsx` | shadcn Label | VERIFIED | File exists |
| `src/features/onboarding/store.ts` | useOnboardingStore (transient, Set-based) | VERIFIED | No `safeGet`/`safeSet`/`persist`; uses `Set<CategorySlug>` and `Set<string>`; `clear()` resets both |
| `src/features/onboarding/components/ToggleableChip.tsx` | Chip with aria-pressed | VERIFIED | Renders `<Button>` with `aria-pressed={pressed}` |
| `src/features/onboarding/components/OnboardingInterestsStep.tsx` | Step 1 UI, not a stub | VERIFIED | No "Loading interests step" string; `CATEGORIES.map`; `interests.size < 1` gate; calls `completeOnboarding` on Skip |
| `src/features/onboarding/components/OnboardingToolsStep.tsx` | Step 2 UI, not a stub | VERIFIED | `TOOLS.map`; calls `completeOnboarding` on Finish and Skip; no `useUsersStore` import |
| `src/router.tsx` | /onboarding redirect + /onboarding/interests + /onboarding/tools routes (protected) | VERIFIED | All 3 entries present inside `<ProtectedRoute />`; `<Navigate to="/onboarding/interests" replace />` on bare /onboarding |
| `src/features/tools/store.ts` | useFavoritesStore + clearByUser | VERIFIED | Exports `useFavoritesStore`; `clearByUser` in interface and implementation |
| `src/features/rankings/store.ts` | useUpvoteStore + 6-transition state machine + clearByUser | VERIFIED | `current === next ? "none" : next`; all 6 transitions; `clearByUser` present |
| `src/features/reviews/store.ts` | useReviewStore + clearByUser | VERIFIED | Exports `useReviewStore`; `clearByUser` filters across all tool slugs |
| `src/features/submit/store.ts` | useSubmissionStore + clearByUser | VERIFIED | Exports `useSubmissionStore`; `clearByUser` removes by submitterId |
| `src/lib/withToast.ts` | withToast utility (sync + async, re-throws) | VERIFIED | Handles both sync and async; calls `toast.success` after success; `toast.error` + re-throws on failure |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/features/auth/store.ts` | `@/lib/storage` | `safeGet` + `safeSet` + `safeRemove` through `{version:1,data}` envelope | WIRED | Both `USERS_KEY` and `SESSION_KEY` paths use the helper |
| `src/features/auth/store.ts` | `@/lib/crypto` | `hashPassword` on register, `verifyPassword` on signIn | WIRED | Both calls present in `register()` and `signIn()` |
| `src/features/auth/store.ts (signIn/signUp)` | `tools/store + rankings/store + reviews/store + submit/store` | `clearGuestData()` via dynamic `import()` calls `clearByUser('guest')` | WIRED | Dynamic import with `storePath()` builder + optional chaining; A11/A12 tests confirm end-to-end wiring with 02-04 stores present |
| `src/features/auth/store.ts (completeOnboarding)` | `useUsersStore.updateUser` | Single write path for onboarding final selections | WIRED | `completeOnboarding()` calls `useUsersStore.getState().updateUser(userId, {interests, selectedTools})` |
| `src/features/auth/components/ProtectedRoute.tsx` | `src/features/auth/store.ts` | `isAuthenticated`, `touchSession`, `return_to` redirect | WIRED | `useAuth()` wraps both; `touchSession()` called in `useEffect` on every authenticated render |
| `src/features/auth/components/SignInForm.tsx` | `src/features/auth/store.ts` | `useAuthStore.signIn` via `useAuth()` | WIRED | `signIn` called in `onSubmit`; `return_to` param read and honored |
| `src/features/auth/components/SignUpForm.tsx` | `src/features/auth/store.ts` | `useAuthStore.signUp` via `useAuth()` | WIRED | `signUp` called in `onSubmit`; routes to `/onboarding/interests` on success |
| `src/features/onboarding/components/OnboardingToolsStep.tsx` | `src/features/auth/store.ts` | `completeOnboarding` (NOT `useUsersStore.updateUser`) | WIRED | `completeOnboarding` called in `persist()` for both Finish and Skip; no `useUsersStore` import |
| `src/features/onboarding/components/OnboardingInterestsStep.tsx` | `src/features/auth/store.ts` | `completeOnboarding` on Skip | WIRED | `completeOnboarding` called in `persistPartial()` for Skip; no `useUsersStore` import |
| All 4 non-auth stores | `@/lib/storage` | `safeGet` + `safeSet` with `version:1` and namespaced keys | WIRED | 16 total `safeGet`/`safeSet`/`safeRemove` calls across the 4 stores |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AUTH-01 | 02-01, 02-02 | User can create account with email and password | SATISFIED | `usersStore.register()` + `SignUpForm.tsx`; test A1 + SignUpForm test "auto-logs in" |
| AUTH-02 | 02-01, 02-02 | User can log in with email and password | SATISFIED | `authStore.signIn()` + `SignInForm.tsx`; tests A2, A3a, A3b |
| AUTH-03 | 02-01 | Session persists across browser refresh | SATISFIED | `safeSet(SESSION_KEY, session, 1)` on every sign-in/up/guest call; `loadInitialSession()` reads back on store init; test A8 proves rehydrate; test A10 confirms key |
| AUTH-04 | 02-02 | User can log out from any page via header | SATISFIED | `Header.tsx` calls `signOut()` via `useAuth()`; routes to `/` on sign-out |
| AUTH-05 | 02-02 | Forgot Password form shows mock success state | SATISFIED | `ForgotPasswordForm.tsx` always shows success; no `findByEmail`; tests confirm identical state for registered + unregistered email |
| AUTH-06 | 02-02 | Inline form validation for email, password, confirm-password | SATISFIED | `schemas.ts` Zod rules enforced by react-hook-form; SignUpForm tests cover short password, missing number, mismatched confirm |
| AUTH-07 | 02-01, 02-02 | Guest session via "Continue as Guest" | SATISFIED | `continueAsGuest()` sets `userId='guest'`; button in `SignInForm.tsx`; guest data cleared on real sign-in (clearByUser) |
| AUTH-08 | 02-02 | Protected routes redirect to /signin with return_to | SATISFIED | `ProtectedRoute.tsx` encodes `return_to`; test "redirects unauthenticated users to /signin with encoded return_to" passes |
| ONBO-01 | 02-03 | After sign up, routed to two-step onboarding | SATISFIED | `SignUpForm.tsx` navigates to `/onboarding/interests` on success |
| ONBO-02 | 02-03 | Step 1 interests are toggleable, no preselection | SATISFIED | `useOnboardingStore` starts with `interests: new Set()`; `OnboardingInterestsStep` test "renders all 10 categories with NO preselection" passes |
| ONBO-03 | 02-03 | Step 2 tools are toggleable, no preselection | SATISFIED | `useOnboardingStore` starts with `tools: new Set()`; `OnboardingToolsStep` test "renders 50 tool chips with NO preselection" passes |
| ONBO-04 | 02-03 | Back from step 2 preserves step 1 selections | SATISFIED | `onBack()` calls `navigate("/onboarding/interests")` without `clear()`; `OnboardingToolsStep` test "Back-nav from step 2 to step 1 preserves step-1 selections" passes |
| ONBO-05 | 02-03 | Finishing routes to /home and persists interests + tools | SATISFIED | `onFinish()` calls `persist()` (→ `completeOnboarding`) then `navigate("/home")`; `OnboardingToolsStep` test "Finish writes interests + selectedTools to user record" passes |
| ONBO-06 | 02-03 | Skip from either step routes to /home with partial state | SATISFIED | Both `OnboardingInterestsStep.onSkip()` and `OnboardingToolsStep.onSkip()` call `persistPartial()`/`persist()` then `navigate("/home")`; both covered by tests |

All 14 Phase 2 requirements: SATISFIED.

**Note on AUTH-03:** REQUIREMENTS.md marks AUTH-03 as "Pending" in its traceability table but the actual implementation is complete — session is persisted via `safeSet` and rehydrated via `loadInitialSession()` at store init, tested by A8 and A10. The traceability table entry appears to be a documentation lag, not a code gap. The code fully satisfies the requirement.

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/features/auth/components/ProtectedRoute.tsx` | `touchSession()` called inside `useEffect` rather than during render (as the plan template showed) | INFO | Not a bug — this is actually the correct React pattern. Calling state-mutating actions during render causes issues in React 18 Strict Mode. The implementation is correct and all 3 ProtectedRoute tests pass including the sliding-refresh test. |

No blockers. No stubs. No empty implementations. No console.log-only handlers. No `TODO`/`FIXME` in Phase 2 files (only in comments explaining cross-plan wiring that was subsequently completed).

---

### Human Verification Required

#### 1. Full onboarding flow in running browser

**Test:** npm run dev → sign up → land on /onboarding/interests → pick 2+ interests → Continue → pick 1+ tools → Finish → navigate to /profile or open DevTools localStorage

**Expected:** `aitools:users:registry` contains the signed-up user with `interests` and `selectedTools` arrays populated; user lands on /home

**Why human:** Requires running dev server and actual browser localStorage; jsdom tests prove the logic path but not browser-specific behavior

#### 2. Session persists across hard refresh

**Test:** Sign in → press Cmd+Shift+R (hard refresh) → observe still signed in; wait behavior from 30-day mock

**Expected:** User remains authenticated; Header shows authenticated state

**Why human:** Cannot simulate a real browser tab/process restart in jsdom

#### 3. return_to round-trip in running app

**Test:** While signed out, visit `/favorites` → observe redirect to `/signin?return_to=%2Ffavorites` → sign in with credentials → observe landing at `/favorites`

**Expected:** URL bar shows /favorites after sign-in completes

**Why human:** Requires running app with real browser navigation

---

### Overall Assessment

Phase 2 goal is **fully achieved**. Every persisted concern has its Zustand store:

- **Auth/Users**: `useAuthStore` + `useUsersStore` in `src/features/auth/store.ts` — sliding 30-day refresh, guest mode, generic sign-in errors, completeOnboarding single write path, guest-clear-on-signin/signup
- **Favorites**: `useFavoritesStore` in `src/features/tools/store.ts` — per-user Set, insertion order, clearByUser
- **Votes**: `useUpvoteStore` in `src/features/rankings/store.ts` — 6-transition state machine (`current === next ? "none" : next`), netCount, clearByUser
- **Reviews**: `useReviewStore` in `src/features/reviews/store.ts` — ordered by createdAt desc, clearByUser
- **Submissions**: `useSubmissionStore` in `src/features/submit/store.ts` — status=pending, clearByUser

All wired to localStorage via `@/lib/storage` with `{version:1,data}` envelopes. A11/A12 (guest-clear-on-signin/signup) are un-skipped and passing. ProtectedRoute redirects with return_to and calls touchSession (sliding refresh wired and tested). Two-step onboarding wizard works end-to-end with the architectural split (transient state in useOnboardingStore, final write via authStore.completeOnboarding). 182 tests pass, typecheck clean, build clean, lint clean.

---

_Verified: 2026-04-26T17:02:00Z_
_Verifier: Claude (gsd-verifier)_
