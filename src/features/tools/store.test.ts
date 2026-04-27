// src/features/tools/store.test.ts
// Phase 2 / Plan 02-04 — favoritesStore behavioral tests.
//
// Strategy: re-import the store module via `vi.resetModules()` so the
// module-init `safeGet(...)` reads from the freshly-cleared localStorage.
// Without this, all tests would share the same in-memory state.

import { describe, it, expect, beforeEach, vi } from "vitest"

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe("useFavoritesStore", () => {
  it("F1: starts empty for any userId", async () => {
    const { useFavoritesStore } = await import("./store")
    expect(useFavoritesStore.getState().isFavorite("u1", "claude")).toBe(false)
    expect(useFavoritesStore.getState().list("u1")).toEqual([])
  })

  it("F2: toggle adds when absent", async () => {
    const { useFavoritesStore } = await import("./store")
    useFavoritesStore.getState().toggle("u1", "claude")
    expect(useFavoritesStore.getState().isFavorite("u1", "claude")).toBe(true)
    expect(useFavoritesStore.getState().list("u1")).toEqual(["claude"])
  })

  it("F3: toggle removes when present", async () => {
    const { useFavoritesStore } = await import("./store")
    useFavoritesStore.getState().toggle("u1", "claude")
    useFavoritesStore.getState().toggle("u1", "claude")
    expect(useFavoritesStore.getState().isFavorite("u1", "claude")).toBe(false)
    expect(useFavoritesStore.getState().list("u1")).toEqual([])
  })

  it("F4: per-user isolation — u1 favorite does not leak to u2", async () => {
    const { useFavoritesStore } = await import("./store")
    useFavoritesStore.getState().toggle("u1", "claude")
    expect(useFavoritesStore.getState().isFavorite("u2", "claude")).toBe(false)
    expect(useFavoritesStore.getState().list("u2")).toEqual([])
  })

  it("F5: preserves insertion order", async () => {
    const { useFavoritesStore } = await import("./store")
    useFavoritesStore.getState().toggle("u1", "claude")
    useFavoritesStore.getState().toggle("u1", "chatgpt")
    useFavoritesStore.getState().toggle("u1", "midjourney")
    expect(useFavoritesStore.getState().list("u1")).toEqual([
      "claude",
      "chatgpt",
      "midjourney",
    ])
  })

  it("F6: persists envelope to aitools:favorites:global", async () => {
    const { useFavoritesStore } = await import("./store")
    useFavoritesStore.getState().toggle("u1", "claude")
    const raw = localStorage.getItem("aitools:favorites:global")
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.version).toBe(1)
    expect(parsed.data.u1).toEqual(["claude"])
  })

  it("F7: rehydrates from localStorage", async () => {
    localStorage.setItem(
      "aitools:favorites:global",
      JSON.stringify({ version: 1, data: { u1: ["chatgpt"] } }),
    )
    const { useFavoritesStore } = await import("./store")
    expect(useFavoritesStore.getState().list("u1")).toEqual(["chatgpt"])
  })

  // BLOCKER 2 wire-completion: clearByUser
  it("F8: clearByUser removes all entries for the given userId and preserves others", async () => {
    const { useFavoritesStore } = await import("./store")
    useFavoritesStore.getState().toggle("guest", "claude")
    useFavoritesStore.getState().toggle("guest", "chatgpt")
    useFavoritesStore.getState().toggle("u1", "claude")
    useFavoritesStore.getState().clearByUser("guest")
    expect(useFavoritesStore.getState().list("guest")).toEqual([])
    expect(useFavoritesStore.getState().list("u1")).toEqual(["claude"])
    const parsed = JSON.parse(
      localStorage.getItem("aitools:favorites:global")!,
    )
    expect(parsed.data.guest).toBeUndefined()
    expect(parsed.data.u1).toEqual(["claude"])
  })

  it("F9: clearByUser is idempotent (no-op when userId never had data)", async () => {
    const { useFavoritesStore } = await import("./store")
    expect(() =>
      useFavoritesStore.getState().clearByUser("never-existed"),
    ).not.toThrow()
  })
})
