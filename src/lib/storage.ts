// src/lib/storage.ts
// Phase 1 / Plan 01-03 — the ONLY module in the codebase that touches localStorage.
// Every persisted store (Phase 2) and every settings consumer goes through here.
//
// Guarantees:
//   - Keys are namespaced as `aitools:<domain>:<scope>` so a single prefix wipe is possible.
//   - Reads validate a `{version, data}` envelope via Zod. Fallback on any failure mode.
//   - Writes dispatch a synthetic StorageEvent on the same tab (the native event only fires
//     on OTHER tabs; same-tab consumers must be notified manually).
//   - subscribeToKey covers both same-tab and cross-tab updates.

import { z, type ZodType } from "zod"

const NAMESPACE = "aitools" as const

/**
 * Build a localStorage key in the canonical format `aitools:<domain>:<scope>`.
 * Examples:
 *   storageKey("auth", "session")       -> "aitools:auth:session"
 *   storageKey("favorites", "user_abc") -> "aitools:favorites:user_abc"
 *   storageKey("theme")                 -> "aitools:theme:global"
 */
export function storageKey(domain: string, scope: string = "global"): string {
  return `${NAMESPACE}:${domain}:${scope}`
}

/** Generic envelope every persisted value wraps in. Bump version on shape change. */
export interface StorageEnvelope<T> {
  version: number
  data: T
}

const buildEnvelopeSchema = <T>(dataSchema: ZodType<T>) =>
  z.object({
    version: z.number().int().nonnegative(),
    data: dataSchema,
  })

/**
 * Read a value from localStorage, validating envelope shape, version, and data schema.
 * Returns `fallback` on any failure: missing key, malformed JSON, schema mismatch, version
 * mismatch, or unexpected error. NEVER throws.
 */
export function safeGet<T>(
  key: string,
  schema: ZodType<T>,
  expectedVersion: number,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    const result = buildEnvelopeSchema(schema).safeParse(parsed)
    if (!result.success) {
      console.warn(`[storage] schema mismatch on ${key}, falling back`, result.error)
      return fallback
    }
    if (result.data.version !== expectedVersion) {
      console.warn(
        `[storage] version mismatch on ${key} (got ${result.data.version}, expected ${expectedVersion}), falling back`,
      )
      return fallback
    }
    return result.data.data
  } catch (err) {
    console.warn(`[storage] read failed for ${key}`, err)
    return fallback
  }
}

/**
 * Write a value to localStorage wrapped in `{version, data}`. Dispatches a synthetic
 * `storage` event on the same tab so subscribers update immediately (the native event
 * fires only on OTHER tabs).
 *
 * Catches QuotaExceededError and other write failures and logs a warning rather than
 * throwing — call sites can layer toast feedback in Phase 2.
 */
export function safeSet<T>(key: string, value: T, version: number): void {
  try {
    const envelope: StorageEnvelope<T> = { version, data: value }
    const serialized = JSON.stringify(envelope)
    const oldValue = localStorage.getItem(key)
    localStorage.setItem(key, serialized)
    // Same-tab fan-out: the native `storage` event fires only on OTHER tabs.
    // NOTE: We intentionally omit `storageArea` from the synthetic event because
    // jsdom + test mocks of Storage don't satisfy the real `Storage` interface
    // and constructing a StorageEvent with a non-Storage storageArea throws.
    // Subscribers key off `event.key` only; storageArea is informational.
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        oldValue,
        newValue: serialized,
      }),
    )
  } catch (err) {
    console.warn(`[storage] write failed for ${key}`, err)
  }
}

/**
 * Subscribe to changes on a single localStorage key (same-tab and cross-tab).
 * Returns an unsubscribe function.
 *
 * Use this for non-Zustand consumers; Zustand stores can use the persist middleware's
 * own rehydration hooks (Phase 2 will wire that).
 */
export function subscribeToKey(
  key: string,
  cb: (newValue: string | null) => void,
): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === key) cb(e.newValue)
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

/**
 * Wipe every key in the `aitools:` namespace. Useful for the Phase 5 "Reset App" button
 * and for test cleanup. Leaves keys outside the namespace untouched.
 */
export function clearNamespace(): void {
  const toDelete: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(`${NAMESPACE}:`)) toDelete.push(k)
  }
  for (const k of toDelete) localStorage.removeItem(k)
}
