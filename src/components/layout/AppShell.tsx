// src/components/layout/AppShell.tsx
// Phase 1 / Plan 01-04 — Header + <Outlet /> + Footer.
// IMPORTANT: <Toaster /> is mounted at App.tsx root, NOT here. AppShell can re-render
// across nested route transitions; Toaster must outlive every navigation.
//
// Phase 4 polish — global Back link mounted just below the header on every
// route except the landing page (path "/"). It uses real browser history when
// there is in-app history, otherwise routes to /home as a safe fallback.
import { Outlet, useLocation } from "react-router"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { BackLink } from "./BackLink"

export function AppShell() {
  const location = useLocation()
  // Routes where the global Back button is hidden (full-bleed marketing surfaces).
  const HIDE_BACK_ON = new Set<string>(["/", "/signin", "/signup", "/forgot-password"])
  const showBack = !HIDE_BACK_ON.has(location.pathname)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {showBack && (
          <div className="container mx-auto px-4 pt-4">
            <BackLink />
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
