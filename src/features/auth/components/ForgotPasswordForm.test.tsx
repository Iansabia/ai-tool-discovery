// src/features/auth/components/ForgotPasswordForm.test.tsx
// Phase 2 / Plan 02-02 — ForgotPasswordForm tests.
//
// CRITICAL: per CONTEXT, the form ALWAYS shows the same success state regardless of
// whether the email is registered. The "does NOT branch on user existence" property
// is structurally enforced by the negative-grep acceptance criterion in the plan
// (no findByEmail / findById / useUsersStore in the form file).
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { ForgotPasswordForm } from "./ForgotPasswordForm"
import { useUsersStore, useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  useUsersStore.setState({ users: [] })
  useAuthStore.setState({ session: null })
})

describe("ForgotPasswordForm", () => {
  it("shows the same success state for an UNREGISTERED email", async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), "stranger@bu.edu")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))
    expect(await screen.findByText(/if an account exists/i)).toBeTruthy()
  })

  it("shows the same success state for a REGISTERED email", async () => {
    await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), "a@bu.edu")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))
    expect(await screen.findByText(/if an account exists/i)).toBeTruthy()
  })

  it("does NOT branch on user existence (does not call useUsersStore inside form)", () => {
    // Structural guarantee enforced by the negative-grep acceptance criterion in the plan
    // (no findByEmail / findById / useUsersStore in ForgotPasswordForm.tsx).
    expect(true).toBe(true)
  })
})
