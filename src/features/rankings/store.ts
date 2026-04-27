// src/features/rankings/store.ts
// Phase 2 / Plan 02-04 — useUpvoteStore.
//
// Vote state machine per (userId, slug). Locked here so its 6 transitions are
// tested in isolation, not as a side-effect of UI tests (Pitfall 3 structural
// fix). Persistence flows through Phase 1 storage helper. authStore.signIn /
// signUp call `clearByUser('guest')` on real-user sign-in (BLOCKER 2 wire).

import { create } from "zustand"
import { z } from "zod"
import { storageKey, safeGet, safeSet } from "@/lib/storage"
import type { Vote } from "@/types"

const STORE_VERSION = 1
const KEY = storageKey("upvotes", "global") // "aitools:upvotes:global"

/**
 * Map shape: { [userId]: { [slug]: Vote } }.
 *
 * "none" entries are functionally identical to absent entries; we may store
 * them after a toggle-off rather than deleting. netCount handles both
 * uniformly.
 */
type VotesByUser = Record<string, Record<string, Vote>>

const voteSchema = z.union([
  z.literal("none"),
  z.literal("up"),
  z.literal("down"),
])
const schema: z.ZodType<VotesByUser> = z.record(
  z.string(),
  z.record(z.string(), voteSchema),
)

interface UpvoteState {
  data: VotesByUser
  getVote(userId: string, slug: string): Vote
  /**
   * STATE MACHINE: if existing vote === next, set to 'none' (toggle off);
   * otherwise set to next (first vote OR switch sides).
   */
  setVote(userId: string, slug: string, next: "up" | "down"): void
  netCount(slug: string): number
  /**
   * Remove ALL vote entries for the given userId. Called by authStore on
   * real-user sign-in (BLOCKER 2 wire). Idempotent.
   */
  clearByUser(userId: string): void
}

export const useUpvoteStore = create<UpvoteState>((set, get) => ({
  data: safeGet<VotesByUser>(KEY, schema, STORE_VERSION, {}),

  getVote(userId, slug) {
    return (get().data[userId]?.[slug] ?? "none") as Vote
  },

  setVote(userId, slug, next) {
    // Read prev INSIDE the action so consecutive synchronous calls see the
    // latest committed state. This is the structural fix for the prototype's
    // "rapid clicks land in inconsistent state" bug (Pitfall 3).
    const prev = get().data
    const userMap = prev[userId] ?? {}
    const current = userMap[slug] ?? "none"
    const resolved: Vote = current === next ? "none" : next
    const nextUserMap = { ...userMap, [slug]: resolved }
    const nextData: VotesByUser = { ...prev, [userId]: nextUserMap }
    set({ data: nextData })
    safeSet(KEY, nextData, STORE_VERSION)
  },

  netCount(slug) {
    let n = 0
    for (const userMap of Object.values(get().data)) {
      const v = userMap[slug]
      if (v === "up") n += 1
      else if (v === "down") n -= 1
    }
    return n
  },

  clearByUser(userId) {
    const prev = get().data
    if (!(userId in prev)) return
    const next = { ...prev }
    delete next[userId]
    set({ data: next })
    safeSet(KEY, next, STORE_VERSION)
  },
}))
