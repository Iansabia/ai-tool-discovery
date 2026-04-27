// src/components/layout/AppShell.tsx
// Phase 1 / Plan 01-04 — Header + <Outlet /> + Footer.
// IMPORTANT: <Toaster /> is mounted at App.tsx root, NOT here. AppShell can re-render
// across nested route transitions; Toaster must outlive every navigation.
import { Outlet } from "react-router"
import { Footer } from "./Footer"
import { Header } from "./Header"

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
