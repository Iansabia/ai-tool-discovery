// src/data/categories.test.ts
import { describe, expect, it } from "vitest"
import type { CategorySlug } from "@/types"
import { CATEGORIES } from "./categories"

const EXPECTED_SLUGS: CategorySlug[] = [
  "writing",
  "coding",
  "research",
  "image",
  "audio",
  "video",
  "productivity",
  "design",
  "data",
  "marketing",
]

describe("CATEGORIES seed", () => {
  it("contains exactly 10 entries", () => {
    expect(CATEGORIES).toHaveLength(10)
  })

  it("contains the exact set of CategorySlug values from CONTEXT", () => {
    const slugs = CATEGORIES.map((c) => c.slug).sort()
    expect(slugs).toEqual([...EXPECTED_SLUGS].sort())
  })

  it("every category has non-empty name, description, and icon", () => {
    for (const c of CATEGORIES) {
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(10)
      expect(c.icon.length).toBeGreaterThan(0)
    }
  })

  it("slugs are unique (no duplicates)", () => {
    const slugs = CATEGORIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
