import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Toaster } from "@/components/ui/sonner"
import { WriteReviewDialog } from "./WriteReviewDialog"
import { useReviewStore } from "@/features/reviews/store"
import { useAuthStore } from "@/features/auth/store"
import { TOOLS } from "@/data/tools"

const tool = TOOLS[0]!

beforeEach(() => {
  localStorage.clear()
  useReviewStore.setState({ data: {} })
  useAuthStore.setState({ session: null })
})

function setup() {
  return render(
    <>
      <Toaster />
      <WriteReviewDialog tool={tool} />
    </>,
  )
}

describe("WriteReviewDialog", () => {
  it("WR1: renders form with rating, title, body fields", () => {
    setup()
    expect(screen.getByRole("radiogroup", { name: /rating/i })).toBeTruthy()
    expect(screen.getByLabelText(/title/i)).toBeTruthy()
    expect(screen.getByLabelText(/your review/i)).toBeTruthy()
  })

  it("WR2: shows validation error when rating is missing", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/your review/i), "Decent tool overall")
    await user.click(screen.getByRole("button", { name: /post review/i }))
    expect(await screen.findByText(/pick a rating/i)).toBeTruthy()
  })

  it("WR3: shows validation error when body is empty", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: "5 stars" }))
    await user.click(screen.getByRole("button", { name: /post review/i }))
    expect(await screen.findByText(/tell us a little about/i)).toBeTruthy()
  })

  it("WR4: successful submit persists to useReviewStore and toasts 'Review posted'", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: "4 stars" }))
    await user.type(screen.getByLabelText(/your review/i), "Solid tool, helped a lot.")
    await user.click(screen.getByRole("button", { name: /post review/i }))
    expect(await screen.findByText("Review posted")).toBeTruthy()
    const stored = useReviewStore.getState().listByTool(tool.slug)
    expect(stored).toHaveLength(1)
    expect(stored[0]!.rating).toBe(4)
    expect(stored[0]!.body).toBe("Solid tool, helped a lot.")
  })

  it("WR5: title is optional (review submits without it)", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: "3 stars" }))
    await user.type(screen.getByLabelText(/your review/i), "Average")
    await user.click(screen.getByRole("button", { name: /post review/i }))
    expect(await screen.findByText("Review posted")).toBeTruthy()
  })
})
