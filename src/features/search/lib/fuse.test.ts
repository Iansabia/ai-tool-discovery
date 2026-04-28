// src/features/search/lib/fuse.test.ts
// Phase 4 polish — recall sanity tests for the search index.
// Locks the multi-purpose tool intent: queries like "research paper" should
// surface ChatGPT, Claude, and Perplexity along with the dedicated research
// tools, not just literal-text matches.

import { describe, it, expect } from "vitest"
import { searchTools } from "./fuse"

function names(query: string) {
  return searchTools(query).map((t) => t.name)
}

describe("searchTools recall", () => {
  it("'research paper' surfaces multi-purpose AI assistants AND dedicated research tools", () => {
    const matches = names("research paper")
    // Dedicated research tools — must appear
    expect(matches).toContain("Elicit")
    expect(matches).toContain("Consensus")
    expect(matches).toContain("Semantic Scholar")
    // Multi-purpose tools that legitimately solve the same problem — must also appear
    expect(matches).toContain("Claude")
    expect(matches).toContain("ChatGPT")
    expect(matches).toContain("Perplexity")
  })

  it("'essay' surfaces writing assistants", () => {
    const matches = names("essay")
    expect(matches).toContain("ChatGPT")
    expect(matches).toContain("Claude")
    expect(matches).toContain("Grammarly")
  })

  it("'logo design' surfaces design and image tools", () => {
    const matches = names("logo design")
    expect(matches.length).toBeGreaterThan(0)
    // Ideogram (text-in-image, logos) should match
    expect(matches).toContain("Ideogram")
  })

  it("'transcribe' surfaces audio transcription tools", () => {
    const matches = names("transcribe")
    expect(matches).toContain("Whisper")
    expect(matches).toContain("Descript")
  })

  it("category-name queries surface the whole bucket (e.g. 'marketing')", () => {
    const matches = names("marketing")
    expect(matches.length).toBeGreaterThan(3)
  })

  it("empty / whitespace queries return []", () => {
    expect(searchTools("")).toEqual([])
    expect(searchTools("   ")).toEqual([])
  })
})
