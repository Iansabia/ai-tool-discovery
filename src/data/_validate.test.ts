// src/data/_validate.test.ts
import { describe, expect, it } from "vitest"
import type { Tool } from "@/types"
import { __validateLogosPresent, __validateSlugsUnique } from "./_validate"

const baseTool = (slug: string, name: string, overrides: Partial<Tool> = {}): Tool => ({
  slug,
  name,
  tagline: "x",
  description: "y",
  category: "writing",
  pricing: "Free",
  features: [],
  url: "https://example.com",
  rating: 4.0,
  logo: `/${slug}.svg`,
  ...overrides,
})

describe("__validateSlugsUnique", () => {
  it("does not throw when slugs are unique", () => {
    const tools = [baseTool("chatgpt", "ChatGPT"), baseTool("claude", "Claude")]
    expect(() => __validateSlugsUnique(tools)).not.toThrow()
  })

  it("throws on duplicate slug with both names + the slug in the message", () => {
    const tools = [baseTool("gpt", "GPT One"), baseTool("gpt", "GPT Two")]
    expect(() => __validateSlugsUnique(tools)).toThrowError(
      /duplicate slug "gpt".*GPT One.*GPT Two/s,
    )
  })

  it("does not throw on empty array", () => {
    expect(() => __validateSlugsUnique([])).not.toThrow()
  })

  it("does not throw on single-element array", () => {
    expect(() => __validateSlugsUnique([baseTool("solo", "Solo")])).not.toThrow()
  })

  it("detects duplicates anywhere in the array, not just adjacent", () => {
    const tools = [
      baseTool("a", "A"),
      baseTool("b", "B"),
      baseTool("c", "C"),
      baseTool("a", "A again"), // collision with index 0
    ]
    expect(() => __validateSlugsUnique(tools)).toThrowError(/duplicate slug "a"/)
  })
})

describe("__validateLogosPresent", () => {
  it("does not throw when every tool has a non-empty logo string", () => {
    const tools = [
      baseTool("chatgpt", "ChatGPT", { logo: "/chatgpt.svg" }),
      baseTool("claude", "Claude", { logo: "/claude.svg" }),
    ]
    expect(() => __validateLogosPresent(tools)).not.toThrow()
  })

  it("throws when a tool has an empty-string logo", () => {
    const tools = [baseTool("broken", "Broken", { logo: "" })]
    expect(() => __validateLogosPresent(tools)).toThrowError(
      /tool "broken".*missing or invalid logo/,
    )
  })

  it("throws when a tool has a non-string logo (defensive against undefined leak)", () => {
    const tools = [
      baseTool("broken", "Broken", { logo: undefined as unknown as string }),
    ]
    expect(() => __validateLogosPresent(tools)).toThrowError(
      /tool "broken".*missing or invalid logo/,
    )
  })

  it("error message references the expected logo path so devs can locate the missing file", () => {
    const tools = [baseTool("missing-tool", "Missing Tool", { logo: "" })]
    expect(() => __validateLogosPresent(tools)).toThrowError(
      /@\/assets\/tool-logos\/missing-tool\.svg/,
    )
  })

  it("does not throw on empty array", () => {
    expect(() => __validateLogosPresent([])).not.toThrow()
  })
})
