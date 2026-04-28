import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { SubmitToolForm } from "./SubmitToolForm"
import { useSubmissionStore } from "@/features/submit/store"
import { useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  useSubmissionStore.setState({ data: {} })
  useAuthStore.setState({ session: null })
})

function setup() {
  return render(
    <MemoryRouter initialEntries={["/submit"]}>
      <Toaster />
      <Routes>
        <Route path="/submit" element={<SubmitToolForm />} />
        <Route path="/submit/success" element={<div data-testid="success-page" />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("SubmitToolForm", () => {
  it("ST1: name is required (validation error)", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText(/tool name is required/i)).toBeTruthy()
  })

  it("ST2: URL must be valid", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/tool name/i), "Test Tool")
    await user.type(screen.getByLabelText(/^url$/i), "not-a-url")
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText(/must be a valid url/i)).toBeTruthy()
  })

  it("ST3: description is required", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/tool name/i), "Test Tool")
    await user.type(screen.getByLabelText(/^url$/i), "https://example.com")
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText(/description is required/i)).toBeTruthy()
  })

  it("ST4: successful submit persists to store + toasts + navigates to /submit/success", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/tool name/i), "Awesome Tool")
    await user.type(screen.getByLabelText(/^url$/i), "https://awesome.example.com")
    // Pick a category from the Select
    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /writing/i }))
    await user.type(screen.getByLabelText(/description/i), "A fantastic AI tool for writing.")
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText("Tool submitted for review")).toBeTruthy()
    expect(await screen.findByTestId("success-page")).toBeTruthy()
    const list = useSubmissionStore.getState().listByUser("guest")
    expect(list).toHaveLength(1)
    expect(list[0]!.name).toBe("Awesome Tool")
    expect(list[0]!.status).toBe("pending")
  })
})
