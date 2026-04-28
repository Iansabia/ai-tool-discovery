// src/features/tools/components/ToolCard.test.tsx
// Phase 3 / Plan 03-01 — ToolCard component tests.
//
// Strategy:
// - Mount with <MemoryRouter> wrapper so the internal <Link> renders an <a>.
// - Drive auth state via useAuthStore.setState so useAuth() returns the right
//   userId. This exercises the real composition (useAuth → useAuthStore) rather
//   than mocking the hook itself.
// - Mock sonner so we can assert toast wording without the real Toaster mount
//   (matchMedia polyfill handles either path, but mocking is cheaper here).

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { toast } from "sonner"

import { ToolCard } from "./ToolCard"
import { useFavoritesStore } from "@/features/tools/store"
import { useAuthStore } from "@/features/auth/store"
import { GUEST_USER_ID, SESSION_DURATION_MS } from "@/features/auth/types"
import type { Tool } from "@/types"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const SAMPLE_TOOL: Tool = {
  slug: "claude",
  name: "Claude",
  tagline: "Anthropic's AI assistant",
  description: "An AI assistant by Anthropic.",
  category: "writing",
  pricing: "Freemium",
  features: ["chat", "code"],
  url: "https://claude.ai",
  rating: 4.7,
  logo: "/logo-stub.svg",
}

function setGuestSession() {
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

function setSignedOut() {
  useAuthStore.setState({ session: null })
}

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

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  // Reset zustand stores
  useAuthStore.setState({ session: null })
  useFavoritesStore.setState({ data: {} })
})

function renderCard(props: { tool?: Tool; recommendedBecause?: string } = {}) {
  return render(
    <MemoryRouter>
      <ToolCard
        tool={props.tool ?? SAMPLE_TOOL}
        recommendedBecause={props.recommendedBecause}
      />
    </MemoryRouter>,
  )
}

describe("ToolCard", () => {
  it("TC1: renders the tool's name, tagline, and pricing badge", () => {
    setGuestSession()
    renderCard()
    expect(screen.getByText("Claude")).toBeInTheDocument()
    expect(screen.getByText("Anthropic's AI assistant")).toBeInTheDocument()
    expect(screen.getByText("Freemium")).toBeInTheDocument()
  })

  it("TC2: renders a logo image with src=tool.logo (alt is decorative empty)", () => {
    setGuestSession()
    renderCard()
    const img = document.querySelector("img[src='/logo-stub.svg']") as HTMLImageElement
    expect(img).toBeTruthy()
    expect(img.tagName).toBe("IMG")
  })

  it("TC3: renders the category display name (Writing) as a chip/badge", () => {
    setGuestSession()
    renderCard()
    // After Phase 4 polish: shows display name "Writing" not slug "writing"
    expect(screen.getByText("Writing")).toBeInTheDocument()
  })

  it("TC4: card title sits inside a <Link> to /tools/{slug}", () => {
    setGuestSession()
    renderCard()
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/tools/claude")
  })

  it("TC5: when user has NOT favorited, heart shows aria-pressed='false'", () => {
    setGuestSession()
    renderCard()
    const heart = screen.getByRole("button", { name: /favorite/i })
    expect(heart).toHaveAttribute("aria-pressed", "false")
  })

  it("TC6: when user HAS favorited, heart shows aria-pressed='true'", () => {
    setGuestSession()
    useFavoritesStore.getState().toggle(GUEST_USER_ID, "claude")
    renderCard()
    const heart = screen.getByRole("button", { name: /remove .*from favorites/i })
    expect(heart).toHaveAttribute("aria-pressed", "true")
  })

  it("TC7: clicking heart while unfavorited toggles + emits 'Added to favorites'", async () => {
    setGuestSession()
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole("button", { name: /favorite/i }))
    expect(useFavoritesStore.getState().isFavorite(GUEST_USER_ID, "claude")).toBe(
      true,
    )
    expect(toast.success).toHaveBeenCalledWith("Added to favorites")
  })

  it("TC8: clicking heart while favorited emits 'Removed from favorites'", async () => {
    setGuestSession()
    useFavoritesStore.getState().toggle(GUEST_USER_ID, "claude") // pre-favorite
    const user = userEvent.setup()
    renderCard()
    await user.click(
      screen.getByRole("button", { name: /remove .*from favorites/i }),
    )
    expect(useFavoritesStore.getState().isFavorite(GUEST_USER_ID, "claude")).toBe(
      false,
    )
    expect(toast.success).toHaveBeenCalledWith("Removed from favorites")
  })

  it("TC9: clicking heart does NOT bubble to a parent click handler (stopPropagation)", async () => {
    setGuestSession()
    const user = userEvent.setup()
    const parentClick = vi.fn()
    render(
      <MemoryRouter>
        <div onClick={parentClick} data-testid="parent">
          <ToolCard tool={SAMPLE_TOOL} />
        </div>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole("button", { name: /favorite/i }))
    // The heart's onClick calls stopPropagation, so the wrapping div MUST NOT
    // see the click event. If propagation bubbled, parentClick would fire.
    expect(parentClick).not.toHaveBeenCalled()
    // And the favorite still toggled — the heart action ran.
    expect(toast.success).toHaveBeenCalledWith("Added to favorites")
  })

  it("TC10: when userId is null (signed out), heart click writes under 'guest' userId", async () => {
    // Phase 4 polish: instead of disabling, signed-out clicks scope to "guest"
    // (consistent with the rest of the app's guest-mode behavior).
    setSignedOut()
    const user = userEvent.setup()
    renderCard()
    const heart = screen.getByRole("button", { name: /favorite/i })
    expect(heart).not.toBeDisabled()
    await user.click(heart)
    expect(toast.success).toHaveBeenCalledWith("Added to favorites")
    expect(useFavoritesStore.getState().isFavorite("guest", "claude")).toBe(true)
  })

  it("TC10b: real-user session — heart writes under real userId, not 'guest'", async () => {
    setRealUserSession("real-user-1")
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole("button", { name: /favorite/i }))
    expect(
      useFavoritesStore.getState().isFavorite("real-user-1", "claude"),
    ).toBe(true)
    expect(useFavoritesStore.getState().isFavorite("guest", "claude")).toBe(
      false,
    )
  })
})
