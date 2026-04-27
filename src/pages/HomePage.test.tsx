// src/pages/HomePage.test.tsx
// Phase 3 / Plan 03-02 — HomePage personalization tests (H1-H6).
//
// Strategy: seed useUsersStore + useAuthStore directly (mirrors the auth
// store test patterns) rather than going through the signUp/signIn flow.
// This isolates the personalization logic from auth side-effects (password
// hashing, etc.) and keeps the tests fast.
//
// Sonner is mocked because ToolCard imports it at module load via withToast.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import HomePage from "./HomePage"
import { useAuthStore, useUsersStore } from "@/features/auth/store"
import { useFavoritesStore } from "@/features/tools/store"
import { SESSION_DURATION_MS, GUEST_USER_ID } from "@/features/auth/types"
import type { User, CategorySlug } from "@/types"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const TEST_USER_ID = "u1"

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: TEST_USER_ID,
    email: "t@t.com",
    username: "t",
    displayName: "Test",
    passwordHash: { saltHex: "00", hashHex: "00" },
    interests: [],
    selectedTools: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function seedRealUser(interests: CategorySlug[]) {
  useUsersStore.setState({ users: [makeUser({ interests })] })
  const now = Date.now()
  useAuthStore.setState({
    session: {
      userId: TEST_USER_ID,
      issuedAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      token: "test-token",
    },
  })
}

function seedGuestSession() {
  useUsersStore.setState({ users: [] })
  const now = Date.now()
  useAuthStore.setState({
    session: {
      userId: GUEST_USER_ID,
      issuedAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      token: "test-token",
    },
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  useAuthStore.setState({ session: null })
  useUsersStore.setState({ users: [] })
  useFavoritesStore.setState({ data: {} })
})

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe("HomePage", () => {
  it("H1: empty interests renders empty state + 'Browse Categories' CTA to /categories", () => {
    seedRealUser([])
    renderHome()
    expect(
      screen.getByText(/You haven't picked any interests yet/i),
    ).toBeInTheDocument()
    const cta = screen.getByRole("link", { name: /Browse Categories/i })
    expect(cta).toHaveAttribute("href", "/categories")
  })

  it("H2: interests=['coding'] renders ONLY coding tools (no writing/research)", () => {
    seedRealUser(["coding"])
    renderHome()
    // Coding tools present
    expect(screen.getByText("Cursor")).toBeInTheDocument()
    expect(screen.getByText("GitHub Copilot")).toBeInTheDocument()
    expect(screen.getByText("Codeium")).toBeInTheDocument()
    expect(screen.getByText("Tabnine")).toBeInTheDocument()
    expect(screen.getByText("Replit")).toBeInTheDocument()
    // Writing tools absent
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument()
    expect(screen.queryByText("Claude")).not.toBeInTheDocument()
    expect(screen.queryByText("Grammarly")).not.toBeInTheDocument()
    // Research tools absent
    expect(screen.queryByText("Perplexity")).not.toBeInTheDocument()
  })

  it("H3: interests=['coding','writing'] renders BOTH categories, no others", () => {
    seedRealUser(["coding", "writing"])
    renderHome()
    // Coding sample
    expect(screen.getByText("Cursor")).toBeInTheDocument()
    // Writing sample
    expect(screen.getByText("ChatGPT")).toBeInTheDocument()
    expect(screen.getByText("Claude")).toBeInTheDocument()
    // Research/image absent
    expect(screen.queryByText("Perplexity")).not.toBeInTheDocument()
    expect(screen.queryByText("Midjourney")).not.toBeInTheDocument()
  })

  it("H4: every rendered card shows 'Recommended because you picked Coding' (display name, not slug)", () => {
    seedRealUser(["coding"])
    renderHome()
    // The "Coding" capitalized display name appears once per coding tool (5 of them).
    const matches = screen.getAllByText(
      /Recommended because you picked/i,
    )
    expect(matches.length).toBeGreaterThanOrEqual(5)
    // Match the literal display name, not the lowercase slug.
    const displayNameMatches = screen.getAllByText("Coding")
    expect(displayNameMatches.length).toBeGreaterThanOrEqual(5)
  })

  it("H5: caps the rendered list at 9 cards even if more matches exist", () => {
    // All 10 categories selected -> 50 tools match. Should still cap at 9.
    seedRealUser([
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
    ])
    renderHome()
    // Count rendered ToolCard links to /tools/:slug. Filtering keeps us robust
    // to any other links the page may contain (none currently, but resilient).
    const links = screen.getAllByRole("link")
    const toolLinks = links.filter((a) =>
      a.getAttribute("href")?.startsWith("/tools/"),
    )
    expect(toolLinks).toHaveLength(9)
  })

  it("H6: guest session renders the empty state (guest has no user record)", () => {
    seedGuestSession()
    renderHome()
    expect(
      screen.getByText(/You haven't picked any interests yet/i),
    ).toBeInTheDocument()
  })
})
