// src/lib/crypto.ts
// Phase 2 / Plan 02-01 — Web Crypto password helpers.
//
// Salted SHA-256 hashing for the v1 mock auth. Per CONTEXT.md:
//   "Password storage: hash via Web Crypto API (SHA-256 with per-user random salt).
//    Not production-grade but materially better than plaintext for a demo."
//
// No npm dependency — Web Crypto is available globally in Node 20+ and in jsdom
// (Vitest's test env). Both `crypto.subtle.digest` and `crypto.getRandomValues`
// are reachable as `globalThis.crypto` on every supported runtime.

import type { PasswordHash } from "@/types"

export type { PasswordHash } from "@/types"

/** Convert a Uint8Array to a 64-char (per 32 bytes) lowercase hex string. */
function bytesToHex(bytes: Uint8Array): string {
  let s = ""
  for (let i = 0; i < bytes.length; i++) {
    const v = bytes[i] ?? 0
    s += v.toString(16).padStart(2, "0")
  }
  return s
}

/** Convert a hex string back to a Uint8Array. Caller is responsible for valid hex. */
function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

/**
 * SHA-256 of (saltBytes || plaintextBytes), returned as 64-char lowercase hex.
 * Concatenation order MUST match between hash and verify — salt first, then plaintext.
 */
async function sha256(saltBytes: Uint8Array, plaintext: string): Promise<string> {
  const enc = new TextEncoder()
  const ptBytes = enc.encode(plaintext)
  const buf = new Uint8Array(saltBytes.length + ptBytes.length)
  buf.set(saltBytes, 0)
  buf.set(ptBytes, saltBytes.length)
  const digest = await crypto.subtle.digest("SHA-256", buf)
  return bytesToHex(new Uint8Array(digest))
}

/**
 * Hash a plaintext password with a fresh random 32-byte salt.
 * Returns `{saltHex, hashHex}` — both 64-char lowercase hex.
 *
 * Two calls to `hashPassword(plaintext)` with the same plaintext yield DIFFERENT
 * `saltHex` values (random salt per call) — a property `verifyPassword` relies on
 * for security parity with real bcrypt-style hashes.
 */
export async function hashPassword(plaintext: string): Promise<PasswordHash> {
  const salt = new Uint8Array(32)
  crypto.getRandomValues(salt)
  const saltHex = bytesToHex(salt)
  const hashHex = await sha256(salt, plaintext)
  return { saltHex, hashHex }
}

/**
 * Verify a plaintext password against a stored `{saltHex, hashHex}` record.
 *
 * Returns true iff `SHA-256(record.saltHex || plaintext) === record.hashHex`.
 * Returns false on:
 *  - wrong plaintext
 *  - tampered saltHex (different salt produces different hash)
 *  - record from a different `hashPassword(...)` call (different salt)
 */
export async function verifyPassword(
  plaintext: string,
  record: PasswordHash,
): Promise<boolean> {
  const saltBytes = hexToBytes(record.saltHex)
  const candidate = await sha256(saltBytes, plaintext)
  return candidate === record.hashHex
}
