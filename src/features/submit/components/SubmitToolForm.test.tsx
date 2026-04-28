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
  // Phase 4 demo polish: form ships with example default values so the user
  // can submit immediately during a recording. Validation tests below clear
  // the prefilled fields before asserting empty-field errors.

  it("ST1: name is required (validation error after clearing the prefilled name)", async () => {
    setup()
    const user = userEvent.setup()
    await user.clear(screen.getByLabelText(/tool name/i))
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText(/tool name is required/i)).toBeTruthy()
  })

  it("ST2: URL must be valid (after replacing the prefilled URL with garbage)", async () => {
    setup()
    const user = userEvent.setup()
    await user.clear(screen.getByLabelText(/^url$/i))
    await user.type(screen.getByLabelText(/^url$/i), "not-a-url")
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText(/must be a valid url/i)).toBeTruthy()
  })

  it("ST3: description is required (after clearing the prefilled description)", async () => {
    setup()
    const user = userEvent.setup()
    await user.clear(screen.getByLabelText(/description/i))
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText(/description is required/i)).toBeTruthy()
  })

  it("ST4: prefilled defaults submit cleanly — persists, toasts, navigates", async () => {
    setup()
    const user = userEvent.setup()
    // No typing needed — the form ships with valid example values for demo.
    await user.click(screen.getByRole("button", { name: /submit for review/i }))
    expect(await screen.findByText("Tool submitted for review")).toBeTruthy()
    expect(await screen.findByTestId("success-page")).toBeTruthy()
    const list = useSubmissionStore.getState().listByUser("guest")
    expect(list).toHaveLength(1)
    expect(list[0]!.name).toBe("Notion Calendar")
    expect(list[0]!.status).toBe("pending")
  })
})
