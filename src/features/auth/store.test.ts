// src/features/auth/store.test.ts
// Phase 2 / Plan 02-01 — Behavioral tests for usersStore + authStore.
//
// Strategy: each test re-imports the store module via `vi.resetModules()` so
// `loadInitialSession()` reads from the freshly-cleared localStorage. Without
// this, store module-init runs once for the whole test file and all tests
// share the same in-memory state.

import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
  GUEST_USER_ID,
  GENERIC_SIGNIN_ERROR,
} from "./types"

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

// ────────────────────────────────────────────────────────────────────────
// usersStore (registry)
// ────────────────────────────────────────────────────────────────────────

describe("useUsersStore", () => {
  it("U1: register creates a user with hashed password and persists", async () => {
    const { useUsersStore } = await import("./store")
    const u = await useUsersStore.getState().register({
      email: "alice@bu.edu",
      password: "hunter2x",
      displayName: "Alice",
    })
    expect(u.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(u.email).toBe("alice@bu.edu")
    expect(u.displayName).toBe("Alice")
    expect(u.passwordHash.saltHex).toMatch(/^[0-9a-f]{64}$/)
    expect(u.passwordHash.hashHex).toMatch(/^[0-9a-f]{64}$/)
    // Persisted under the canonical key.
    const raw = localStorage.getItem("aitools:users:registry")
    expect(raw).not.toBeNull()
    expect(raw).toContain(u.id)
  })

  it("U2: register throws if email already exists (case-insensitive)", async () => {
    const { useUsersStore } = await import("./store")
    await useUsersStore.getState().register({
      email: "alice@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    await expect(
      useUsersStore.getState().register({
        email: "ALICE@BU.EDU", // different case — should still collide
        password: "x12345678",
        displayName: "B",
      }),
    ).rejects.toThrow(/already exists/i)
  })

  it("U3: findByEmail returns user on case-insensitive match (or undefined)", async () => {
    const { useUsersStore } = await import("./store")
    await useUsersStore.getState().register({
      email: "Alice@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    expect(useUsersStore.getState().findByEmail("alice@bu.edu")?.email).toBe("Alice@bu.edu")
    expect(useUsersStore.getState().findByEmail("ALICE@BU.EDU")?.email).toBe("Alice@bu.edu")
    expect(useUsersStore.getState().findByEmail("nobody@bu.edu")).toBeUndefined()
  })

  it("U4: findById returns user or undefined", async () => {
    const { useUsersStore } = await import("./store")
    const u = await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    expect(useUsersStore.getState().findById(u.id)?.id).toBe(u.id)
    expect(useUsersStore.getState().findById("not-an-id")).toBeUndefined()
  })

  it("U5: updateUser patches the record and persists", async () => {
    const { useUsersStore } = await import("./store")
    const u = await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    const updated = useUsersStore
      .getState()
      .updateUser(u.id, { interests: ["coding"], selectedTools: ["claude"] })
    expect(updated?.interests).toEqual(["coding"])
    expect(updated?.selectedTools).toEqual(["claude"])
    // Persisted.
    const raw = localStorage.getItem("aitools:users:registry")
    expect(raw).toContain('"interests":["coding"]')
    expect(raw).toContain('"selectedTools":["claude"]')
  })
})

// ────────────────────────────────────────────────────────────────────────
// authStore (session + sign-in/up/out + guest + onboarding + guest-clear)
// ────────────────────────────────────────────────────────────────────────

describe("useAuthStore", () => {
  it("A1: signUp creates a session with ~30-day expiry and isAuthenticated()=true", async () => {
    const { useAuthStore } = await import("./store")
    const before = Date.now()
    const r = await useAuthStore
      .getState()
      .signUp({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const s = useAuthStore.getState().session
    expect(s).not.toBeNull()
    if (!s) return
    expect(s.userId).toBe(r.userId)
    // Expiry is roughly 30d from now (within 60s tolerance).
    const expectedExpiry = before + SESSION_DURATION_MS
    expect(Math.abs(s.expiresAt - expectedExpiry)).toBeLessThan(60_000)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it("A2: signIn with valid credentials returns ok and sets session", async () => {
    const { useUsersStore, useAuthStore } = await import("./store")
    await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    const r = await useAuthStore.getState().signIn("a@bu.edu", "hunter2x")
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(useAuthStore.getState().session?.userId).toBe(r.userId)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it("A3a: signIn returns generic error for unknown email", async () => {
    const { useAuthStore } = await import("./store")
    const r = await useAuthStore.getState().signIn("nobody@bu.edu", "whatever")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe(GENERIC_SIGNIN_ERROR)
  })

  it("A3b: signIn returns the SAME generic error for wrong password (no account-existence leak)", async () => {
    const { useUsersStore, useAuthStore } = await import("./store")
    await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    const r = await useAuthStore.getState().signIn("a@bu.edu", "wrong-password")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe(GENERIC_SIGNIN_ERROR)
  })

  it("A4: signOut clears the session but leaves users registry intact", async () => {
    const { useUsersStore, useAuthStore } = await import("./store")
    await useAuthStore
      .getState()
      .signUp({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
    expect(useAuthStore.getState().session).not.toBeNull()
    expect(useUsersStore.getState().users.length).toBe(1)
    useAuthStore.getState().signOut()
    expect(useAuthStore.getState().session).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
    // Registry still has the user.
    expect(useUsersStore.getState().users.length).toBe(1)
  })

  it("A5: continueAsGuest sets a guest session with userId='guest' and 30-day expiry", async () => {
    const { useAuthStore } = await import("./store")
    useAuthStore.getState().continueAsGuest()
    const s = useAuthStore.getState().session
    expect(s?.userId).toBe(GUEST_USER_ID)
    expect(s).not.toBeNull()
    if (!s) return
    expect(s.expiresAt - Date.now()).toBeGreaterThan(SESSION_DURATION_MS - 60_000)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it("A6: continueAsGuest after real sign-in REPLACES the session (no merge)", async () => {
    const { useAuthStore } = await import("./store")
    const r = await useAuthStore
      .getState()
      .signUp({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
    expect(r.ok).toBe(true)
    const realUserId = useAuthStore.getState().session?.userId
    expect(realUserId).not.toBe(GUEST_USER_ID)
    useAuthStore.getState().continueAsGuest()
    expect(useAuthStore.getState().session?.userId).toBe(GUEST_USER_ID)
  })

  it("A7a: touchSession does NOT change expiry when remaining > 25 days (just-issued session)", async () => {
    const { useAuthStore } = await import("./store")
    useAuthStore.getState().continueAsGuest() // fresh 30d session
    const before = useAuthStore.getState().session?.expiresAt
    useAuthStore.getState().touchSession()
    const after = useAuthStore.getState().session?.expiresAt
    expect(after).toBe(before)
  })

  it("A7b: touchSession refreshes expiry when remaining < 25 days", async () => {
    // Pre-seed an envelope with 20 days remaining BEFORE importing the store
    // so loadInitialSession() picks it up at module init.
    const now = Date.now()
    const twentyDaysOut = now + 20 * 24 * 60 * 60 * 1000
    const seeded = {
      version: 1,
      data: { userId: "u-old", issuedAt: now - 10 * 24 * 60 * 60 * 1000, expiresAt: twentyDaysOut, token: "t" },
    }
    localStorage.setItem("aitools:auth:session", JSON.stringify(seeded))
    // Import AFTER seeding so loadInitialSession reads our value at module init.
    const { useAuthStore: store } = await import("./store")
    expect(store.getState().session?.expiresAt).toBe(twentyDaysOut)
    store.getState().touchSession()
    const refreshed = store.getState().session?.expiresAt ?? 0
    // Should now be ~now + 30d (within 60s tolerance).
    expect(Math.abs(refreshed - (Date.now() + SESSION_DURATION_MS))).toBeLessThan(60_000)
    expect(refreshed).toBeGreaterThan(twentyDaysOut)
    // Sanity: the refresh-threshold constant is the gate.
    expect(SESSION_REFRESH_THRESHOLD_MS).toBe(25 * 24 * 60 * 60 * 1000)
  })

  it("A7c: touchSession clears session if expiresAt has passed", async () => {
    const expired = {
      version: 1,
      data: { userId: "u-old", issuedAt: 0, expiresAt: 1000, token: "t" },
    }
    localStorage.setItem("aitools:auth:session", JSON.stringify(expired))
    vi.resetModules()
    const { useAuthStore } = await import("./store")
    // loadInitialSession already nulls expired sessions. Force-set to test the touchSession path:
    // we synthesize an expired session in memory.
    useAuthStore.setState({
      session: { userId: "u", issuedAt: 0, expiresAt: 1000, token: "t" },
    })
    useAuthStore.getState().touchSession()
    expect(useAuthStore.getState().session).toBeNull()
  })

  it("A8: rehydrate clears session if persisted expiresAt < now", async () => {
    const expired = {
      version: 1,
      data: { userId: "u-old", issuedAt: 0, expiresAt: 1000, token: "t" },
    }
    localStorage.setItem("aitools:auth:session", JSON.stringify(expired))
    vi.resetModules()
    const { useAuthStore } = await import("./store")
    expect(useAuthStore.getState().session).toBeNull()
  })

  it("A9: signUp also writes the new user to useUsersStore (auto-login)", async () => {
    const { useAuthStore, useUsersStore } = await import("./store")
    const r = await useAuthStore
      .getState()
      .signUp({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(useUsersStore.getState().findById(r.userId)).toBeDefined()
    expect(useAuthStore.getState().session?.userId).toBe(r.userId)
  })

  it("A10: persistence flows ONLY through aitools:users:registry and aitools:auth:session", async () => {
    // The test setup replaces localStorage with a Map-backed mock object.
    // Spy directly on its `setItem` (Storage.prototype spying does not apply to the mock).
    const setSpy = vi.spyOn(localStorage, "setItem")
    const { useAuthStore } = await import("./store")
    await useAuthStore
      .getState()
      .signUp({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
    const writtenKeys = new Set(setSpy.mock.calls.map((c) => c[0]))
    setSpy.mockRestore()
    // Strict subset of the canonical pair.
    for (const k of writtenKeys) {
      expect(["aitools:users:registry", "aitools:auth:session"]).toContain(k)
    }
    expect(writtenKeys.has("aitools:users:registry")).toBe(true)
    expect(writtenKeys.has("aitools:auth:session")).toBe(true)
  })

  // A11/A12 — guest-clear-on-signin/signup. Un-skipped in Plan 02-04 once the
  // four non-auth stores shipped clearByUser actions. The dynamic-import path
  // through storePath() in src/features/auth/store.ts now resolves a real
  // module, and clearGuestData() in authStore drains the guest entries from
  // every non-auth store before issuing the new real-user session.
  it("A11: clears guest data on real sign-in", async () => {
    const toolsPath = ["@", "features", "tools", "store"].join("/")
    const { useUsersStore, useAuthStore } = await import("./store")
    const { useFavoritesStore } = await import(/* @vite-ignore */ toolsPath)
    useFavoritesStore.getState().toggle("guest", "claude")
    expect(useFavoritesStore.getState().list("guest")).toEqual(["claude"])
    await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    const r = await useAuthStore.getState().signIn("a@bu.edu", "hunter2x")
    expect(r.ok).toBe(true)
    expect(useFavoritesStore.getState().list("guest")).toEqual([])
  })

  it("A12: clears guest data on signUp auto-login", async () => {
    const toolsPath = ["@", "features", "tools", "store"].join("/")
    const { useAuthStore } = await import("./store")
    const { useFavoritesStore } = await import(/* @vite-ignore */ toolsPath)
    useFavoritesStore.getState().toggle("guest", "chatgpt")
    const r = await useAuthStore
      .getState()
      .signUp({ email: "b@bu.edu", password: "hunter2x", displayName: "B" })
    expect(r.ok).toBe(true)
    expect(useFavoritesStore.getState().list("guest")).toEqual([])
  })

  it("A13a: completeOnboarding writes interests + selectedTools to current user", async () => {
    const { useAuthStore, useUsersStore } = await import("./store")
    const r = await useAuthStore
      .getState()
      .signUp({ email: "c@bu.edu", password: "hunter2x", displayName: "C" })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    useAuthStore.getState().completeOnboarding(["writing", "coding"], ["claude", "chatgpt"])
    const u = useUsersStore.getState().findById(r.userId)
    expect(u?.interests).toEqual(["writing", "coding"])
    expect(u?.selectedTools).toEqual(["claude", "chatgpt"])
  })

  it("A13b: completeOnboarding is a no-op for guest sessions (does not throw)", async () => {
    const { useAuthStore } = await import("./store")
    useAuthStore.getState().continueAsGuest()
    expect(() =>
      useAuthStore.getState().completeOnboarding(["writing"], ["claude"]),
    ).not.toThrow()
  })

  it("A13c: completeOnboarding is a no-op for null sessions (does not throw)", async () => {
    const { useAuthStore } = await import("./store")
    expect(useAuthStore.getState().session).toBeNull()
    expect(() =>
      useAuthStore.getState().completeOnboarding(["writing"], ["claude"]),
    ).not.toThrow()
  })
})
