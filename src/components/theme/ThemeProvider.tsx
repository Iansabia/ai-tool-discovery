// src/components/theme/ThemeProvider.tsx
// Phase 1 / Plan 01-04 — wraps next-themes with the CONTEXT-locked storageKey.
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="aitools:theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
