// src/pages/ToolDetailPage.test.tsx
// Phase 3 / Plan 03-03 — Tool Detail page tests (TD1-TD9).
//
// Structural focus: the "everything is Claude" prototype bug class is
// prevented by reading the slug from the URL and rendering unique content
// for any seed slug. TD1, TD2, TD3 collectively cover three different
// slugs to lock that contract.
//
// TD7 needs an authenticated session (Favorite button is disabled when
// signed out), so we seed a real-user session via useAuthStore.setState.
// TD1-TD6, TD8, TD9 work with localStorage cleared (signed-out OK).

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { toast } from "sonner"

import ToolDetailPage from "./ToolDetailPage"
import { useAuthStore } from "@/features/auth/store"
import { useFavoritesStore } from "@/features/tools/store"
import { useReviewStore } from "@/features/reviews/store"
import { SESSION_DURATION_MS } from "@/features/auth/types"
import type { Review } from "@/types"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function setRealUserSession(userId: string) {
  const now = Date.now()
  useAuthStore.setState({
    session: {
      userId,
      issuedAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      token: "test-token",
    },
  })
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tools/:slug" element={<ToolDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  useAuthStore.setState({ session: null })
  useFavoritesStore.setState({ data: {} })
  useReviewStore.setState({ data: {} })
})

describe("ToolDetailPage", () => {
  it("TD1: /tools/claude renders Claude's name, tagline, and Freemium pricing badge", () => {
    renderAt("/tools/claude")
    // Heading is the tool name (h1)
    expect(
      screen.getByRole("heading", { level: 1, name: "Claude" }),
    ).toBeInTheDocument()
    // Tagline copy refreshed in Phase 4 accuracy pass.
    expect(
      screen.getByText(/Anthropic's assistant/i),
    ).toBeInTheDocument()
    // Phase 4 polish: badge now shows the concrete priceLabel ("Free + $20/mo") not just the tier.
    expect(screen.getByText(/Free \+ \$20\/mo/)).toBeInTheDocument()
  })

  it("TD2: /tools/cursor renders Cursor's content and does NOT mention Claude", () => {
    renderAt("/tools/cursor")
    expect(
      screen.getByRole("heading", { level: 1, name: "Cursor" }),
    ).toBeInTheDocument()
    // No "Claude" anywhere on the Cursor page — proves URL-driven render.
    expect(screen.queryByText("Claude")).not.toBeInTheDocument()
  })

  it("TD3: /tools/midjourney renders Midjourney + the Paid pricing badge", () => {
    renderAt("/tools/midjourney")
    expect(
      screen.getByRole("heading", { level: 1, name: "Midjourney" }),
    ).toBeInTheDocument()
    // Phase 4 polish: badge shows priceLabel ("$10/mo+") not the tier.
    expect(screen.getByText(/\$10\/mo\+/)).toBeInTheDocument()
  })

  it("TD4: /tools/nonexistent-slug renders the NotFound state, not a fallback tool", () => {
    renderAt("/tools/nonexistent-slug")
    expect(screen.getByTestId("page-notfound")).toBeInTheDocument()
    expect(
      screen.queryByTestId("page-tool-detail"),
    ).not.toBeInTheDocument()
  })

  it("TD5: 'Visit site' uses target=_blank with rel=noopener noreferrer", () => {
    renderAt("/tools/claude")
    // The external link is the only <a target="_blank"> on the page.
    const externalLinks = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("target") === "_blank")
    expect(externalLinks.length).toBeGreaterThanOrEqual(1)
    const link = externalLinks[0]!
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    expect(link.getAttribute("href")).toMatch(/^https?:\/\//)
  })

  it("TD6: Compare button is a Link with href=/compare/{slug}", () => {
    renderAt("/tools/claude")
    const links = screen.getAllByRole("link")
    const compareLink = links.find(
      (l) => l.getAttribute("href") === "/compare/claude",
    )
    expect(compareLink).toBeDefined()
    expect(compareLink?.textContent).toMatch(/compare/i)
  })

  it("TD7: clicking Favorite (signed in) toggles store + emits 'Added to favorites'", () => {
    setRealUserSession("user-1")
    renderAt("/tools/claude")
    const favBtn = screen.getByRole("button", {
      name: /favorite claude/i,
    })
    expect(favBtn).not.toBeDisabled()
    fireEvent.click(favBtn)
    expect(
      useFavoritesStore.getState().isFavorite("user-1", "claude"),
    ).toBe(true)
    expect(toast.success).toHaveBeenCalledWith("Added to favorites")
  })

  it("TD8: empty reviews bucket renders the 'No reviews yet' empty state", () => {
    renderAt("/tools/claude")
    expect(
      screen.getByText(/no reviews yet\. be the first to write one\./i),
    ).toBeInTheDocument()
  })

  it("TD9: when reviews exist, the review body renders", () => {
    const review: Review = {
      id: "r1",
      toolSlug: "claude",
      userId: "u1",
      username: "alice",
      rating: 5,
      title: "Wonderful",
      body: "Long context is a real gift.",
      createdAt: new Date().toISOString(),
    }
    useReviewStore.setState({ data: { claude: [review] } })
    renderAt("/tools/claude")
    expect(
      screen.getByText("Long context is a real gift."),
    ).toBeInTheDocument()
    expect(screen.getByText("alice")).toBeInTheDocument()
  })
})
