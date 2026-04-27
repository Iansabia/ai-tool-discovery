// src/features/search/components/SearchBar.test.tsx
// Phase 3 / Plan 03-03 — SearchBar tests (SB1-SB6).
//
// Strategy:
// - Mount inside <MemoryRouter>; capture the active location via a small
//   <LocationProbe /> child that writes location.pathname + search into a
//   data-testid div, then assert against it.
// - Use fake timers to fast-forward the 300ms debounce deterministically.
// - Use userEvent v14 with `advanceTimers: vi.advanceTimersByTime` so async
//   user input plays well with fake timers.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

describe("SearchBar", () => {
  it("SB1: typing 'claude' shows up to 6 fuzzy matches after debounce", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    await user.type(input, "claude")
    // Advance past the 300ms debounce
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    // Dropdown is rendered; "Claude" appears in the matches
    const listbox = await screen.findByRole("listbox")
    expect(listbox).toBeInTheDocument()
    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0)
    // Cap at 6 results
    const options = screen.getAllByRole("option")
    expect(options.length).toBeLessThanOrEqual(6)
  })

  it("SB2: typing whitespace-only renders no dropdown", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    await user.type(input, "   ")
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("SB3: pressing Enter while query is 'claude' navigates to /search?q=claude", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    await user.type(input, "claude")
    await user.keyboard("{Enter}")
    const probe = screen.getByTestId("location-probe")
    expect(probe.textContent).toBe("/search?q=claude")
  })

  it("SB4: clicking a dropdown match navigates to /tools/{slug}", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    await user.type(input, "claude")
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    const options = await screen.findAllByRole("option")
    // Find the Claude option specifically
    const claudeOption = options.find((o) =>
      o.getAttribute("href") === "/tools/claude",
    )
    expect(claudeOption).toBeDefined()
    await user.click(claudeOption!)
    const probe = screen.getByTestId("location-probe")
    expect(probe.textContent).toBe("/tools/claude")
  })

  it("SB5: pressing Escape closes the dropdown without navigating", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderBar()
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    await user.type(input, "claude")
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    expect(screen.queryByRole("listbox")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    // No nav happened — still at "/"
    const probe = screen.getByTestId("location-probe")
    expect(probe.textContent).toBe("/")
  })

  it("SB6: clicking outside the dropdown closes it", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <MemoryRouter initialEntries={["/"]}>
        <div data-testid="outside">outside-target</div>
        <SearchBar />
        <LocationProbe />
      </MemoryRouter>,
    )
    const input = screen.getByRole("searchbox", { name: /search tools/i })
    await user.type(input, "claude")
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    expect(screen.queryByRole("listbox")).toBeInTheDocument()
    // Click outside via the document mousedown that the component listens for.
    await user.click(screen.getByTestId("outside"))
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })
})
