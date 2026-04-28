import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import FavoritesPage from "./FavoritesPage"
import { useFavoritesStore } from "@/features/tools/store"
import { useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  useFavoritesStore.setState({ data: {} })
  useAuthStore.setState({ session: null })
})

function setup() {
  return render(
    <MemoryRouter>
      <Toaster />
      <FavoritesPage />
    </MemoryRouter>,
  )
}

describe("FavoritesPage", () => {
  it("FP1: renders empty state when no favorites exist", () => {
    setup()
    expect(screen.getByText(/no favorites yet/i)).toBeTruthy()
    expect(screen.getByRole("link", { name: /browse tools/i })).toBeTruthy()
  })

  it("FP2: renders grid of favorites when they exist", () => {
    useFavoritesStore.setState({ data: { guest: ["claude", "chatgpt"] } })
    setup()
    expect(screen.getByTestId("favorites-grid")).toBeTruthy()
    // Two ToolCards rendered (anchor links to /tools/...)
    const links = screen.getAllByRole("link")
    expect(
      links.some((l) => l.getAttribute("href") === "/tools/claude"),
    ).toBe(true)
  })

  it("FP3: skips slugs that don't exist in TOOLS (graceful degradation)", () => {
    useFavoritesStore.setState({ data: { guest: ["claude", "deleted-tool"] } })
    setup()
    // Should still render grid with the one valid tool
    expect(screen.getByTestId("favorites-grid")).toBeTruthy()
  })
})
