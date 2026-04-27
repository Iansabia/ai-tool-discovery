// src/features/search/components/SearchBar.test.tsx
// Phase 3 / Plan 03-03 — SearchBar tests (SB1-SB6).
//
// Strategy:
// - Mount inside <MemoryRouter>; capture the active location via a small
//   <LocationProbe /> child that surfaces location.pathname + search into a
//   data-testid div, then assert against it.
// - Drive the input with fireEvent.change so we can deterministically advance
//   the 300ms debounce timer with vi.useFakeTimers without coupling to
//   userEvent's keystroke timing model.
// - Keyboard interactions (Enter, Escape) use fireEvent.keyDown.
// - Click-outside is exercised by dispatching a `mousedown` on document.body,
//   matching the listener the component registers.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router"
import { SearchBar } from "./SearchBar"

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  )
}

function renderBar() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <SearchBar />
      <LocationProbe />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function typeQuery(input: HTMLElement, value: string) {
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value } })
}

function flushDebounce() {
  act(() => {
    vi.advanceTimersByTime(350)
  })
}

describe("SearchBar", () => {
  it("SB1: typing 'claude' shows up to 6 fuzzy matches after debounce", () => {
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    typeQuery(input, "claude")
    flushDebounce()
    const listbox = screen.getByRole("listbox")
    expect(listbox).toBeInTheDocument()
    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0)
    const options = screen.getAllByRole("option")
    expect(options.length).toBeLessThanOrEqual(6)
  })

  it("SB2: typing whitespace-only renders no dropdown", () => {
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    typeQuery(input, "   ")
    flushDebounce()
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("SB3: pressing Enter while query is 'claude' navigates to /search?q=claude", () => {
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    typeQuery(input, "claude")
    fireEvent.keyDown(input, { key: "Enter" })
    const probe = screen.getByTestId("location-probe")
    expect(probe.textContent).toBe("/search?q=claude")
  })

  it("SB4: clicking a dropdown match navigates to /tools/{slug}", () => {
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    typeQuery(input, "claude")
    flushDebounce()
    const options = screen.getAllByRole("option")
    const claudeOption = options.find(
      (o) => o.getAttribute("href") === "/tools/claude",
    )
    expect(claudeOption).toBeDefined()
    fireEvent.click(claudeOption!)
    const probe = screen.getByTestId("location-probe")
    expect(probe.textContent).toBe("/tools/claude")
  })

  it("SB5: pressing Escape closes the dropdown without navigating", () => {
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    typeQuery(input, "claude")
    flushDebounce()
    expect(screen.queryByRole("listbox")).toBeInTheDocument()
    fireEvent.keyDown(input, { key: "Escape" })
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    const probe = screen.getByTestId("location-probe")
    expect(probe.textContent).toBe("/")
  })

  it("SB6: clicking outside the dropdown closes it", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <div data-testid="outside">outside-target</div>
        <SearchBar />
        <LocationProbe />
      </MemoryRouter>,
    )
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    typeQuery(input, "claude")
    flushDebounce()
    expect(screen.queryByRole("listbox")).toBeInTheDocument()
    // Component subscribes to document-level mousedown.
    fireEvent.mouseDown(screen.getByTestId("outside"))
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })
})
