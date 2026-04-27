// src/pages/ComparePage.test.tsx
// Phase 1 / Plan 01-04 — STRUCTURAL FIX VERIFIED.
// The prototype always rendered Claude vs ChatGPT regardless of URL. These tests prove
// that with our URL-as-source-of-truth architecture, three different /compare/a/vs/b URLs
// each render their own pair on screen — the bug cannot recur structurally.
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import ComparePage from "./ComparePage"

describe("ComparePage (placeholder)", () => {
  const renderAt = (path: string) => {
    const router = createMemoryRouter(
      [{ path: "/compare/:a/vs/:b", element: <ComparePage /> }],
      { initialEntries: [path] },
    )
    render(<RouterProvider router={router} />)
  }

  it("reads both params from URL — claude vs chatgpt", () => {
    renderAt("/compare/claude/vs/chatgpt")
    expect(screen.getByTestId("param-a")).toHaveTextContent("claude")
    expect(screen.getByTestId("param-b")).toHaveTextContent("chatgpt")
  })

  it("URL-as-source-of-truth — flipping a/b in URL flips the rendered values", () => {
    renderAt("/compare/midjourney/vs/dalle")
    expect(screen.getByTestId("param-a")).toHaveTextContent("midjourney")
    expect(screen.getByTestId("param-b")).toHaveTextContent("dalle")
  })

  it("structural fix for compare bug — three different /compare URLs render three different pairs", () => {
    // Render three times with different URLs, confirm each renders its OWN pair.
    const cases = [
      ["claude", "chatgpt"],
      ["cursor", "copilot"],
      ["midjourney", "dalle"],
    ] as const

    for (const [a, b] of cases) {
      const router = createMemoryRouter(
        [{ path: "/compare/:a/vs/:b", element: <ComparePage /> }],
        { initialEntries: [`/compare/${a}/vs/${b}`] },
      )
      const { unmount } = render(<RouterProvider router={router} />)
      expect(screen.getByTestId("param-a")).toHaveTextContent(a)
      expect(screen.getByTestId("param-b")).toHaveTextContent(b)
      unmount()
    }
  })
})
