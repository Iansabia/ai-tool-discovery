// src/router.test.tsx
// Phase 1 / Plan 01-04 — proves the route table wires all key URLs to the right pages
// and that param-bearing pages read from URL (URL-as-source-of-truth structural fix).
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import LandingPage from "@/pages/LandingPage"
import ToolDetailPage from "@/pages/ToolDetailPage"
import ComparePage from "@/pages/ComparePage"
import OnboardingPage from "@/pages/OnboardingPage"
import NotFoundPage from "@/pages/NotFoundPage"

// Re-define routes inline so we can use createMemoryRouter (the production router uses
// createBrowserRouter, which requires a real document.location). Same shape, different factory.
const routes = [
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/tools/:slug", element: <ToolDetailPage /> },
      { path: "/compare/:a/vs/:b", element: <ComparePage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/onboarding", element: <OnboardingPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]

describe("router", () => {
  it("renders landing placeholder at /", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/"] })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-landing")).toBeInTheDocument()
  })

  it("renders ToolDetailPage with slug from URL at /tools/:slug", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/tools/chatgpt"] })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-tool-detail")).toBeInTheDocument()
    expect(screen.getByTestId("param-slug")).toHaveTextContent("chatgpt")
  })

  it("renders ComparePage with both params from URL at /compare/:a/vs/:b", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/compare/claude/vs/chatgpt"],
    })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-compare")).toBeInTheDocument()
    expect(screen.getByTestId("param-a")).toHaveTextContent("claude")
    expect(screen.getByTestId("param-b")).toHaveTextContent("chatgpt")
  })

  it("renders NotFoundPage for unknown paths", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/this-path-does-not-exist"] })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-notfound")).toBeInTheDocument()
  })

  it("Phase 1 ProtectedRoute is a stub — /onboarding renders without auth", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/onboarding"] })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-onboarding")).toBeInTheDocument()
  })
})
