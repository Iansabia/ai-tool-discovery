// src/features/onboarding/components/OnboardingInterestsStep.test.tsx
// Phase 2 / Plan 02-03 — Behavioral lock for the wizard step 1.
// Covers: ONBO-01 (route exists), ONBO-02 (no preselection, toggle works),
// ONBO-04 (back-nav preserved — see ToolsStep test), ONBO-05 (Continue gating
// + advance), ONBO-06 (Skip persists partial state via authStore.completeOnboarding).
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { OnboardingInterestsStep } from "./OnboardingInterestsStep"
import { useOnboardingStore } from "@/features/onboarding/store"
import { useAuthStore, useUsersStore } from "@/features/auth/store"
import { CATEGORIES } from "@/data/categories"

beforeEach(() => {
  localStorage.clear()
  useOnboardingStore.getState().clear()
  useAuthStore.setState({ session: null })
  useUsersStore.setState({ users: [] })
})

async function signedInRender() {
  const u = await useUsersStore
    .getState()
    .register({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
  // signIn would also work, but setState is cheaper and avoids verifyPassword.
  useAuthStore.setState({
    session: {
      userId: u.id,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 86400 * 1000,
      token: "t",
    },
  })
  return render(
    <MemoryRouter initialEntries={["/onboarding/interests"]}>
      <Toaster />
      <Routes>
        <Route path="/onboarding/interests" element={<OnboardingInterestsStep />} />
        <Route path="/onboarding/tools" element={<div>STEP-2</div>} />
        <Route path="/home" element={<div>HOME</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OnboardingInterestsStep", () => {
  it("renders all 10 categories with NO preselection (every chip aria-pressed=false)", async () => {
    await signedInRender()
    for (const cat of CATEGORIES) {
      const btn = screen.getByRole("button", { name: cat.name })
      expect(btn.getAttribute("aria-pressed")).toBe("false")
    }
    // Sanity: there should be exactly 10 toggleable chips on this page.
    const chips = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") !== null)
    expect(chips.length).toBe(10)
  })

  it("Continue is disabled when 0 interests selected (gating per ONBO-05)", async () => {
    await signedInRender()
    expect(screen.getByRole("button", { name: /^continue$/i })).toBeDisabled()
  })

  it("clicking a chip toggles aria-pressed and enables Continue", async () => {
    await signedInRender()
    const user = userEvent.setup()
    const writing = screen.getByRole("button", { name: /^writing$/i })
    await user.click(writing)
    expect(writing.getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByRole("button", { name: /^continue$/i })).not.toBeDisabled()
  })

  it("clicking a selected chip again deselects it (Pitfall 7 real toggle)", async () => {
    await signedInRender()
    const user = userEvent.setup()
    const writing = screen.getByRole("button", { name: /^writing$/i })
    await user.click(writing)
    await user.click(writing)
    expect(writing.getAttribute("aria-pressed")).toBe("false")
    expect(screen.getByRole("button", { name: /^continue$/i })).toBeDisabled()
  })

  it("Continue navigates to /onboarding/tools", async () => {
    await signedInRender()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /^writing$/i }))
    await user.click(screen.getByRole("button", { name: /^continue$/i }))
    expect(await screen.findByText("STEP-2")).toBeTruthy()
  })

  it("Skip routes to /home and persists partial selections via authStore.completeOnboarding (ONBO-06)", async () => {
    await signedInRender()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /^writing$/i }))
    await user.click(screen.getByRole("button", { name: /^coding$/i }))
    await user.click(screen.getByRole("button", { name: /skip for now/i }))
    expect(await screen.findByText("HOME")).toBeTruthy()
    const u = useUsersStore.getState().users[0]!
    expect(u.interests).toEqual(expect.arrayContaining(["writing", "coding"]))
    // The store should have been cleared as part of the Skip flow (one-shot
    // wizard semantics: bailing out resets transient nav state).
    expect(useOnboardingStore.getState().interests.size).toBe(0)
  })
})
