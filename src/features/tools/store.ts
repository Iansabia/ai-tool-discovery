// src/features/tools/store.ts
// Phase 2 / Plan 02-04 — useFavoritesStore.
//
// Per-user, insertion-ordered favorites. Persists via the Phase 1 storage helper
// using the {version: 1, data: T} envelope. authStore.signIn / signUp call
// `clearByUser('guest')` on real-user sign-in (BLOCKER 2 wire from Plan 02-01).

import { create } from "zustand"
import { z } from "zod"
import { storageKey, safeGet, safeSet } from "@/lib/storage"

const STORE_VERSION = 1
const KEY = storageKey("favorites", "global") // "aitools:favorites:global"

/** Map shape: { [userId]: tool-slugs[] } in stable insertion order. */
type FavoritesByUser = Record<string, string[]>

const schema: z.ZodType<FavoritesByUser> = z.record(
  z.string(),
  z.array(z.string()),
)

interface FavoritesState {
  data: FavoritesByUser
  isFavorite(userId: string, slug: string): boolean
  list(userId: string): string[]
  toggle(userId: string, slug: string): void
  /**
   * Remove ALL entries for the given userId. Called by authStore on real-user
   * sign-in to clear guest data (BLOCKER 2 wire). Idempotent — no-op if the
   * userId has no entries.
   */
  clearByUser(userId: string): void
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  data: safeGet<FavoritesByUser>(KEY, schema, STORE_VERSION, {}),

  isFavorite(userId, slug) {
    return (get().data[userId] ?? []).includes(slug)
  },

  list(userId) {
    return get().data[userId] ?? []
  },

  toggle(userId, slug) {
    // Always read prev INSIDE the action so consecutive synchronous calls see
    // the latest committed state (Pitfall 3 lesson — no closure-stale reads).
    const prev = get().data
    const userList = prev[userId] ?? []
    const nextUserList = userList.includes(slug)
      ? userList.filter((s) => s !== slug)
      : [...userList, slug]
    const next: FavoritesByUser = { ...prev, [userId]: nextUserList }
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
}))
