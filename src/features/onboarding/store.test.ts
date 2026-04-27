// src/features/onboarding/store.test.ts
// Phase 2 / Plan 02-03 — Locks the Set-based toggle semantics for the onboarding
// wizard navigation state. Pitfall 7: deselect MUST work; initial state MUST be empty.
import { describe, it, expect, beforeEach } from "vitest"
import { useOnboardingStore } from "./store"

beforeEach(() => {
  useOnboardingStore.getState().clear()
})

describe("useOnboardingStore", () => {
  it("starts with empty selections (no preselected items)", () => {
    const s = useOnboardingStore.getState()
    expect(s.interests.size).toBe(0)
    expect(s.tools.size).toBe(0)
  })

  it("toggleInterest adds slug to interests Set", () => {
    useOnboardingStore.getState().toggleInterest("writing")
    expect(useOnboardingStore.getState().interests.has("writing")).toBe(true)
  })

  it("toggleInterest is a real toggle (deselects on second click)", () => {
    useOnboardingStore.getState().toggleInterest("writing")
    useOnboardingStore.getState().toggleInterest("writing")
    expect(useOnboardingStore.getState().interests.has("writing")).toBe(false)
  })

  it("toggleTool adds and removes slugs symmetrically", () => {
    useOnboardingStore.getState().toggleTool("claude")
    useOnboardingStore.getState().toggleTool("chatgpt")
    expect(useOnboardingStore.getState().tools.size).toBe(2)
    useOnboardingStore.getState().toggleTool("claude")
    expect(useOnboardingStore.getState().tools.size).toBe(1)
    expect(useOnboardingStore.getState().tools.has("chatgpt")).toBe(true)
  })

  it("clear() resets both Sets to empty", () => {
    useOnboardingStore.getState().toggleInterest("writing")
    useOnboardingStore.getState().toggleTool("claude")
    useOnboardingStore.getState().clear()
    expect(useOnboardingStore.getState().interests.size).toBe(0)
    expect(useOnboardingStore.getState().tools.size).toBe(0)
  })

  it("each toggle produces a new Set reference (Zustand reactivity)", () => {
    const before = useOnboardingStore.getState().interests
    useOnboardingStore.getState().toggleInterest("writing")
    const after = useOnboardingStore.getState().interests
    expect(after).not.toBe(before)
  })
})
