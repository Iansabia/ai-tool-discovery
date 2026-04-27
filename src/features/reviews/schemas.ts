// src/features/reviews/schemas.ts
// Phase 3 / Plan 03-04 — Zod schemas for the WriteReview form.
// Matches the v1 form: rating (1-5 required), title (optional, ≤80), body (required, ≤500).

import { z } from "zod"

export const REVIEW_TITLE_MAX = 80
export const REVIEW_BODY_MAX = 500
export const REVIEW_BODY_MIN = 1

export const reviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Pick a rating from 1 to 5")
    .max(5, "Pick a rating from 1 to 5"),
  title: z
    .string()
    .max(REVIEW_TITLE_MAX, `Title must be ${REVIEW_TITLE_MAX} characters or fewer`)
    .optional()
    .or(z.literal("")),
  body: z
    .string()
    .min(REVIEW_BODY_MIN, "Tell us a little about your experience")
    .max(REVIEW_BODY_MAX, `Review must be ${REVIEW_BODY_MAX} characters or fewer`),
})

export type ReviewInput = z.infer<typeof reviewSchema>
