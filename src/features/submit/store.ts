// src/features/submit/store.ts
// Phase 2 / Plan 02-04 — useSubmissionStore.
//
// Pending tool submissions per user. Status defaults to "pending" (no server
// moderation in v1). authStore.signIn / signUp call `clearByUser('guest')` on
// real-user sign-in (BLOCKER 2 wire from Plan 02-01).

import { create } from "zustand"
import { z } from "zod"
import { storageKey, safeGet, safeSet } from "@/lib/storage"
import type { Submission } from "@/types"

const STORE_VERSION = 1
const KEY = storageKey("submissions", "global") // "aitools:submissions:global"

/** Map shape: { [submitterId]: Submission[] } */
type SubmissionsByUser = Record<string, Submission[]>

const submissionSchema = z.object({
  id: z.string(),
  submitterId: z.string(),
  name: z.string(),
  url: z.string(),
  category: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  status: z.union([
    z.literal("pending"),
    z.literal("approved"),
    z.literal("rejected"),
  ]),
  submittedAt: z.string(),
}) as unknown as z.ZodType<Submission>

const schema: z.ZodType<SubmissionsByUser> = z.record(
  z.string(),
  z.array(submissionSchema),
)

/** Caller-supplied input; the store fills in id + status + submittedAt. */
type SubmissionInput = Omit<Submission, "id" | "status" | "submittedAt">

interface SubmissionState {
  data: SubmissionsByUser
  add(input: SubmissionInput): Submission
  listByUser(userId: string): Submission[]
  /** Flat array of every user's submissions (used by Phase 3 admin views). */
  listAll(): Submission[]
  /**
   * Remove ALL submissions for the given submitterId. Called by authStore on
   * real-user sign-in (BLOCKER 2 wire). Idempotent.
   */
  clearByUser(userId: string): void
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  data: safeGet<SubmissionsByUser>(KEY, schema, STORE_VERSION, {}),

  add(input) {
    const submission: Submission = {
      ...input,
      id: crypto.randomUUID(),
      status: "pending",
      submittedAt: new Date().toISOString(),
    }
    const prev = get().data
    const list = prev[input.submitterId] ?? []
    const next: SubmissionsByUser = {
      ...prev,
      [input.submitterId]: [...list, submission],
    }
    set({ data: next })
    safeSet(KEY, next, STORE_VERSION)
    return submission
  },

  listByUser(userId) {
    return get().data[userId] ?? []
  },

  listAll() {
    return Object.values(get().data).flat()
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
