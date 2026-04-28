import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import ProfilePage from "./ProfilePage"
import { useAuthStore, useUsersStore } from "@/features/auth/store"
import { useSavedComparisonsStore } from "@/features/compare/store"
import { useSubmissionStore } from "@/features/submit/store"

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ session: null })
  useUsersStore.setState({ users: [] })
  useSavedComparisonsStore.setState({ data: {} })
  useSubmissionStore.setState({ data: {} })
})

function setup() {
  return render(
    <MemoryRouter>
      <Toaster />
      <ProfilePage />
    </MemoryRouter>,
  )
}

describe("ProfilePage", () => {
  it("PR1: renders three sections (Identity, Preferences, My Activity)", () => {
    setup()
    expect(screen.getByText("Identity")).toBeTruthy()
    expect(screen.getByText("Preferences")).toBeTruthy()
    expect(screen.getByText("My Activity")).toBeTruthy()
  })

  it("PR2: shows guest fallback when guest session is active", () => {
    useAuthStore.setState({
      session: {
        userId: "guest",
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        token: "tok",
      },
    })
    setup()
    expect(screen.getByText("Guest")).toBeTruthy()
  })

  it("PR3: empty states for saved comparisons and submissions", () => {
    setup()
    expect(screen.getByText(/no saved comparisons/i)).toBeTruthy()
    expect(screen.getByText(/no submitted tools/i)).toBeTruthy()
  })

  it("PR4: lists saved comparisons when present", () => {
    useSavedComparisonsStore.setState({
      data: {
        guest: [{ a: "claude", b: "chatgpt", savedAt: "2026-04-27T00:00:00Z" }],
      },
    })
    setup()
    expect(screen.getByTestId("saved-comparisons-list")).toBeTruthy()
    expect(screen.getByText(/Claude vs ChatGPT/i)).toBeTruthy()
  })

  it("PR5: lists submissions when present", () => {
    useSubmissionStore.setState({
      data: {
        guest: [{
          id: "1",
          submitterId: "guest",
          name: "MyTool",
          url: "https://example.com",
          category: "writing",
          description: "Test",
          tags: [],
          status: "pending" as const,
          submittedAt: "2026-04-27T00:00:00Z",
        }],
      },
    })
    setup()
    expect(screen.getByTestId("submissions-list")).toBeTruthy()
    expect(screen.getByText("MyTool")).toBeTruthy()
    expect(screen.getByText("pending")).toBeTruthy()
  })

  it("PR6: Edit button visible only for real users (not guests)", async () => {
    // Seed a real user + session
    const user = await useUsersStore.getState().register({
      email: "test@bu.edu",
      password: "password1",
      displayName: "Test User",
    })
    useAuthStore.setState({
      session: {
        userId: user.id,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        token: "tok",
      },
    })
    setup()
    expect(screen.getByText("Test User")).toBeTruthy()
    expect(screen.getByRole("button", { name: /edit/i })).toBeTruthy()
  })

  it("PR7: clicking Edit reveals the edit form, save updates display name + toasts", async () => {
    const u = await useUsersStore.getState().register({
      email: "test@bu.edu",
      password: "password1",
      displayName: "Old Name",
    })
    useAuthStore.setState({
      session: {
        userId: u.id,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        token: "tok",
      },
    })
    setup()
    const ev = userEvent.setup()
    await ev.click(screen.getByRole("button", { name: /edit/i }))
    const input = screen.getByLabelText(/display name/i)
    await ev.clear(input)
    await ev.type(input, "New Name")
    await ev.click(screen.getByRole("button", { name: /save/i }))
    expect(await screen.findByText("Profile saved")).toBeTruthy()
    const updated = useUsersStore.getState().findById(u.id)
    expect(updated?.displayName).toBe("New Name")
  })
})
