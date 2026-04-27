// src/data/tools.test.ts
import { describe, expect, it } from "vitest"
import type { CategorySlug, PricingTier, Tool } from "@/types"
import { __validateLogosPresent, __validateSlugsUnique } from "./_validate"
import { CATEGORIES } from "./categories"
import { TOOLS } from "./tools"

const ALLOWED_CATEGORIES = new Set<CategorySlug>(CATEGORIES.map((c) => c.slug))
const ALLOWED_PRICING = new Set<PricingTier>(["Free", "Freemium", "Paid"])

describe("TOOLS seed (DATA-01, DATA-03)", () => {
  it("contains at least 50 tools (DATA-01: ~50)", () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(50)
  })

  it("every tool has all required Tool fields populated", () => {
    for (const t of TOOLS) {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/) // kebab-case
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.tagline.length).toBeGreaterThanOrEqual(5)
      expect(t.description.length).toBeGreaterThanOrEqual(20)
      expect(ALLOWED_CATEGORIES.has(t.category)).toBe(true)
      expect(ALLOWED_PRICING.has(t.pricing)).toBe(true)
      expect(t.features.length).toBeGreaterThanOrEqual(2)
      expect(t.url.startsWith("https://")).toBe(true)
      expect(t.rating).toBeGreaterThanOrEqual(1.0)
      expect(t.rating).toBeLessThanOrEqual(5.0)
      expect(typeof t.logo).toBe("string")
      expect(t.logo.length).toBeGreaterThan(0)
    }
  })

  it("slugs are unique (FOUND-07 — calls __validateSlugsUnique on the seed)", () => {
    expect(() => __validateSlugsUnique(TOOLS)).not.toThrow()
  })

  it("every tool has a non-empty logo URL (DATA-03 — calls __validateLogosPresent)", () => {
    expect(() => __validateLogosPresent(TOOLS)).not.toThrow()
  })

  it("every category has at least 3 tools (no orphan category)", () => {
    const counts = new Map<string, number>()
    for (const t of TOOLS) {
      counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
    }
    for (const slug of ALLOWED_CATEGORIES) {
      expect(counts.get(slug) ?? 0).toBeGreaterThanOrEqual(3)
    }
  })

  it("includes the well-known leaders mentioned in CONTEXT", () => {
    const slugs = new Set(TOOLS.map((t) => t.slug))
    expect(slugs.has("chatgpt")).toBe(true)
    expect(slugs.has("claude")).toBe(true)
    expect(slugs.has("cursor")).toBe(true)
    expect(slugs.has("midjourney")).toBe(true)
    expect(slugs.has("elevenlabs")).toBe(true)
  })
})

describe("FOUND-07: duplicate-slug detection on a synthetic dataset", () => {
  // We can't introduce a duplicate into the real TOOLS without crashing module load
  // (which would prevent the test file from loading at all). Instead, prove the invariant
  // on a synthetic dataset.
  it("__validateSlugsUnique throws on a synthetic dataset with a duplicate", () => {
    const dup: Tool[] = [
      { ...TOOLS[0]!, slug: "x" },
      { ...TOOLS[1]!, slug: "x" }, // collision
    ]
    expect(() => __validateSlugsUnique(dup)).toThrowError(/duplicate slug "x"/)
  })

  it("__validateLogosPresent throws on a synthetic dataset with empty logo", () => {
    const broken: Tool[] = [{ ...TOOLS[0]!, logo: "" }]
    expect(() => __validateLogosPresent(broken)).toThrowError(/missing or invalid logo/)
  })
})
