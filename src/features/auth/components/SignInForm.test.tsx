// src/features/auth/components/SignInForm.test.tsx
// Phase 2 / Plan 02-02 — SignInForm tests.
//
// Coverage:
// - Generic error wording for unknown email AND wrong password (no email-existence leak)
// - Inline email-format validation
// - Continue as Guest sets a guest session and routes to /home
// - Continue as Guest respects ?return_to
// - Credentialed sign-in respects ?return_to (BLOCKER 3 fix — round-trip works for
//   credentialed sign-in, not just guest-continue)
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { SignInForm } from "./SignInForm"
import { GENERIC_SIGNIN_ERROR } from "@/features/auth/types"
import { useUsersStore, useAuthStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  // Reset zustand stores between tests so registry/session don't leak.
  useUsersStore.setState({ users: [] })
  useAuthStore.setState({ session: null })
})

function setup(initialPath = "/signin") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Toaster />
      <Routes>
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/home" element={<div>HOME</div>} />
        <Route path="/tools/claude" element={<div>CLAUDE PAGE</div>} />
        <Route path="/favorites" element={<div>FAVORITES PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("SignInForm", () => {
  it("shows generic error on unknown email", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), "nobody@bu.edu")
    await user.type(screen.getByLabelText(/password/i), "anything1")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))
    expect(await screen.findByText(GENERIC_SIGNIN_ERROR)).toBeTruthy()
  })

  it("shows the SAME generic error on wrong password (no email-existence leak)", async () => {
    await useUsersStore.getState().register({
      email: "a@bu.edu",
      password: "hunter2x",
      displayName: "A",
    })
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), "a@bu.edu")
    await user.type(screen.getByLabelText(/password/i), "wrongpass1")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))
    expect(await screen.findByText(GENERIC_SIGNIN_ERROR)).toBeTruthy()
  })

  it("validates email format inline", async () => {
    setup()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), "not-an-email")
    await user.type(screen.getByLabelText(/password/i), "any")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))
    expect(await screen.findByText(/invalid email format/i)).toBeTruthy()
  })

  it("Continue as Guest sets a guest session and routes to /home", async () => {
    setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /continue as guest/i }))
    expect(await screen.findByText("HOME")).toBeTruthy()
  })

  it("respects return_to query param on guest-continue", async () => {
    setup("/signin?return_to=%2Ftools%2Fclaude")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /continue as guest/i }))
    expect(await screen.findByText("CLAUDE PAGE")).toBeTruthy()
  })

  // BLOCKER 3 fix: round-trip must work for credentialed sign-in too
  it("respects return_to query param after successful sign-in with credentials", async () => {
    await useUsersStore.getState().register({
      email: "test@example.com",
      password: "passw0rd",
      displayName: "Test",
    })
    setup("/signin?return_to=%2Ffavorites")
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "passw0rd")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))
    // After successful credentialed sign-in, navigation must land on /favorites (the
    // return_to), NOT /home.
    expect(await screen.findByText("FAVORITES PAGE")).toBeTruthy()
  })
})
