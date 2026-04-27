// src/features/onboarding/components/OnboardingToolsStep.test.tsx
// Phase 2 / Plan 02-03 — Behavioral lock for the wizard step 2.
// Covers: ONBO-03 (50 tools, no preselection, toggleable; Finish enabled with 0),
// ONBO-04 (Back to step 1 preserves selections), ONBO-05 (Finish writes both lists
// to the user record via authStore.completeOnboarding and routes to /home),
// ONBO-06 (Skip writes whatever has been picked through the same path).
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { OnboardingInterestsStep } from "./OnboardingInterestsStep"
import { OnboardingToolsStep } from "./OnboardingToolsStep"
import { useOnboardingStore } from "@/features/onboarding/store"
import { useAuthStore, useUsersStore } from "@/features/auth/store"

beforeEach(() => {
  localStorage.clear()
  useOnboardingStore.getState().clear()
  useAuthStore.setState({ session: null })
  useUsersStore.setState({ users: [] })
})

async function setupAuth() {
  const u = await useUsersStore
    .getState()
    .register({ email: "a@bu.edu", password: "hunter2x", displayName: "A" })
  useAuthStore.setState({
    session: {
      userId: u.id,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 86400 * 1000,
      token: "t",
    },
  })
  return u
}

function setup(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Toaster />
      <Routes>
        <Route path="/onboarding/interests" element={<OnboardingInterestsStep />} />
        <Route path="/onboarding/tools" element={<OnboardingToolsStep />} />
        <Route path="/home" element={<div>HOME</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OnboardingToolsStep", () => {
  it("renders 50 tool chips with NO preselection (ONBO-03)", async () => {
    await setupAuth()
    setup("/onboarding/tools")
    const chips = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") !== null)
    expect(chips.length).toBe(50)
    for (const btn of chips) {
      expect(btn.getAttribute("aria-pressed")).toBe("false")
    }
  })

  it("Finish is enabled even with 0 tools selected (tools are optional, 0 to 50)", async () => {
    await setupAuth()
    setup("/onboarding/tools")
    expect(screen.getByRole("button", { name: /^finish$/i })).not.toBeDisabled()
  })

  it("Finish writes interests + selectedTools to user record via authStore.completeOnboarding and routes to /home (ONBO-05)", async () => {
    const u = await setupAuth()
    // Pre-seed step-1 selections via the store directly (simulates having
    // navigated through step 1 already).
    useOnboardingStore.getState().toggleInterest("writing")
    useOnboardingStore.getState().toggleInterest("coding")
    setup("/onboarding/tools")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /^claude$/i }))
    await user.click(screen.getByRole("button", { name: /^finish$/i }))
    expect(await screen.findByText("HOME")).toBeTruthy()
    const updated = useUsersStore.getState().findById(u.id)!
    expect(updated.interests).toEqual(expect.arrayContaining(["writing", "coding"]))
    expect(updated.selectedTools).toEqual(expect.arrayContaining(["claude"]))
    // Store cleared on Finish (one-shot semantics).
    expect(useOnboardingStore.getState().interests.size).toBe(0)
    expect(useOnboardingStore.getState().tools.size).toBe(0)
  })

  it("Back-nav from step 2 to step 1 preserves step-1 selections (ONBO-04)", async () => {
    await setupAuth()
    useOnboardingStore.getState().toggleInterest("writing")
    useOnboardingStore.getState().toggleInterest("coding")
    setup("/onboarding/tools")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /^back$/i }))
    // Now on step 1 — verify the chips are still pressed (no clear() on Back).
    const writing = await screen.findByRole("button", { name: /^writing$/i })
    expect(writing.getAttribute("aria-pressed")).toBe("true")
    const coding = screen.getByRole("button", { name: /^coding$/i })
    expect(coding.getAttribute("aria-pressed")).toBe("true")
  })

  it("Skip routes to /home and persists partial state via authStore.completeOnboarding (ONBO-06)", async () => {
    const u = await setupAuth()
    useOnboardingStore.getState().toggleInterest("writing")
    setup("/onboarding/tools")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /^chatgpt$/i }))
    await user.click(screen.getByRole("button", { name: /^skip$/i }))
    expect(await screen.findByText("HOME")).toBeTruthy()
    const updated = useUsersStore.getState().findById(u.id)!
    expect(updated.interests).toContain("writing")
    expect(updated.selectedTools).toContain("chatgpt")
  })

  it("Finish is a no-op (no user-record write) when the session is guest", async () => {
    // Seed a guest session — completeOnboarding must NOT update any user record.
    useAuthStore.setState({
      session: {
        userId: "guest",
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 86400 * 1000,
        token: "t",
      },
    })
    useOnboardingStore.getState().toggleInterest("writing")
    setup("/onboarding/tools")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /^finish$/i }))
    expect(await screen.findByText("HOME")).toBeTruthy()
    // No real user record was created — the registry is empty.
    expect(useUsersStore.getState().users.length).toBe(0)
  })
})
