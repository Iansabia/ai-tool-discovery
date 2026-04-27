// src/features/rankings/store.test.ts
// Phase 2 / Plan 02-04 — upvoteStore behavioral tests.
//
// Vote state machine: setVote(userId, slug, next: 'up' | 'down')
//   - if existing vote === next, set to 'none' (toggle off)
//   - else, set to next (switch / first vote)
//
// All 6 transitions are exhaustively tested by name.

import { describe, it, expect, beforeEach, vi } from "vitest"

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe("useUpvoteStore — VOTE STATE MACHINE", () => {
  it("V1: none → up", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("up")
  })

  it("V2: none → down", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "down")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("down")
  })

  it("V3: up → none (clicking same vote toggles off)", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("none")
  })

  it("V4: up → down (opposite vote switches)", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    useUpvoteStore.getState().setVote("u1", "claude", "down")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("down")
  })

  it("V5: down → none (clicking same vote toggles off)", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "down")
    useUpvoteStore.getState().setVote("u1", "claude", "down")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("none")
  })

  it("V6: down → up (opposite vote switches)", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "down")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("up")
  })
})

describe("useUpvoteStore — isolation", () => {
  it("V7: per-user — u1 vote does not affect u2", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    expect(useUpvoteStore.getState().getVote("u2", "claude")).toBe("none")
  })

  it("V8: per-tool — u1's vote on claude does not affect u1's vote on chatgpt", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    expect(useUpvoteStore.getState().getVote("u1", "chatgpt")).toBe("none")
  })
})

describe("useUpvoteStore — netCount", () => {
  it("V9: netCount sums up=+1, down=-1, none=0 across all users", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    useUpvoteStore.getState().setVote("u2", "claude", "up")
    useUpvoteStore.getState().setVote("u3", "claude", "down")
    expect(useUpvoteStore.getState().netCount("claude")).toBe(1) // +1 +1 -1
  })

  it("V9b: netCount returns 0 for unknown slug", async () => {
    const { useUpvoteStore } = await import("./store")
    expect(useUpvoteStore.getState().netCount("never-voted")).toBe(0)
  })
})

describe("useUpvoteStore — persistence", () => {
  it("V10: persists envelope to aitools:upvotes:global", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    const raw = localStorage.getItem("aitools:upvotes:global")
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.version).toBe(1)
    expect(parsed.data.u1.claude).toBe("up")
  })

  it("V10b: rehydrates from localStorage", async () => {
    localStorage.setItem(
      "aitools:upvotes:global",
      JSON.stringify({ version: 1, data: { u1: { claude: "down" } } }),
    )
    const { useUpvoteStore } = await import("./store")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("down")
  })
})

describe("useUpvoteStore — rapid-click safety (functional updater)", () => {
  it("V11: 3 synchronous setVote calls land in a deterministic state", async () => {
    const { useUpvoteStore } = await import("./store")
    // Simulate rapid clicks: up, up, up — should be up → none → up
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("up")
  })
})

describe("useUpvoteStore — clearByUser (BLOCKER 2 wire-completion)", () => {
  it("V12: clearByUser removes all votes for the given userId and preserves others", async () => {
    const { useUpvoteStore } = await import("./store")
    useUpvoteStore.getState().setVote("guest", "claude", "up")
    useUpvoteStore.getState().setVote("guest", "chatgpt", "down")
    useUpvoteStore.getState().setVote("u1", "claude", "up")
    useUpvoteStore.getState().clearByUser("guest")
    expect(useUpvoteStore.getState().getVote("guest", "claude")).toBe("none")
    expect(useUpvoteStore.getState().getVote("guest", "chatgpt")).toBe("none")
    expect(useUpvoteStore.getState().getVote("u1", "claude")).toBe("up")
    // netCount reflects the cleared guest votes
    expect(useUpvoteStore.getState().netCount("claude")).toBe(1) // u1 only
  })

  it("V12b: clearByUser is idempotent", async () => {
    const { useUpvoteStore } = await import("./store")
    expect(() =>
      useUpvoteStore.getState().clearByUser("never-existed"),
    ).not.toThrow()
  })
})
