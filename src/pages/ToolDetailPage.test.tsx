// src/pages/ToolDetailPage.test.tsx
// Phase 1 / Plan 01-04 — proves ToolDetail reads slug from URL (not from local state).
// Three different URLs produce three different rendered slugs — structural prevention
// of the prototype's "every tool page shows Claude" bug class.
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import ToolDetailPage from "./ToolDetailPage"

describe("ToolDetailPage (placeholder)", () => {
  const renderAt = (path: string) => {
    const router = createMemoryRouter(
      [{ path: "/tools/:slug", element: <ToolDetailPage /> }],
      { initialEntries: [path] },
    )
    render(<RouterProvider router={router} />)
  }

  it("reads slug from URL — chatgpt", () => {
    renderAt("/tools/chatgpt")
    expect(screen.getByTestId("param-slug")).toHaveTextContent("chatgpt")
  })

  it("reads slug from URL — claude (proves URL-as-source-of-truth, not hardcoded)", () => {
    renderAt("/tools/claude")
    expect(screen.getByTestId("param-slug")).toHaveTextContent("claude")
  })

  it("reads a third unrelated slug — midjourney", () => {
    renderAt("/tools/midjourney")
    expect(screen.getByTestId("param-slug")).toHaveTextContent("midjourney")
  })
})
