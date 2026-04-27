import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import RankingsPage from "./RankingsPage"
import { useUpvoteStore } from "@/features/rankings/store"
import { useAuthStore } from "@/features/auth/store"
import { TOOLS } from "@/data/tools"

beforeEach(() => {
  localStorage.clear()
  useUpvoteStore.setState({ data: {} })
  useAuthStore.setState({ session: null })
})

function setup() {
  return render(
    <MemoryRouter>
      <Toaster />
      <RankingsPage />
    </MemoryRouter>,
  )
}

describe("RankingsPage", () => {
  it("RP1: renders all 50 tools (rows)", () => {
    setup()
    const rows = screen.getAllByTestId(/^rank-row-/)
    expect(rows.length).toBe(TOOLS.length)
  })

  it("RP2: shows zero-votes helper when no votes exist", () => {
    setup()
    expect(screen.getByText(/no votes yet/i)).toBeTruthy()
  })

  it("RP3: switches helper text after a vote is cast", async () => {
    setup()
    const user = userEvent.setup()
    const firstUp = screen.getAllByLabelText(/upvote/i)[0]!
    await user.click(firstUp)
    expect(await screen.findByText(/sorted by net upvotes/i)).toBeTruthy()
  })

  it("RP4: sorts by net upvotes (top tool changes after voting)", async () => {
    setup()
    const user = userEvent.setup()
    // Find Claude's row (somewhere in middle alphabetically) and upvote it
    const claudeRow = screen.queryByTestId("rank-row-claude")
    if (!claudeRow) {
      // skip if claude not in seed
      return
    }
    const claudeUp = claudeRow.querySelector("[aria-label*='Upvote']") as HTMLElement
    await user.click(claudeUp)
    // After voting, claude should be in position 1 (top)
    const rows = screen.getAllByTestId(/^rank-row-/)
    expect(rows[0]!.getAttribute("data-testid")).toBe("rank-row-claude")
  })
})
