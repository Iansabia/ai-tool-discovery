// src/features/auth/components/SignUpForm.test.tsx
// Phase 2 / Plan 02-02 — SignUpForm tests.
//
// Coverage:
// - Inline error: password too short
// - Inline error: password missing number
// - Inline error: confirm-password mismatch
// - Successful signup auto-logs in + routes to /onboarding/interests (per CONTEXT)
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { SignUpForm } from "./SignUpForm"
import { useUsersStore, useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  useUsersStore.setState({ users: [] })
  useAuthStore.setState({ session: null })
})

function setup() {
  return render(
    <MemoryRouter initialEntries={["/signup"]}>
      <Toaster />
      <Routes>
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/onboarding/interests" element={<div>ONBOARDING-INTERESTS</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("SignUpForm", () => {
  it("shows password-too-short error inline", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/display name/i), "Alice")
    await user.type(screen.getByLabelText(/^email$/i), "a@bu.edu")
    await user.type(screen.getByLabelText(/^password$/i), "abc1")
    await user.type(screen.getByLabelText(/confirm password/i), "abc1")
    await user.click(screen.getByRole("button", { name: /create account/i }))
    expect(await screen.findByText(/at least 8 characters/i)).toBeTruthy()
  })

  it("shows password-missing-number error", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/display name/i), "Alice")
    await user.type(screen.getByLabelText(/^email$/i), "a@bu.edu")
    await user.type(screen.getByLabelText(/^password$/i), "lettersOnly")
    await user.type(screen.getByLabelText(/confirm password/i), "lettersOnly")
    await user.click(screen.getByRole("button", { name: /create account/i }))
    expect(await screen.findByText(/at least one number/i)).toBeTruthy()
  })

  it("shows mismatched-confirm-password error", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/display name/i), "Alice")
    await user.type(screen.getByLabelText(/^email$/i), "a@bu.edu")
    await user.type(screen.getByLabelText(/^password$/i), "hunter2x")
    await user.type(screen.getByLabelText(/confirm password/i), "different1")
    await user.click(screen.getByRole("button", { name: /create account/i }))
    expect(await screen.findByText(/passwords do not match/i)).toBeTruthy()
  })

  it("auto-logs in and routes to /onboarding/interests on success", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/display name/i), "Alice")
    await user.type(screen.getByLabelText(/^email$/i), "alice@bu.edu")
    await user.type(screen.getByLabelText(/^password$/i), "hunter2x")
    await user.type(screen.getByLabelText(/confirm password/i), "hunter2x")
    await user.click(screen.getByRole("button", { name: /create account/i }))
    expect(await screen.findByText("ONBOARDING-INTERESTS")).toBeTruthy()
  })
})
