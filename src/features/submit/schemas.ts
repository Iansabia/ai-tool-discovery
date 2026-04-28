// src/features/submit/schemas.ts
// Phase 3 / Plan 03-06 — Zod schemas for the Submit-a-Tool form.

import { z } from "zod"

export const SUBMIT_NAME_MAX = 80
export const SUBMIT_DESCRIPTION_MAX = 300
export const SUBMIT_TAGS_MAX = 5

export const submitSchema = z.object({
  name: z
    .string()
    .min(1, "Tool name is required")
    .max(SUBMIT_NAME_MAX, `Name must be ${SUBMIT_NAME_MAX} characters or fewer`),
  url: z
    .string()
    .min(1, "URL is required")
    .url("Must be a valid URL (e.g. https://example.com)"),
  category: z.string().min(1, "Pick a category"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(SUBMIT_DESCRIPTION_MAX, `Description must be ${SUBMIT_DESCRIPTION_MAX} characters or fewer`),
  tags: z.string().optional().or(z.literal("")),
})

export type SubmitInput = z.infer<typeof submitSchema>

/** Parse the comma-separated tags string into a deduplicated, trimmed array of up to SUBMIT_TAGS_MAX items. */
export function parseTags(raw: string | undefined): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const tok of raw.split(",")) {
    const t = tok.trim()
    if (!t) continue
    if (seen.has(t.toLowerCase())) continue
    seen.add(t.toLowerCase())
    out.push(t)
    if (out.length >= SUBMIT_TAGS_MAX) break
  }
  return out
}
