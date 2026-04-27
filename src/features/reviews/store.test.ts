// src/features/reviews/store.test.ts
// Phase 2 / Plan 02-04 — reviewStore behavioral tests.
//
// Reviews are keyed by tool slug (not by user) so all reviews show on a tool
// detail page. clearByUser scans every slug bucket and filters by userId.

import { describe, it, expect, beforeEach, vi } from "vitest"

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe("useReviewStore", () => {
  it("R1: starts empty for any tool slug", async () => {
    const { useReviewStore } = await import("./store")
    expect(useReviewStore.getState().listByTool("claude")).toEqual([])
  })

  it("R2: add appends a review with auto id + createdAt", async () => {
    const { useReviewStore } = await import("./store")
    const r = useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "u1",
      username: "Alice",
      rating: 5,
      title: "Great",
      body: "Love it",
    })
    expect(r.id).toMatch(/.+/)
    expect(r.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(useReviewStore.getState().listByTool("claude")).toHaveLength(1)
  })

  it("R3: throws on invalid rating (out of 1..5)", async () => {
    const { useReviewStore } = await import("./store")
    expect(() =>
      useReviewStore.getState().add({
        toolSlug: "claude",
        userId: "u1",
        username: "Alice",
        rating: 6,
        title: "T",
        body: "B",
      }),
    ).toThrow()
    expect(() =>
      useReviewStore.getState().add({
        toolSlug: "claude",
        userId: "u1",
        username: "Alice",
        rating: 0,
        title: "T",
        body: "B",
      }),
    ).toThrow()
  })

  it("R4: listByTool orders by createdAt desc (newest first)", async () => {
    const { useReviewStore } = await import("./store")
    const r1 = useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "u1",
      username: "A",
      rating: 5,
      title: "first",
      body: "1",
    })
    await new Promise((res) => setTimeout(res, 5))
    const r2 = useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "u1",
      username: "A",
      rating: 5,
      title: "second",
      body: "2",
    })
    const list = useReviewStore.getState().listByTool("claude")
    expect(list[0]?.id).toBe(r2.id)
    expect(list[1]?.id).toBe(r1.id)
  })

  it("R5: per-tool isolation", async () => {
    const { useReviewStore } = await import("./store")
    useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "u1",
      username: "A",
      rating: 5,
      title: "T",
      body: "B",
    })
    expect(useReviewStore.getState().listByTool("chatgpt")).toEqual([])
  })

  it("R6: persists envelope at aitools:reviews:global", async () => {
    const { useReviewStore } = await import("./store")
    useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "u1",
      username: "A",
      rating: 5,
      title: "T",
      body: "B",
    })
    const raw = localStorage.getItem("aitools:reviews:global")
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.version).toBe(1)
    expect(parsed.data.claude).toHaveLength(1)
  })

  // BLOCKER 2 wire-completion: clearByUser
  it("R7: clearByUser removes ALL reviews authored by that userId across every tool slug", async () => {
    const { useReviewStore } = await import("./store")
    useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "guest",
      username: "G",
      rating: 5,
      title: "T",
      body: "B",
    })
    useReviewStore.getState().add({
      toolSlug: "chatgpt",
      userId: "guest",
      username: "G",
      rating: 4,
      title: "T",
      body: "B",
    })
    useReviewStore.getState().add({
      toolSlug: "claude",
      userId: "u1",
      username: "A",
      rating: 3,
      title: "T",
      body: "B",
    })
    useReviewStore.getState().clearByUser("guest")
    expect(useReviewStore.getState().listByTool("claude")).toHaveLength(1)
    expect(useReviewStore.getState().listByTool("claude")[0]!.userId).toBe("u1")
    expect(useReviewStore.getState().listByTool("chatgpt")).toHaveLength(0)
  })

  it("R8: clearByUser is idempotent", async () => {
    const { useReviewStore } = await import("./store")
    expect(() =>
      useReviewStore.getState().clearByUser("never-existed"),
    ).not.toThrow()
  })
})
