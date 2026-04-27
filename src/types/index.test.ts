// src/types/index.test.ts
import { describe, expect, expectTypeOf, it } from "vitest"
import type {
  CategorySlug,
  Category,
  PricingTier,
  Review,
  Session,
  Submission,
  Tool,
  UpvoteRecord,
  User,
  Vote,
} from "."

describe("domain types", () => {
  describe("CategorySlug", () => {
    it("accepts the 10 canonical category slugs", () => {
      const slugs: CategorySlug[] = [
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
      expect(slugs).toHaveLength(10)
    })

    it("rejects an unknown slug at compile time", () => {
      // @ts-expect-error — "ai" is not a valid CategorySlug
      const _bad: CategorySlug = "ai"
      void _bad
    })
  })

  describe("Tool", () => {
    it("requires slug as a non-optional string", () => {
      const tool: Tool = {
        slug: "chatgpt",
        name: "ChatGPT",
        tagline: "Conversational AI assistant.",
        description: "OpenAI's chat product.",
        category: "writing",
        pricing: "Freemium",
        features: ["Chat", "Code"],
        url: "https://chat.openai.com",
        rating: 4.7,
        logo: "/logo.svg",
      }
      expect(tool.slug).toBe("chatgpt")
      expectTypeOf(tool.slug).toBeString()
    })

    it("rejects a Tool object missing slug at compile time", () => {
      // @ts-expect-error — slug is required
      const _bad: Tool = {
        name: "ChatGPT",
        tagline: "x",
        description: "x",
        category: "writing",
        pricing: "Free",
        features: [],
        url: "https://x",
        rating: 5,
        logo: "/x.svg",
      }
      void _bad
    })
  })

  describe("Vote (state machine)", () => {
    it("is the union 'none' | 'up' | 'down'", () => {
      const a: Vote = "none"
      const b: Vote = "up"
      const c: Vote = "down"
      expect([a, b, c]).toEqual(["none", "up", "down"])
    })

    it("rejects numeric votes (legacy 1 | -1) at compile time", () => {
      // @ts-expect-error — numeric vote shape is from old ARCHITECTURE.md, superseded
      const _bad: Vote = 1
      void _bad
    })
  })

  describe("PricingTier", () => {
    it("rejects lowercase 'free' at compile time (must be 'Free')", () => {
      // @ts-expect-error — case-sensitive
      const _bad: PricingTier = "free"
      void _bad
    })
  })

  describe("Submission.status", () => {
    it("accepts only 'pending' | 'approved' | 'rejected'", () => {
      const s: Submission["status"] = "pending"
      expect(s).toBe("pending")
    })

    it("rejects unknown statuses at compile time", () => {
      // @ts-expect-error — "spam" is not in the union
      const _bad: Submission["status"] = "spam"
      void _bad
    })
  })

  describe("structural completeness (smoke)", () => {
    it("Category, User, Session, Review, UpvoteRecord all instantiable", () => {
      const cat: Category = { slug: "coding", name: "Coding", description: "", icon: "Code" }
      const user: User = {
        id: "u1",
        email: "a@b.com",
        username: "a",
        displayName: "A",
        passwordHash: "h",
        interests: ["coding"],
        selectedTools: ["chatgpt"],
        createdAt: new Date().toISOString(),
      }
      const session: Session = {
        userId: user.id,
        token: "t",
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      }
      const review: Review = {
        id: "r1",
        toolSlug: "chatgpt",
        userId: user.id,
        username: user.username,
        rating: 5,
        title: "x",
        body: "y",
        createdAt: new Date().toISOString(),
      }
      const upvote: UpvoteRecord = {
        toolSlug: "chatgpt",
        userId: user.id,
        vote: "up",
        votedAt: new Date().toISOString(),
      }
      expect([cat, user, session, review, upvote]).toHaveLength(5)
    })
  })
})
