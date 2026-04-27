// src/features/compare/store.ts
// Phase 3 / Plan 03-01 — useSavedComparisonsStore.
//
// Per-user list of saved tool comparisons. Each entry is a canonical pair
// (a < b ascending) so callers can pass slugs in any order and dedup works.
//
// Persists via the Phase 1 storage helper using the {version: 1, data: T}
// envelope, mirroring Plan 02-04's non-auth stores.
//
// KNOWN LIMITATION (documented for Phase 5): Plan 02-01's
// authStore.clearGuestData() enumerates four specific stores by hardcoded
// dynamic-import path (favorites, rankings, reviews, submit). This new store
// is NOT in that list, so guest→real-user transitions will leave saved
// comparisons under userId="guest" intact. Phase 5 hardening can extend
// clearGuestData() to enumerate this fifth store; out of scope here.

import { create } from "zustand"
import { z } from "zod"
import { storageKey, safeGet, safeSet } from "@/lib/storage"

const STORE_VERSION = 1
const KEY = storageKey("saved-comparisons", "global") // "aitools:saved-comparisons:global"

export interface SavedComparison {
  /** Always sorted ascending: a < b. Enforces dedup regardless of caller order. */
  a: string
  b: string
  /** ISO 8601 datetime — when this comparison was saved. */
  savedAt: string
}

type ComparisonsByUser = Record<string, SavedComparison[]>

const itemSchema = z.object({
  a: z.string(),
  b: z.string(),
  savedAt: z.string(),
})
const schema: z.ZodType<ComparisonsByUser> = z.record(
  z.string(),
  z.array(itemSchema),
)

interface SavedComparisonsState {
  data: ComparisonsByUser
  list(userId: string): SavedComparison[]
  add(userId: string, slugA: string, slugB: string): void
  remove(userId: string, slugA: string, slugB: string): void
  /**
   * Remove all saved comparisons for the given userId. Idempotent — no-op if
   * the userId has no entries. NOT currently wired into authStore.clearGuestData
   * (see KNOWN LIMITATION above).
   */
  clearByUser(userId: string): void
}

/** Sort the slug pair so dedup works regardless of caller order. */
function canonicalize(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

export const useSavedComparisonsStore = create<SavedComparisonsState>(
  (set, get) => ({
    data: safeGet<ComparisonsByUser>(KEY, schema, STORE_VERSION, {}),

    list(userId) {
      return get().data[userId] ?? []
    },

    add(userId, slugA, slugB) {
      const [a, b] = canonicalize(slugA, slugB)
      const prev = get().data
      const userList = prev[userId] ?? []
      // Dedup by canonical pair — already-saved is a no-op.
      if (userList.some((c) => c.a === a && c.b === b)) return
      const next: ComparisonsByUser = {
        ...prev,
        [userId]: [
          ...userList,
          { a, b, savedAt: new Date().toISOString() },
        ],
      }
      set({ data: next })
      safeSet(KEY, next, STORE_VERSION)
    },

    remove(userId, slugA, slugB) {
      const [a, b] = canonicalize(slugA, slugB)
      const prev = get().data
      const userList = prev[userId] ?? []
      const filtered = userList.filter((c) => !(c.a === a && c.b === b))
      // Idempotent no-op when nothing changed.
      if (filtered.length === userList.length) return
      const next: ComparisonsByUser = { ...prev, [userId]: filtered }
      set({ data: next })
      safeSet(KEY, next, STORE_VERSION)
    },

    clearByUser(userId) {
      const prev = get().data
      if (!(userId in prev)) return // idempotent no-op
      const next = { ...prev }
      delete next[userId]
      set({ data: next })
      safeSet(KEY, next, STORE_VERSION)
    },
  }),
)
