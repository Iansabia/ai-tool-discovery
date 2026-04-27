// src/lib/storage.test.ts
import { afterEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import {
  clearNamespace,
  safeGet,
  safeSet,
  storageKey,
  subscribeToKey,
} from "./storage"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("storageKey", () => {
  it("builds aitools:<domain>:<scope> for a given domain and scope", () => {
    expect(storageKey("auth", "session")).toBe("aitools:auth:session")
  })

  it("defaults scope to 'global' when omitted", () => {
    expect(storageKey("theme")).toBe("aitools:theme:global")
  })

  it("supports user-scoped keys", () => {
    expect(storageKey("favorites", "user_abc123")).toBe(
      "aitools:favorites:user_abc123",
    )
  })
})

describe("safeGet", () => {
  const schema = z.object({ count: z.number() })
  const fallback = { count: 0 }
  const KEY = "aitools:test:counter"
  const VERSION = 1

  it("returns fallback when key is missing", () => {
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })

  it("returns fallback on malformed JSON (corrupt write)", () => {
    localStorage.setItem(KEY, "{not valid json")
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })

  it("returns fallback when envelope shape mismatches (no version field)", () => {
    localStorage.setItem(KEY, JSON.stringify({ data: { count: 5 } }))
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })

  it("returns fallback when envelope shape mismatches (no data field)", () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 1 }))
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })

  it("returns fallback on version mismatch", () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 0, data: { count: 5 } }))
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })

  it("returns fallback when data fails Zod schema validation", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: 1, data: { count: "not a number" } }),
    )
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })

  it("returns parsed data when version + schema both pass", () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, data: { count: 42 } }))
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual({ count: 42 })
  })

  it("never throws — wraps unexpected errors in console.warn + fallback", () => {
    // Force getItem to throw by stubbing
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("synthetic")
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    })
    expect(() => safeGet(KEY, schema, VERSION, fallback)).not.toThrow()
    expect(safeGet(KEY, schema, VERSION, fallback)).toEqual(fallback)
  })
})

describe("safeSet", () => {
  const KEY = "aitools:test:counter"

  it("writes a {version, data} envelope (not the raw value)", () => {
    safeSet(KEY, { count: 7 }, 2)
    const raw = localStorage.getItem(KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as { version: number; data: { count: number } }
    expect(parsed.version).toBe(2)
    expect(parsed.data).toEqual({ count: 7 })
  })

  it("dispatches a synthetic StorageEvent on the same tab", () => {
    const events: StorageEvent[] = []
    const handler = (e: StorageEvent) => events.push(e)
    window.addEventListener("storage", handler)

    safeSet(KEY, { count: 99 }, 1)

    window.removeEventListener("storage", handler)
    expect(events).toHaveLength(1)
    expect(events[0]?.key).toBe(KEY)
    expect(events[0]?.newValue).toContain('"count":99')
  })

  it("does not throw on QuotaExceededError — logs and continues", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        const e = new Error("QuotaExceededError")
        e.name = "QuotaExceededError"
        throw e
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    })
    expect(() => safeSet(KEY, { count: 1 }, 1)).not.toThrow()
  })
})

describe("subscribeToKey", () => {
  const KEY = "aitools:test:watched"

  it("fires when a storage event for the watched key arrives", () => {
    const cb = vi.fn()
    const unsubscribe = subscribeToKey(KEY, cb)

    // Dispatch synthetic event (mirrors what safeSet does for same-tab fan-out)
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: KEY,
        oldValue: null,
        newValue: '{"version":1,"data":{"x":1}}',
      }),
    )

    unsubscribe()
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith('{"version":1,"data":{"x":1}}')
  })

  it("does NOT fire for storage events on other keys", () => {
    const cb = vi.fn()
    const unsubscribe = subscribeToKey(KEY, cb)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "aitools:other:key",
        newValue: "x",
      }),
    )

    unsubscribe()
    expect(cb).not.toHaveBeenCalled()
  })

  it("unsubscribe removes the listener", () => {
    const cb = vi.fn()
    const unsubscribe = subscribeToKey(KEY, cb)
    unsubscribe()

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: KEY,
        newValue: "x",
      }),
    )

    expect(cb).not.toHaveBeenCalled()
  })

  it("integration: safeSet + subscribeToKey covers same-tab updates", () => {
    const cb = vi.fn()
    const unsubscribe = subscribeToKey(KEY, cb)
    safeSet(KEY, { foo: "bar" }, 1)
    unsubscribe()
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

describe("clearNamespace", () => {
  it("removes only keys with the aitools: prefix", () => {
    localStorage.setItem("aitools:auth:session", "x")
    localStorage.setItem("aitools:favorites:global", "y")
    localStorage.setItem("unrelated:key", "z")

    clearNamespace()

    expect(localStorage.getItem("aitools:auth:session")).toBeNull()
    expect(localStorage.getItem("aitools:favorites:global")).toBeNull()
    expect(localStorage.getItem("unrelated:key")).toBe("z")
  })

  it("is a no-op when nothing is in the namespace", () => {
    expect(() => clearNamespace()).not.toThrow()
  })
})
