// src/types/index.ts
// Phase 1 / Plan 01-03 — domain interfaces for the AI Tools Discovery platform.
// Every consumer of these types lives in a feature folder created in Phase 2 or later.

/**
 * The 10 canonical categories defined in CONTEXT. The slug is the primary key
 * for category lookups — name is the human-readable label and lives on Category.
 */
export type CategorySlug =
  | "writing"
  | "coding"
  | "research"
  | "image"
  | "audio"
  | "video"
  | "productivity"
  | "design"
  | "data"
  | "marketing"

export type PricingTier = "Free" | "Freemium" | "Paid"

/** A vote per (user, tool). State-machine shape: clicking the same vote toggles to "none". */
export type Vote = "none" | "up" | "down"

/**
 * A salted SHA-256 password record. Computed by `hashPassword(plaintext)` in
 * `src/lib/crypto.ts`; verified by `verifyPassword(plaintext, record)`.
 *
 * Both fields are 64-char lowercase hex strings (32 bytes each).
 *  - `saltHex` is 32 random bytes from `crypto.getRandomValues`, fresh per call.
 *  - `hashHex` is SHA-256(saltBytes || plaintextBytes).
 *
 * NOT production-grade (no key-derivation function / no work-factor) — chosen for
 * the v1 demo per CONTEXT.md: "materially better than plaintext for a demo; salt
 * stored alongside the user record".
 */
export interface PasswordHash {
  /** 64-char lowercase hex (32 random bytes from crypto.getRandomValues) */
  saltHex: string
  /** 64-char lowercase hex SHA-256 of (saltBytes || plaintextBytes) */
  hashHex: string
}

export interface Category {
  slug: CategorySlug
  name: string
  description: string
  icon: string // lucide-react icon component name, e.g. "Pencil"
}

export interface Tool {
  /** kebab-case URL-safe primary key. Unique across the seed dataset (build-time enforced). */
  slug: string
  name: string
  tagline: string
  description: string
  /**
   * Primary category — drives the dominant badge on cards and the "Recommended
   * because you picked X" line on /home. Must always be the first entry of
   * `categories`.
   */
  category: CategorySlug
  /**
   * All categories the tool belongs to. Tools like Claude (writing + coding +
   * research) appear in every listed category's detail page. Always non-empty
   * and starts with `category`.
   */
  categories: readonly CategorySlug[]
  pricing: PricingTier
  features: readonly string[]
  url: string
  /** seed value 1.0–5.0; live aggregation merges with reviewStore in Phase 3 */
  rating: number
  /** Vite-imported asset URL string (built via `import logo from "@/assets/tool-logos/<slug>.svg"`) */
  logo: string
}

export interface User {
  /** uuid v4 — `crypto.randomUUID()` */
  id: string
  email: string
  username: string
  displayName: string
  /** Salted SHA-256 record produced by `hashPassword(plaintext)`. NOT production-grade; demo only. */
  passwordHash: PasswordHash
  interests: CategorySlug[]
  /** tool slugs selected during onboarding step 2 */
  selectedTools: string[]
  /** ISO 8601 datetime */
  createdAt: string
}

export interface Session {
  userId: string
  /** mock random token (e.g. crypto.randomUUID() concatenation) */
  token: string
  /** ISO 8601 datetime */
  issuedAt: string
  /** ISO 8601 datetime — typically issuedAt + 7 days */
  expiresAt: string
}

export interface Review {
  id: string
  toolSlug: string
  userId: string
  /** denormalized so deleting/renaming users doesn't break already-rendered reviews */
  username: string
  /** integer 1–5 */
  rating: number
  title: string
  body: string
  createdAt: string
}

export interface UpvoteRecord {
  toolSlug: string
  userId: string
  vote: Vote
  /** ISO 8601 datetime; updated on every vote change */
  votedAt: string
}

export interface Submission {
  id: string
  submitterId: string
  name: string
  url: string
  category: CategorySlug
  description: string
  tags: string[]
  /** Always "pending" in v1 (no server moderation). */
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}
