// src/data/_validate.ts
// Phase 1 / Plan 01-03 — build-time validators for the seed `tools.ts` (Plan 01-05).
// Both functions are called at MODULE LOAD inside `tools.ts`. Module load fires both
// at dev-server startup AND during `vite build`, so a thrown error fails the build.
// This is FOUND-07's structural prevention of the "everything is Claude" / hardcoded-
// compare bugs at the data layer.

import type { Tool } from "@/types"

/**
 * Throw if any two tools share a slug. Slugs are the primary key for routing
 * (`/tools/:slug`, `/compare/:a/vs/:b`); duplicates would silently break URL-as-source-
 * of-truth.
 */
export function __validateSlugsUnique(tools: ReadonlyArray<Tool>): void {
  const seen = new Map<string, string>()
  for (const t of tools) {
    const prior = seen.get(t.slug)
    if (prior !== undefined) {
      throw new Error(
        `[seed] duplicate slug "${t.slug}" — found on "${prior}" and "${t.name}". ` +
          `Slugs must be unique across the entire tool dataset.`,
      )
    }
    seen.set(t.slug, t.name)
  }
}

/**
 * Throw if any tool has a missing or empty logo asset.
 *
 * `tool.logo` is a Vite-imported URL string. If the import path was wrong, the static-
 * asset module returns undefined or an empty string. TypeScript can't catch this because
 * Vite's `?url` import declaration types as `string` regardless of file presence.
 *
 * Combined with `__validateSlugsUnique`, this guarantees that on dev-server start AND on
 * `vite build`, a misnamed logo file fails fast with a clear error pointing at the slug.
 */
export function __validateLogosPresent(tools: ReadonlyArray<Tool>): void {
  for (const t of tools) {
    if (typeof t.logo !== "string" || t.logo.length === 0) {
      throw new Error(
        `[seed] tool "${t.slug}" (${t.name}) has missing or invalid logo asset. ` +
          `Expected a non-empty string from "@/assets/tool-logos/${t.slug}.svg".`,
      )
    }
  }
}
