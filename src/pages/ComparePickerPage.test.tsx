import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import ComparePickerPage from "./ComparePickerPage"
import NotFoundPage from "./NotFoundPage"

beforeEach(() => {
  localStorage.clear()
})

function setup(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/compare/:a" element={<ComparePickerPage />} />
        <Route path="/compare/:a/vs/:b" element={<div data-testid="compare-result">PAIR</div>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ComparePickerPage", () => {
  it("CP1: shows origin tool name in header", () => {
    setup("/compare/claude")
    expect(screen.getByRole("heading", { name: /Compare Claude with/i })).toBeTruthy()
  })

  it("CP2: NotFound when origin slug is invalid", () => {
    setup("/compare/not-a-real-tool")
    expect(screen.getByTestId("page-notfound")).toBeTruthy()
  })

  it("CP3: filters candidates by search query", async () => {
    setup("/compare/claude")
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/search tools/i), "chatgpt")
    expect(screen.queryByTestId("compare-pick-chatgpt")).toBeTruthy()
  })

  it("CP4: clicking a candidate navigates to /compare/:a/vs/:b", async () => {
    setup("/compare/claude")
    const user = userEvent.setup()
    const candidate = screen.queryAllByTestId(/^compare-pick-/)[0]
    if (!candidate) return
    await user.click(candidate)
    expect(await screen.findByTestId("compare-result")).toBeTruthy()
  })
})
