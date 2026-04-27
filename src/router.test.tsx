// src/router.test.tsx
// Phase 1 / Plan 01-04 — proves the route table wires all key URLs to the right pages
// and that param-bearing pages read from URL (URL-as-source-of-truth structural fix).
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, Navigate, RouterProvider } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import LandingPage from "@/pages/LandingPage"
import ToolDetailPage from "@/pages/ToolDetailPage"
import ComparePage from "@/pages/ComparePage"
import OnboardingInterestsPage from "@/pages/OnboardingInterestsPage"
import OnboardingToolsPage from "@/pages/OnboardingToolsPage"
import SignInPage from "@/pages/SignInPage"
import NotFoundPage from "@/pages/NotFoundPage"
import { beforeEach } from "vitest"
import { useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  // Phase 2: ProtectedRoute is no longer a stub — reset session between tests.
  localStorage.clear()
  useAuthStore.setState({ session: null })
})

// Re-define routes inline so we can use createMemoryRouter (the production router uses
// createBrowserRouter, which requires a real document.location). Same shape, different factory.
const routes = [
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/tools/:slug", element: <ToolDetailPage /> },
      { path: "/compare/:a/vs/:b", element: <ComparePage /> },
      { path: "/signin", element: <SignInPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          // Plan 02-03 router split: /onboarding redirects to /onboarding/interests;
          // step 1 + step 2 live at the new sub-routes.
          { path: "/onboarding", element: <Navigate to="/onboarding/interests" replace /> },
          { path: "/onboarding/interests", element: <OnboardingInterestsPage /> },
          { path: "/onboarding/tools", element: <OnboardingToolsPage /> },
        ],
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
    // Plan 03-03 replaced the placeholder param-slug testid with the real
    // detail page. URL-as-source-of-truth still proven by rendering the
    // tool's name (sourced from TOOLS.find(t => t.slug === "chatgpt")).
    expect(
      screen.getByRole("heading", { level: 1, name: "ChatGPT" }),
    ).toBeInTheDocument()
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

  it("Phase 2 ProtectedRoute redirects unauthenticated /onboarding visit to /signin", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/onboarding"] })
    render(<RouterProvider router={router} />)
    // Phase 2 changed ProtectedRoute from a stub to a real auth gate. With no session
    // seeded, visiting /onboarding now redirects to /signin?return_to=%2Fonboarding.
    // Assert the redirect occurred (sign-in page mounts; testid lives on the SignInPage
    // root section element from Phase 1, not on the new SignInForm — that's fine, the
    // page still mounts and the testid is preserved by the page wrapper in Plan 02-02).
    expect(screen.getByTestId("page-signin")).toBeInTheDocument()
  })

  it("Phase 2 ProtectedRoute renders Outlet when an authenticated session is present (and /onboarding redirects to /onboarding/interests)", () => {
    // Seed a valid 30-day session so /onboarding renders rather than redirects to /signin.
    // Plan 02-03 changed /onboarding to a Navigate redirect → /onboarding/interests, so the
    // assertion is the step-1 page testid, not the old /onboarding placeholder testid.
    useAuthStore.setState({
      session: {
        userId: "u1",
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        token: "tok",
      },
    })
    const router = createMemoryRouter(routes, { initialEntries: ["/onboarding"] })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-onboarding-interests")).toBeInTheDocument()
  })

  it("Phase 2 /onboarding/tools renders directly when authenticated", () => {
    useAuthStore.setState({
      session: {
        userId: "u1",
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        token: "tok",
      },
    })
    const router = createMemoryRouter(routes, {
      initialEntries: ["/onboarding/tools"],
    })
    render(<RouterProvider router={router} />)
    expect(screen.getByTestId("page-onboarding-tools")).toBeInTheDocument()
  })
})
