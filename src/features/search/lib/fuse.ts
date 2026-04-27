// src/features/search/lib/fuse.ts
// Phase 3 / Plan 03-03 — Fuse.js index over the seed catalog.
//
// The index is built ONCE at module load. Phase 3's catalog is a
// readonly 50-element array, so this is cheap (sub-millisecond) and
// avoids re-indexing on every keystroke.
//
// Configuration follows research/STACK.md:
//   keys:           ["name", "tagline", "description", "features"]
//   threshold:      0.4   (typo-tolerant but not "everything matches everything")
//   includeMatches: false (no highlight metadata needed for v1)
//
// Fuse is case-insensitive by default — the SP4 test confirms our
// configuration doesn't accidentally re-introduce case sensitivity.

import Fuse from "fuse.js"
import { TOOLS } from "@/data/tools"
import type { Tool } from "@/types"

// Spread to a fresh array because TOOLS is `readonly` and Fuse's
// constructor types want a mutable list.
const fuse = new Fuse([...TOOLS], {
  keys: ["name", "tagline", "description", "features"],
  threshold: 0.4,
  includeMatches: false,
})

/**
 * Search the tools catalog.
 * Returns up to `limit` matches (default unbounded).
 * Empty/whitespace-only queries return [].
 */
export function searchTools(query: string, limit?: number): Tool[] {
  const trimmed = query.trim()
  if (!trimmed) return []
  const results = fuse.search(trimmed)
  const items = results.map((r) => r.item)
  return typeof limit === "number" ? items.slice(0, limit) : items
}
