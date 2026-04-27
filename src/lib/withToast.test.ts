// src/lib/withToast.test.ts
// Phase 2 / Plan 02-04 — withToast wrapper tests.

import { describe, it, expect, vi, beforeEach } from "vitest"
import { toast } from "sonner"
import { withToast } from "./withToast"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("withToast", () => {
  it("W1: calls toast.success after sync function returns", () => {
    const fn = vi.fn(() => 42)
    const wrapped = withToast(fn, { success: "ok" })
    expect(wrapped()).toBe(42)
    expect(toast.success).toHaveBeenCalledWith("ok")
  })

  it("W2: awaits async function and toasts after resolve", async () => {
    const fn = vi.fn(async () => "result")
    const wrapped = withToast(fn, { success: "ok" })
    const r = await wrapped()
    expect(r).toBe("result")
    expect(toast.success).toHaveBeenCalledWith("ok")
  })

  it("W3: calls toast.error when sync function throws and re-throws", () => {
    const fn = vi.fn(() => {
      throw new Error("boom")
    })
    const wrapped = withToast(fn, { success: "ok" })
    expect(() => wrapped()).toThrow("boom")
    expect(toast.error).toHaveBeenCalledWith("boom")
  })

  it("W4: calls toast.error when async function rejects and re-rejects", async () => {
    const fn = vi.fn(async () => {
      throw new Error("nope")
    })
    const wrapped = withToast(fn, { success: "ok" })
    await expect(wrapped()).rejects.toThrow("nope")
    expect(toast.error).toHaveBeenCalledWith("nope")
  })

  it("W5: uses options.error string when provided (async)", async () => {
    const fn = vi.fn(async () => {
      throw new Error("boom")
    })
    const wrapped = withToast(fn, { success: "ok", error: "custom error" })
    await expect(wrapped()).rejects.toThrow()
    expect(toast.error).toHaveBeenCalledWith("custom error")
  })

  it("W6: falls back to 'Action failed' when error is not an Error and no options.error", async () => {
    const fn = vi.fn(async () => {
      throw "raw string"
    })
    const wrapped = withToast(fn, { success: "ok" })
    await expect(wrapped()).rejects.toBeDefined()
    expect(toast.error).toHaveBeenCalledWith("Action failed")
  })

  it("W7: preserves return value pass-through (sync)", () => {
    const fn = vi.fn((a: number, b: number) => a + b)
    const wrapped = withToast(fn, { success: "ok" })
    expect(wrapped(2, 3)).toBe(5)
  })
})
