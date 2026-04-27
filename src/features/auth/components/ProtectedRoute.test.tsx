// src/features/auth/components/ProtectedRoute.test.tsx
// Phase 2 / Plan 02-02 — tests for the REAL ProtectedRoute (replaces Phase 1 stub).
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route, useSearchParams } from "react-router"
import { ProtectedRoute } from "./ProtectedRoute"
import { useAuthStore } from "@/features/auth/store"
import { SESSION_DURATION_MS } from "@/features/auth/types"

beforeEach(() => {
  localStorage.clear()
  // Reset zustand store state between tests so a session set in test 2 doesn't
  // leak into test 1. We load fresh by resetting the session field directly.
  useAuthStore.setState({ session: null })
  vi.resetModules()
})

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>SECRET CONTENT</div>} />
          <Route path="/profile" element={<div>PROFILE</div>} />
        </Route>
        <Route path="/signin" element={<SignInProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

/** Probe component used at /signin to expose the return_to query param. */
function SignInProbe() {
  const [params] = useSearchParams()
  const rt = params.get("return_to") ?? ""
  return (
    <div>
      <div>SIGN IN PAGE</div>
      <div data-testid="return-to">{rt}</div>
    </div>
  )
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /signin with encoded return_to", async () => {
    renderAt("/secret?foo=bar")
    expect(await screen.findByText("SIGN IN PAGE")).toBeTruthy()
    // The return_to should be the URL-decoded original path+query (useSearchParams decodes)
    expect(screen.getByTestId("return-to").textContent).toBe("/secret?foo=bar")
  })

  it("renders Outlet when authenticated", async () => {
    // Pre-seed a valid session into localStorage AND zustand state
    const validSession = {
      userId: "u1",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      token: "tok",
    }
    localStorage.setItem(
      "aitools:auth:session",
      JSON.stringify({ version: 1, data: validSession }),
    )
    useAuthStore.setState({ session: validSession })
    renderAt("/secret")
    expect(await screen.findByText("SECRET CONTENT")).toBeTruthy()
  })

  // BLOCKER 4 fix: verify touchSession() actually wires sliding refresh
  it("refreshes a 20-day-old session to ~30 days on protected-route render (sliding refresh)", async () => {
    const now = Date.now()
    // Seed a session that has 20 days remaining (within the 25-day refresh threshold)
    const seededExpiresAt = now + 20 * 24 * 60 * 60 * 1000
    const seededSession = {
      userId: "u1",
      issuedAt: now - 10 * 24 * 60 * 60 * 1000,
      expiresAt: seededExpiresAt,
      token: "tok",
    }
    localStorage.setItem(
      "aitools:auth:session",
      JSON.stringify({ version: 1, data: seededSession }),
    )
    useAuthStore.setState({ session: seededSession })
    renderAt("/secret")
    // After render + effects, touchSession() should have re-issued expiresAt to ~now + 30d
    const after = useAuthStore.getState().session
    expect(after).not.toBeNull()
    if (!after) return
    const expectedMin = Date.now() + SESSION_DURATION_MS - 60_000 // 60s tolerance
    expect(after.expiresAt).toBeGreaterThan(expectedMin)
    // And it should be greater than the originally seeded value
    expect(after.expiresAt).toBeGreaterThan(seededExpiresAt)
  })
})
