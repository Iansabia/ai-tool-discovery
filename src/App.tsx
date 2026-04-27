// src/App.tsx
// Phase 1 / Plan 01-04 — application root.
// Toaster mounts here (sibling of RouterProvider), NOT inside AppShell — see RESEARCH Pattern 4.
import { RouterProvider } from "react-router"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { router } from "@/router"

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" visibleToasts={3} />
    </ThemeProvider>
  )
}
