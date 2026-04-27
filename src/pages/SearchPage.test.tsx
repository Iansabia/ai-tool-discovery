// src/pages/SearchPage.test.tsx
// Phase 3 / Plan 03-03 — SearchPage tests (SP1-SP4).

import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import SearchPage from "./SearchPage"
import { useFavoritesStore } from "@/features/tools/store"
import { useAuthStore } from "@/features/auth/store"

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ session: null })
  useFavoritesStore.setState({ data: {} })
})

describe("SearchPage", () => {
  it("SP1: /search?q=claude renders ToolCards including Claude", () => {
    renderAt("/search?q=claude")
    // ToolCard renders the tool name; expect at least one match for Claude
    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0)
  })

  it("SP2: /search (no q) renders the empty 'Type a query' state", () => {
    renderAt("/search")
    expect(screen.getByText(/type a query in the header to search/i)).toBeInTheDocument()
  })

  it("SP3: /search?q=zzznevermatchanything renders 'No tools matched' + 3 category fallback chips", () => {
    renderAt("/search?q=zzznevermatchanything")
    expect(screen.getByText(/no tools matched/i)).toBeInTheDocument()
    // Three fallback category chips, each linking to /categories/:slug
    const links = screen.getAllByRole("link")
    const categoryLinks = links.filter((l) => l.getAttribute("href")?.startsWith("/categories/"))
    expect(categoryLinks).toHaveLength(3)
  })

  it("SP4: /search?q=Claude (capital) matches /search?q=claude (case-insensitive)", () => {
    renderAt("/search?q=Claude")
    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0)
  })
})
