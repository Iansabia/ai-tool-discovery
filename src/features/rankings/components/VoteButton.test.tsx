import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Toaster } from "@/components/ui/sonner"
import { VoteButton } from "./VoteButton"
import { useUpvoteStore } from "@/features/rankings/store"
import { useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  useUpvoteStore.setState({ data: {} })
  useAuthStore.setState({ session: null })
})

function setup(slug = "claude") {
  return render(
    <>
      <Toaster />
      <VoteButton slug={slug} />
    </>,
  )
}

describe("VoteButton", () => {
  it("VB1: renders with net count 0 when no votes exist", () => {
    setup()
    expect(screen.getByTestId("vote-count-claude")).toHaveTextContent("0")
  })

  it("VB2: clicking up increments count to 1 and toasts 'Voted up'", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/upvote/i))
    expect(screen.getByTestId("vote-count-claude")).toHaveTextContent("1")
    expect(await screen.findByText("Voted up")).toBeTruthy()
  })

  it("VB3: clicking down increments count to -1 and toasts 'Voted down'", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/downvote/i))
    expect(screen.getByTestId("vote-count-claude")).toHaveTextContent("-1")
    expect(await screen.findByText("Voted down")).toBeTruthy()
  })

  it("VB4: clicking up then down switches sides (count -1, toast 'Voted down')", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/upvote/i))
    await user.click(screen.getByLabelText(/downvote/i))
    expect(screen.getByTestId("vote-count-claude")).toHaveTextContent("-1")
    expect(await screen.findByText("Voted down")).toBeTruthy()
  })

  it("VB5: clicking up twice toggles back to none (count 0, toast 'Vote removed')", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/upvote/i))
    await user.click(screen.getByLabelText(/upvote/i))
    expect(screen.getByTestId("vote-count-claude")).toHaveTextContent("0")
    expect(await screen.findByText("Vote removed")).toBeTruthy()
  })

  it("VB6: pressed state reflects current vote via aria-pressed", async () => {
    setup()
    const user = userEvent.setup()
    const up = screen.getByLabelText(/upvote/i)
    expect(up).toHaveAttribute("aria-pressed", "false")
    await user.click(up)
    expect(up).toHaveAttribute("aria-pressed", "true")
  })
})
