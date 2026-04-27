// src/features/compare/store.test.ts
// Phase 3 / Plan 03-01 — useSavedComparisonsStore behavioral tests.
//
// Mirrors src/features/tools/store.test.ts strategy: re-import the module via
// vi.resetModules() so each test sees a fresh module-init safeGet() against a
// just-cleared localStorage.

import { describe, it, expect, beforeEach, vi } from "vitest"

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe("useSavedComparisonsStore", () => {
  it("SC1: list(userId) returns [] for any userId on a fresh store", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    expect(useSavedComparisonsStore.getState().list("u1")).toEqual([])
    expect(useSavedComparisonsStore.getState().list("guest")).toEqual([])
  })

  it("SC2: add(userId, a, b) adds the pair with savedAt ISO string", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    useSavedComparisonsStore.getState().add("u1", "claude", "chatgpt")
    const list = useSavedComparisonsStore.getState().list("u1")
    expect(list).toHaveLength(1)
    expect(list[0].a).toBe("chatgpt") // sorted ascending: chatgpt < claude
    expect(list[0].b).toBe("claude")
    expect(typeof list[0].savedAt).toBe("string")
    // ISO 8601 string parses cleanly
    expect(Number.isFinite(Date.parse(list[0].savedAt))).toBe(true)
  })

  it("SC3: add(userId, b, a) AFTER SC2 is a no-op (de-duplicated by sorted slug pair)", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    useSavedComparisonsStore.getState().add("u1", "claude", "chatgpt")
    useSavedComparisonsStore.getState().add("u1", "chatgpt", "claude") // reversed args
    const list = useSavedComparisonsStore.getState().list("u1")
    expect(list).toHaveLength(1)
  })

  it("SC4: add emits the pair in canonical order (sorted by slug ascending)", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    // Pass in reverse order — store should canonicalize
    useSavedComparisonsStore.getState().add("u1", "claude", "chatgpt")
    const list = useSavedComparisonsStore.getState().list("u1")
    expect(list[0].a < list[0].b).toBe(true)
    expect(list[0].a).toBe("chatgpt")
    expect(list[0].b).toBe("claude")
  })

  it("SC5: remove(userId, a, b) deletes the entry; list returns []", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    useSavedComparisonsStore.getState().add("u1", "claude", "chatgpt")
    useSavedComparisonsStore.getState().remove("u1", "claude", "chatgpt")
    expect(useSavedComparisonsStore.getState().list("u1")).toEqual([])
  })

  it("SC6: remove on an empty store is idempotent (no throw)", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    expect(() =>
      useSavedComparisonsStore.getState().remove("u1", "claude", "chatgpt"),
    ).not.toThrow()
    expect(useSavedComparisonsStore.getState().list("u1")).toEqual([])
  })

  it("SC7: clearByUser(userId) removes all entries for that user; preserves others", async () => {
    const { useSavedComparisonsStore } = await import("./store")
    useSavedComparisonsStore.getState().add("guest", "claude", "chatgpt")
    useSavedComparisonsStore.getState().add("guest", "midjourney", "dalle")
    useSavedComparisonsStore.getState().add("u1", "claude", "chatgpt")
    useSavedComparisonsStore.getState().clearByUser("guest")
    expect(useSavedComparisonsStore.getState().list("guest")).toEqual([])
    expect(useSavedComparisonsStore.getState().list("u1")).toHaveLength(1)
  })

  it("SC8: persistence round-trip — seed via safeSet, list returns the seeded pair", async () => {
    // Seed localStorage directly to mirror what a previous session would have written.
    localStorage.setItem(
      "aitools:saved-comparisons:global",
      JSON.stringify({
        version: 1,
        data: {
          u1: [
            { a: "chatgpt", b: "claude", savedAt: "2026-04-26T12:00:00.000Z" },
          ],
        },
      }),
    )
    const { useSavedComparisonsStore } = await import("./store")
    const list = useSavedComparisonsStore.getState().list("u1")
    expect(list).toHaveLength(1)
    expect(list[0].a).toBe("chatgpt")
    expect(list[0].b).toBe("claude")
    expect(list[0].savedAt).toBe("2026-04-26T12:00:00.000Z")
  })
})
