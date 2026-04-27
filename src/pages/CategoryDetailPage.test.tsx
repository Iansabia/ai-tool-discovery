// src/pages/CategoryDetailPage.test.tsx
// Phase 3 / Plan 03-02 — CategoryDetailPage URL-driven rendering tests (CD1-CD5).
//
// Strategy mirrors ToolCard.test.tsx:
//   - MemoryRouter with `initialEntries` to simulate navigation to /categories/:slug
//   - <Routes> declares the same route shape as the real router
//   - Auth seeded as guest so ToolCard's heart renders enabled (we don't assert
//     heart behavior here — that's covered by ToolCard's own tests in Plan 03-01)
//   - sonner mocked because ToolCard imports it at module load via withToast

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"

import CategoryDetailPage from "./CategoryDetailPage"
import { useAuthStore } from "@/features/auth/store"
import { GUEST_USER_ID, SESSION_DURATION_MS } from "@/features/auth/types"
import { useFavoritesStore } from "@/features/tools/store"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  useAuthStore.setState({ session: null })
  useFavoritesStore.setState({ data: {} })
  // Seed guest session so ToolCard hearts render in their enabled state.
  const now = Date.now()
  useAuthStore.setState({
    session: {
      userId: GUEST_USER_ID,
      issuedAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      token: "test-token",
    },
  })
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/categories/:slug" element={<CategoryDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("CategoryDetailPage", () => {
  it("CD1: /categories/coding renders all 5 coding tool names", () => {
    renderAt("/categories/coding")
    expect(screen.getByText("Cursor")).toBeInTheDocument()
    expect(screen.getByText("GitHub Copilot")).toBeInTheDocument()
    expect(screen.getByText("Codeium")).toBeInTheDocument()
    expect(screen.getByText("Tabnine")).toBeInTheDocument()
    expect(screen.getByText("Replit")).toBeInTheDocument()
  })

  it("CD2: /categories/writing renders all 5 writing tool names", () => {
    renderAt("/categories/writing")
    expect(screen.getByText("ChatGPT")).toBeInTheDocument()
    expect(screen.getByText("Claude")).toBeInTheDocument()
    expect(screen.getByText("Jasper")).toBeInTheDocument()
    expect(screen.getByText("Copy.ai")).toBeInTheDocument()
    expect(screen.getByText("Grammarly")).toBeInTheDocument()
  })

  it("CD3: /categories/coding renders ZERO writing tools (filter is correct, not first-N)", () => {
    renderAt("/categories/coding")
    // Coding category should NOT include writing tools.
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument()
    expect(screen.queryByText("Claude")).not.toBeInTheDocument()
    expect(screen.queryByText("Grammarly")).not.toBeInTheDocument()
  })

  it("CD4: /categories/nonexistent renders the NotFound state", () => {
    renderAt("/categories/nonexistent")
    expect(screen.getByText(/404/i)).toBeInTheDocument()
    expect(screen.getByText(/Not Found/i)).toBeInTheDocument()
  })

  it("CD5: /categories/coding shows the heading 'Coding' (display name, not slug)", () => {
    renderAt("/categories/coding")
    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toHaveTextContent("Coding")
    // Specifically NOT the lowercase slug for the heading text.
    expect(heading.textContent).not.toBe("coding")
  })
})
