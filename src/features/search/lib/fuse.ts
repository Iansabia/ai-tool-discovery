// src/features/search/lib/fuse.ts
// Phase 3 / Plan 03-03 + Phase 4 polish — Fuse.js index over the seed catalog.
//
// The index is built ONCE at module load. Phase 3's catalog is a readonly
// 50-element array, so this is cheap (sub-millisecond) and avoids re-indexing
// on every keystroke.
//
// Phase 4 polish — improved recall:
//   - `searchKeywords` (use-case phrases like "research paper", "lecture
//     notes") is the highest-weighted key so a generic query like "research
//     paper" surfaces every multi-purpose tool that solves that need
//     (Claude, ChatGPT, Perplexity, Elicit, Consensus, Semantic Scholar,
//     Scite) instead of only the literal-text matches.
//   - `categories` (the slug array, e.g. ["writing","coding","research",
//     "productivity"]) is included so users can search by category name and
//     get the whole bucket.
//   - Per-key weights bias matches toward intent-bearing fields (name +
//     keywords) over the noisier description prose.
//
// Threshold 0.4 is typo-tolerant but doesn't make everything match
// everything. Fuse is case-insensitive by default.

import Fuse from "fuse.js"
import { TOOLS } from "@/data/tools"
import type { Tool } from "@/types"

// Spread to a fresh array because TOOLS is `readonly` and Fuse's
// constructor types want a mutable list.
const fuse = new Fuse([...TOOLS], {
  keys: [
    { name: "name", weight: 1.0 },
    { name: "searchKeywords", weight: 0.9 },
    { name: "tagline", weight: 0.6 },
    { name: "categories", weight: 0.5 },
    { name: "features", weight: 0.4 },
    { name: "description", weight: 0.3 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: false,
  minMatchCharLength: 2,
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
