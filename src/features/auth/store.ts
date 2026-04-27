// src/features/auth/store.ts
// Phase 2 / Plan 02-01 — useUsersStore (registry) + useAuthStore (session).
//
// Persists via the Phase 1 storage helper (`safeGet`/`safeSet`/`safeRemove`) using
// the {version: 1, data: T} envelope convention. We DO NOT use Zustand's `persist`
// middleware here — keeping the validated envelope shape consistent with the rest
// of Phase 2's stores requires hand-rolled hydration through `safeGet`.
//
// Cross-store wiring note (BLOCKER 2 fix from Plan 02-01):
// `signIn` and `signUp` success paths call `clearGuestData()`, which lazily imports
// the four non-auth stores and calls `clearByUser('guest')` on each. Those actions
// ship in Plan 02-04. Until then, the optional-chain (`?.`) in clearGuestData makes
// it a no-op. Dynamic imports keep module-init free of circular references.

import { create } from "zustand"
import { z } from "zod"
import type { User, CategorySlug } from "@/types"
import { storageKey, safeGet, safeSet, safeRemove } from "@/lib/storage"
import { hashPassword, verifyPassword } from "@/lib/crypto"
import {
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
  GUEST_USER_ID,
  GENERIC_SIGNIN_ERROR,
  type AuthSession,
  type UsersRegistry,
} from "./types"

const STORE_VERSION = 1
const USERS_KEY = storageKey("users", "registry") // "aitools:users:registry"
const SESSION_KEY = storageKey("auth", "session") // "aitools:auth:session"

// ────────────────────────────────────────────────────────────────────────
// Zod schemas (mirror `@/types` shapes — the storage envelope wraps these)
// ────────────────────────────────────────────────────────────────────────

const passwordHashSchema = z.object({
  saltHex: z.string(),
  hashHex: z.string(),
})

// Cast at the end avoids TypeScript complaining about string-vs-CategorySlug widening.
// Runtime correctness is preserved: any unknown string in `interests` would still parse
// (we trust persisted data; UI code constrains the input set).
const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  displayName: z.string(),
  passwordHash: passwordHashSchema,
  interests: z.array(z.string()),
  selectedTools: z.array(z.string()),
  createdAt: z.string(),
}) as unknown as z.ZodType<User>

const usersRegistrySchema: z.ZodType<UsersRegistry> = z.array(userSchema)

const sessionSchema: z.ZodType<AuthSession> = z.object({
  userId: z.string(),
  issuedAt: z.number(),
  expiresAt: z.number(),
  token: z.string(),
})

// ────────────────────────────────────────────────────────────────────────
// useUsersStore — the user registry (mock database)
// ────────────────────────────────────────────────────────────────────────

interface UsersState {
  users: UsersRegistry
  register(input: { email: string; password: string; displayName: string }): Promise<User>
  findByEmail(email: string): User | undefined
  findById(id: string): User | undefined
  updateUser(
    id: string,
    patch: Partial<Pick<User, "displayName" | "interests" | "selectedTools">>,
  ): User | undefined
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: safeGet<UsersRegistry>(USERS_KEY, usersRegistrySchema, STORE_VERSION, []),

  async register({ email, password, displayName }) {
    const lower = email.toLowerCase()
    if (get().users.some((u) => u.email.toLowerCase() === lower)) {
      throw new Error("An account with that email already exists")
    }
    const passwordHash = await hashPassword(password)
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      username: lower.split("@")[0] ?? lower,
      displayName,
      passwordHash,
      interests: [],
      selectedTools: [],
      createdAt: new Date().toISOString(),
    }
    const next = [...get().users, newUser]
    set({ users: next })
    safeSet(USERS_KEY, next, STORE_VERSION)
    return newUser
  },

  findByEmail(email) {
    const lower = email.toLowerCase()
    return get().users.find((u) => u.email.toLowerCase() === lower)
  },

  findById(id) {
    return get().users.find((u) => u.id === id)
  },

  updateUser(id, patch) {
    let updated: User | undefined
    const next = get().users.map((u) => {
      if (u.id !== id) return u
      updated = { ...u, ...patch }
      return updated
    })
    if (!updated) return undefined
    set({ users: next })
    safeSet(USERS_KEY, next, STORE_VERSION)
    return updated
  },
}))

// ────────────────────────────────────────────────────────────────────────
// useAuthStore — current session + sign-up/in/out + guest mode + onboarding
// ────────────────────────────────────────────────────────────────────────

type SignInResult = { ok: true; userId: string } | { ok: false; error: string }
type SignUpResult = { ok: true; userId: string } | { ok: false; error: string }

interface AuthState {
  session: AuthSession | null
  signUp(input: {
    email: string
    password: string
    displayName: string
  }): Promise<SignUpResult>
  signIn(email: string, password: string): Promise<SignInResult>
  signOut(): void
  continueAsGuest(): void
  /** Slide-refresh the current session if it has < 25 days remaining; clear if expired. */
  touchSession(): void
  isAuthenticated(): boolean
  currentUserId(): string | null
  /**
   * Onboarding final-write contract (CONTEXT.md "Onboarding Interactions").
   * Writes interests + selectedTools to the current user via useUsersStore.updateUser.
   * Single write path — onboarding components MUST NOT call useUsersStore.updateUser directly.
   * No-op when the current session is null or guest (guests have no user record to update).
   */
  completeOnboarding(interests: CategorySlug[], selectedTools: string[]): void
}

/**
 * Build a non-statically-analyzable module path. Vite's static-analysis pass
 * follows literal `import("...")` strings during transform; if any of the four
 * non-auth stores is missing (the case during Plan 02-01 in isolation, before
 * 02-04 ships), the whole module fails to load. Building the path at runtime
 * via `[...].join("/")` defers resolution to the actual runtime import call,
 * which the try/catch below absorbs.
 *
 * The /* @vite-ignore *\/ pragma at each call site additionally tells Vite's
 * dev/build pipeline not to attempt static resolution.
 */
function storePath(feature: string): string {
  return ["@", "features", feature, "store"].join("/")
}

/**
 * Clear all guest-keyed entries across the four non-auth stores.
 * Called on signIn/signUp success BEFORE setting the new real-user session.
 *
 * Plan 02-04 ships `clearByUser(userId)` on each non-auth store. Until then,
 * the optional-chain (`?.`) makes this a graceful no-op. The dynamic-import
 * path is built at runtime (see `storePath`) so this file compiles and runs
 * even when the four stores don't yet exist on disk.
 */
async function clearGuestData(): Promise<void> {
  try {
    const [
      favoritesMod,
      rankingsMod,
      reviewsMod,
      submitMod,
    ] = await Promise.all([
      import(/* @vite-ignore */ storePath("tools")),
      import(/* @vite-ignore */ storePath("rankings")),
      import(/* @vite-ignore */ storePath("reviews")),
      import(/* @vite-ignore */ storePath("submit")),
    ])
    favoritesMod.useFavoritesStore?.getState?.()?.clearByUser?.(GUEST_USER_ID)
    rankingsMod.useUpvoteStore?.getState?.()?.clearByUser?.(GUEST_USER_ID)
    reviewsMod.useReviewStore?.getState?.()?.clearByUser?.(GUEST_USER_ID)
    submitMod.useSubmissionStore?.getState?.()?.clearByUser?.(GUEST_USER_ID)
  } catch {
    // Stores not yet on disk (Plan 02-01 in isolation, before 02-04). Silent no-op.
  }
}

/** Read the persisted session and null it out if expired. */
function loadInitialSession(): AuthSession | null {
  const s = safeGet<AuthSession | null>(
    SESSION_KEY,
    sessionSchema.nullable(),
    STORE_VERSION,
    null,
  )
  if (!s) return null
  if (s.expiresAt < Date.now()) return null
  return s
}

/** Build a fresh AuthSession with `expiresAt = now + SESSION_DURATION_MS`. */
function newSession(userId: string): AuthSession {
  const now = Date.now()
  return {
    userId,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    token: crypto.randomUUID(),
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: loadInitialSession(),

  async signUp({ email, password, displayName }) {
    try {
      const user = await useUsersStore
        .getState()
        .register({ email, password, displayName })
      // Clear any guest data BEFORE setting the new session.
      await clearGuestData()
      const session = newSession(user.id)
      set({ session })
      safeSet(SESSION_KEY, session, STORE_VERSION)
      return { ok: true, userId: user.id }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed"
      return { ok: false, error: msg }
    }
  },

  async signIn(email, password) {
    const user = useUsersStore.getState().findByEmail(email)
    // CRITICAL: never reveal whether the email exists. Both branches use the same
    // generic message string. Verified by tests A3a + A3b.
    if (!user) return { ok: false, error: GENERIC_SIGNIN_ERROR }
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return { ok: false, error: GENERIC_SIGNIN_ERROR }
    // Clear any guest data BEFORE setting the new session.
    await clearGuestData()
    const session = newSession(user.id)
    set({ session })
    safeSet(SESSION_KEY, session, STORE_VERSION)
    return { ok: true, userId: user.id }
  },

  signOut() {
    set({ session: null })
    safeRemove(SESSION_KEY)
  },

  continueAsGuest() {
    const session = newSession(GUEST_USER_ID)
    set({ session })
    safeSet(SESSION_KEY, session, STORE_VERSION)
  },

  touchSession() {
    const s = get().session
    if (!s) return
    const now = Date.now()
    if (s.expiresAt < now) {
      set({ session: null })
      safeRemove(SESSION_KEY)
      return
    }
    const remaining = s.expiresAt - now
    if (remaining < SESSION_REFRESH_THRESHOLD_MS) {
      const refreshed: AuthSession = { ...s, expiresAt: now + SESSION_DURATION_MS }
      set({ session: refreshed })
      safeSet(SESSION_KEY, refreshed, STORE_VERSION)
    }
  },

  isAuthenticated() {
    const s = get().session
    return !!s && s.expiresAt > Date.now()
  },

  currentUserId() {
    const s = get().session
    if (!s || s.expiresAt < Date.now()) return null
    return s.userId
  },

  completeOnboarding(interests, selectedTools) {
    const userId = get().currentUserId()
    if (!userId || userId === GUEST_USER_ID) return
    useUsersStore.getState().updateUser(userId, { interests, selectedTools })
  },
}))
