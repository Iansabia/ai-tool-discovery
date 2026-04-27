// src/features/submit/store.test.ts
// Phase 2 / Plan 02-04 — submissionStore behavioral tests.

import { describe, it, expect, beforeEach, vi } from "vitest"

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe("useSubmissionStore", () => {
  it("S1: starts empty for any user", async () => {
    const { useSubmissionStore } = await import("./store")
    expect(useSubmissionStore.getState().listByUser("u1")).toEqual([])
  })

  it("S2: add appends a submission with auto id, status='pending', submittedAt", async () => {
    const { useSubmissionStore } = await import("./store")
    const s = useSubmissionStore.getState().add({
      submitterId: "u1",
      name: "NewTool",
      url: "https://newtool.example",
      category: "writing",
      description: "Cool",
      tags: ["beta"],
    })
    expect(s.id).toMatch(/.+/)
    expect(s.status).toBe("pending")
    expect(s.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(useSubmissionStore.getState().listByUser("u1")).toHaveLength(1)
  })

  it("S3: per-user isolation", async () => {
    const { useSubmissionStore } = await import("./store")
    useSubmissionStore.getState().add({
      submitterId: "u1",
      name: "T",
      url: "https://t.example",
      category: "writing",
      description: "D",
      tags: [],
    })
    expect(useSubmissionStore.getState().listByUser("u2")).toEqual([])
  })

  it("S4: listAll returns every submission across users", async () => {
    const { useSubmissionStore } = await import("./store")
    useSubmissionStore.getState().add({
      submitterId: "u1",
      name: "A",
      url: "https://a.example",
      category: "writing",
      description: "",
      tags: [],
    })
    useSubmissionStore.getState().add({
      submitterId: "u2",
      name: "B",
      url: "https://b.example",
      category: "coding",
      description: "",
      tags: [],
    })
    expect(useSubmissionStore.getState().listAll()).toHaveLength(2)
  })

  it("S5: persists envelope at aitools:submissions:global", async () => {
    const { useSubmissionStore } = await import("./store")
    useSubmissionStore.getState().add({
      submitterId: "u1",
      name: "T",
      url: "https://t.example",
      category: "writing",
      description: "",
      tags: [],
    })
    const raw = localStorage.getItem("aitools:submissions:global")
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.version).toBe(1)
    expect(parsed.data.u1).toHaveLength(1)
  })

  // BLOCKER 2 wire-completion: clearByUser
  it("S6: clearByUser removes ALL submissions for the given userId; listAll reflects the change", async () => {
    const { useSubmissionStore } = await import("./store")
    useSubmissionStore.getState().add({
      submitterId: "guest",
      name: "G1",
      url: "https://g1.example",
      category: "writing",
      description: "",
      tags: [],
    })
    useSubmissionStore.getState().add({
      submitterId: "guest",
      name: "G2",
      url: "https://g2.example",
      category: "coding",
      description: "",
      tags: [],
    })
    useSubmissionStore.getState().add({
      submitterId: "u1",
      name: "U1",
      url: "https://u1.example",
      category: "writing",
      description: "",
      tags: [],
    })
    useSubmissionStore.getState().clearByUser("guest")
    expect(useSubmissionStore.getState().listByUser("guest")).toEqual([])
    expect(useSubmissionStore.getState().listByUser("u1")).toHaveLength(1)
    expect(useSubmissionStore.getState().listAll()).toHaveLength(1)
  })

  it("S7: clearByUser is idempotent", async () => {
    const { useSubmissionStore } = await import("./store")
    expect(() =>
      useSubmissionStore.getState().clearByUser("never-existed"),
    ).not.toThrow()
  })
})
