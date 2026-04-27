// src/lib/crypto.test.ts
// Phase 2 / Plan 02-01 — Web Crypto password helpers (TDD-RED first).
import { describe, it, expect } from "vitest"
import { hashPassword, verifyPassword } from "./crypto"

describe("hashPassword", () => {
  it("returns 64-char lowercase hex saltHex and hashHex", async () => {
    const r = await hashPassword("hunter2")
    expect(r.saltHex).toMatch(/^[0-9a-f]{64}$/)
    expect(r.hashHex).toMatch(/^[0-9a-f]{64}$/)
  })

  it("produces different saltHex on each call (random salt)", async () => {
    const a = await hashPassword("hunter2")
    const b = await hashPassword("hunter2")
    expect(a.saltHex).not.toBe(b.saltHex)
  })

  it("produces different hashHex on each call when salt differs (same plaintext)", async () => {
    const a = await hashPassword("hunter2")
    const b = await hashPassword("hunter2")
    // With different salts, same plaintext yields different hashes — proves salt is mixed in.
    expect(a.hashHex).not.toBe(b.hashHex)
  })
})

describe("verifyPassword", () => {
  it("returns true for matching plaintext", async () => {
    const r = await hashPassword("hunter2")
    expect(await verifyPassword("hunter2", r)).toBe(true)
  })

  it("returns false for non-matching plaintext", async () => {
    const r = await hashPassword("hunter2")
    expect(await verifyPassword("wrongpass", r)).toBe(false)
  })

  it("returns false when salt does not match the stored hash", async () => {
    const r = await hashPassword("hunter2")
    const tampered = { saltHex: "00".repeat(32), hashHex: r.hashHex }
    expect(await verifyPassword("hunter2", tampered)).toBe(false)
  })

  it("verifies independently across multiple records (different salts)", async () => {
    const r1 = await hashPassword("hunter2")
    const r2 = await hashPassword("hunter2")
    // Both verify against their own record.
    expect(await verifyPassword("hunter2", r1)).toBe(true)
    expect(await verifyPassword("hunter2", r2)).toBe(true)
    // Cross-mixing salt+hash from different records must fail.
    const mixed = { saltHex: r1.saltHex, hashHex: r2.hashHex }
    expect(await verifyPassword("hunter2", mixed)).toBe(false)
  })
})
