// src/features/auth/components/ProtectedRoute.tsx
// Phase 2 / Plan 02-02 — REAL auth gate. Replaces the Phase 1 stub.
//
// Behavior:
// - If authenticated: call touchSession() (sliding refresh wired) and render <Outlet />.
//   `touchSession` is a no-op when remaining session time > 25 days; it re-issues a
//   30-day expiry below that threshold; it clears the session if already expired.
// - If unauthenticated: redirect to /signin?return_to=<encoded original URL>.
//   The original URL is the full pathname + search so post-sign-in the user lands
//   exactly where they came from.
import { Navigate, Outlet, useLocation } from "react-router"
import { useEffect } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function ProtectedRoute() {
  const { isAuthenticated, touchSession } = useAuth()
  const location = useLocation()

  // Sliding refresh: every protected-route render touches the session.
  // touchSession is a no-op if remaining time > 25 days; re-issues if < 25.
  // Use useEffect so the touch happens synchronously after render — this
  // matches React's expectation that store mutations don't happen during render.
  useEffect(() => {
    if (isAuthenticated) {
      touchSession()
    }
  }, [isAuthenticated, touchSession])

  if (isAuthenticated) {
    return <Outlet />
  }

  const returnTo = encodeURIComponent(location.pathname + location.search)
  return <Navigate to={`/signin?return_to=${returnTo}`} replace />
}
