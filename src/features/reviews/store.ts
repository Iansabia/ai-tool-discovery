// src/features/reviews/store.ts
// Phase 2 / Plan 02-04 — useReviewStore.
//
// Reviews are keyed by tool slug (not by user) so all reviews show on a tool
// detail page. Validates rating range as defense-in-depth (Phase 3 forms also
// validate before calling). authStore.signIn / signUp call `clearByUser('guest')`
// on real-user sign-in (BLOCKER 2 wire from Plan 02-01).

import { create } from "zustand"
import { z } from "zod"
import { storageKey, safeGet, safeSet } from "@/lib/storage"
import type { Review } from "@/types"

const STORE_VERSION = 1
const KEY = storageKey("reviews", "global") // "aitools:reviews:global"

/** Map shape: { [toolSlug]: Review[] } */
type ReviewsByTool = Record<string, Review[]>

const reviewSchema = z.object({
  id: z.string(),
  toolSlug: z.string(),
  userId: z.string(),
  username: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
}) as unknown as z.ZodType<Review>

const schema: z.ZodType<ReviewsByTool> = z.record(
  z.string(),
  z.array(reviewSchema),
)

/** Caller-supplied input; the store fills in id + createdAt. */
type ReviewInput = Omit<Review, "id" | "createdAt">

interface ReviewState {
  data: ReviewsByTool
  add(input: ReviewInput): Review
  /** Returns reviews for a tool ordered by createdAt DESC (newest first). */
  listByTool(slug: string): Review[]
  /**
   * Remove ALL reviews authored by the given userId across every tool slug.
   * Called by authStore on real-user sign-in (BLOCKER 2 wire). Idempotent.
   */
  clearByUser(userId: string): void
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  data: safeGet<ReviewsByTool>(KEY, schema, STORE_VERSION, {}),

  add(input) {
    if (
      !Number.isInteger(input.rating) ||
      input.rating < 1 ||
      input.rating > 5
    ) {
      throw new Error("Rating must be an integer between 1 and 5")
    }
    const review: Review = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const prev = get().data
    const list = prev[input.toolSlug] ?? []
    const next: ReviewsByTool = {
      ...prev,
      [input.toolSlug]: [...list, review],
    }
    set({ data: next })
    safeSet(KEY, next, STORE_VERSION)
    return review
  },

  listByTool(slug) {
    const list = get().data[slug] ?? []
    // Newest first. Copy before sort — never mutate stored arrays.
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  },

  clearByUser(userId) {
    const prev = get().data
    let changed = false
    const next: ReviewsByTool = {}
    for (const [slug, reviews] of Object.entries(prev)) {
      const filtered = reviews.filter((r) => r.userId !== userId)
      if (filtered.length !== reviews.length) changed = true
      if (filtered.length > 0) next[slug] = filtered
    }
    if (!changed) return // idempotent no-op
    set({ data: next })
    safeSet(KEY, next, STORE_VERSION)
  },
}))
