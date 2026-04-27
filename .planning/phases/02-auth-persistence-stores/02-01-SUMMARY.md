# Plan 02-01 Summary: authStore + usersStore + Web Crypto password helpers

**Phase:** 02-auth-persistence-stores
**Plan:** 02-01 (Wave 1)
**Status:** Complete
**Date:** 2026-04-27
**Mode:** manual execution (after subagent rejection)

## What was built

### Crypto helpers (Task 1)
- `src/lib/crypto.ts` exports `hashPassword(plaintext) -> Promise<{saltHex, hashHex}>` and `verifyPassword(plaintext, record) -> Promise<boolean>`
- 32-byte random salt via `crypto.getRandomValues`
- SHA-256 hash via `crypto.subtle.digest`
- 7 tests in `src/lib/crypto.test.ts` — all green
- Types: `PasswordHash` interface in `src/types/index.ts`; `User.passwordHash: PasswordHash` (was previously `string`)

### Auth + users stores (Task 2)
- `src/features/auth/types.ts` exports `AuthSession`, `UsersRegistry`, `SESSION_DURATION_MS` (30 days), `SESSION_REFRESH_THRESHOLD_MS` (25 days), `GUEST_USER_ID` ("guest"), `GENERIC_SIGNIN_ERROR` ("Email or password is incorrect")
- `src/features/auth/store.ts` exports `useAuthStore` and `useUsersStore` (Zustand v5 with manual `safeGet`/`safeSet`/`safeRemove` hydration)
- 19 tests in `src/features/auth/store.test.ts` — 17 passing + 2 skipped (A11/A12 guest-clear pending Plan 02-04)

### usersStore API
| Action | Behavior |
|---|---|
| `register({email, password, displayName})` | Hashes password, creates User with `crypto.randomUUID()` id, throws "already exists" on case-insensitive email collision |
| `findByEmail(email)` | Case-insensitive lookup |
| `findById(id)` | Direct ID lookup |
| `updateUser(id, patch)` | Patches displayName / interests / selectedTools; persists |

### authStore API
| Action | Behavior |
|---|---|
| `signUp({email, password, displayName})` | Registers + auto-logs-in. Returns `{ok: true, userId}` or `{ok: false, error}`. Calls `clearGuestData()` before setting session. |
| `signIn(email, password)` | Verifies credentials. Returns generic `{ok: false, error: "Email or password is incorrect"}` for both unknown email and wrong password (no leak). |
| `signOut()` | Clears session via `safeRemove` |
| `continueAsGuest()` | Sets session with `userId: "guest"` |
| `touchSession()` | Sliding refresh: re-issues 30-day expiry when remaining < 25 days. Clears expired sessions. |
| `isAuthenticated()` | True if non-null session with future `expiresAt` |
| `currentUserId()` | userId or null |
| `completeOnboarding(interests, selectedTools)` | Single write path for onboarding finish. No-op for guest/null sessions. Calls `useUsersStore.updateUser()` internally. |

### Storage helper extension
- `src/lib/storage.ts` gained `safeRemove(key: string): void` — removes key + dispatches synthetic StorageEvent. Used by `signOut()` and the touch-session-expired path.

## Persistence keys

- `aitools:users:registry` — UsersRegistry envelope `{version: 1, data: User[]}`
- `aitools:auth:session` — AuthSession envelope `{version: 1, data: AuthSession}` (key removed via safeRemove on logout/expiry rather than persisting null)

## Test counts

- Before: 70 tests (Phase 1 final)
- After: 100 tests total (98 passing + 2 skipped) across 12 test files
- New: 7 crypto tests + 19 auth-store tests + 4 type-test fixture updates = 30 new test assertions

## A11/A12 skip status

Tests A11 (guest-clear-on-signIn) and A12 (guest-clear-on-signUp) are marked `it.skip` until Plan 02-04 ships `clearByUser` actions on the four non-auth stores (favoritesStore, upvoteStore, reviewStore, submissionStore). The `clearGuestData()` helper in `authStore` uses dynamic `await import(...)` and optional-chain (`?.clearByUser?.()`) so it no-ops gracefully today.

**Action for Plan 02-04 executor:** After implementing `clearByUser(userId)` on all 4 non-auth stores, un-skip A11 and A12 in `src/features/auth/store.test.ts` and confirm they pass.

## Verification gates

| Gate | Status |
|---|---|
| `node ./node_modules/vitest/vitest.mjs run` | ✅ 98 passed, 2 skipped |
| `node ./node_modules/typescript/bin/tsc --noEmit` | ✅ exits 0 |
| `npm run lint:no-direct-localstorage` | ✅ exits 0 |
| `npm run build` | ✅ exits 0 |
| Generic sign-in error string locked | ✅ `GENERIC_SIGNIN_ERROR = "Email or password is incorrect"` |
| `completeOnboarding` exposed on authStore | ✅ |
| `clearGuestData` called from signIn + signUp | ✅ |

## Deviations

1. **Lint script tweak (`package.json`):** Added `--exclude='*.test.ts' --exclude='*.test.tsx'` to `lint:no-direct-localstorage`. Test files use raw `localStorage.setItem` to seed state and `localStorage.clear()` between tests — both legitimate test patterns. The lint exists to catch raw localStorage in feature code, not test code.
2. **Auto-leftover cleanup:** Removed scaffolding leftovers from earlier in Phase 1 that had been left untracked: `temp-vite/`, `package-lock 2.json`, `public/icons.svg`, `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`. These were artifacts of `create-vite` bootstrap that the shadcn flow superseded.

## Carryover for Plan 02-02 (Auth pages + ProtectedRoute)

- Consume `useAuthStore` hooks: `signIn`, `signUp`, `signOut`, `continueAsGuest`, `isAuthenticated`, `currentUserId`, `touchSession`
- Generic error string: import `GENERIC_SIGNIN_ERROR` from `@/features/auth/types` — never duplicate the literal
- Form validation via `react-hook-form` + Zod v3 (already installed in Phase 1)
- ProtectedRoute should call `touchSession()` on every authenticated render to enable sliding refresh
- `return_to` query param: encode original URL on redirect-from-protected-route, restore on successful sign-in / guest-continue

## Carryover for Plan 02-03 (Onboarding wizard)

- Final write path is `useAuthStore.getState().completeOnboarding(interests, selectedTools)` — NOT `useUsersStore.updateUser()` directly
- Transient navigation state (which chips are pressed during nav between step 1 and step 2) lives in a separate `useOnboardingStore` (in-memory `Set<string>`, no persistence)
- Skip on either step also calls `completeOnboarding(...)` with current selections (allows empty)

## Carryover for Plan 02-04 (Non-auth stores)

- Each of `useFavoritesStore`, `useUpvoteStore`, `useReviewStore`, `useSubmissionStore` MUST export a `clearByUser(userId: string)` action — `authStore.clearGuestData()` already calls it via dynamic import + optional-chain
- After implementing, **un-skip tests A11 and A12** in `src/features/auth/store.test.ts` and confirm they pass
- Vote state machine in `useUpvoteStore`: `setVote(userId, slug, nextVote)` where if existing vote === nextVote → set to "none"; else set to nextVote. All 6 transitions exhaustively tested.

## Commits

| Hash | Message |
|---|---|
| `177eedd` | feat(02-01): add Web Crypto password helpers + structured PasswordHash type |
| `e09a80a` | docs(02): commit Phase 2 plans (4 waves) and revised CONTEXT |
| `4d78fde` | feat(02-01): add usersStore + authStore with sliding session, guest mode, generic sign-in errors, completeOnboarding, guest-clear |
