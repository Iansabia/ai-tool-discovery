// src/components/layout/AppShell.test.tsx
// Phase 1 / Plan 01-04 — proves AppShell renders proper landmarks (header/main/footer)
// and the brand link to /.
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { AppShell } from "./AppShell"

const noopPage = () => <section data-testid="dummy-outlet">outlet content</section>

describe("AppShell", () => {
  it("renders header, main, and footer landmarks", () => {
    const router = createMemoryRouter(
      [{ element: <AppShell />, children: [{ path: "/", element: noopPage() }] }],
      { initialEntries: ["/"] },
    )
    render(<RouterProvider router={router} />)
    // Header landmark (banner role)
    expect(screen.getByRole("banner")).toBeInTheDocument()
    // Main landmark
    expect(screen.getByRole("main")).toBeInTheDocument()
    // Footer landmark
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    // Outlet content
    expect(screen.getByTestId("dummy-outlet")).toBeInTheDocument()
  })

  it("renders the brand link to /", () => {
    const router = createMemoryRouter(
      [{ element: <AppShell />, children: [{ path: "/", element: noopPage() }] }],
      { initialEntries: ["/"] },
    )
    render(<RouterProvider router={router} />)
    const brand = screen.getByRole("link", { name: /AI\s+Tools/i })
    expect(brand).toHaveAttribute("href", "/")
  })
})
