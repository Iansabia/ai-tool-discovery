// src/components/theme/ThemeToggle.tsx
// Phase 1 / Plan 01-04 — light/dark/system toggle button (Header consumer).
// Multi-tab consistency: subscribes to the aitools:theme key via storage.ts so a theme
// change in tab A propagates to tab B without a manual reload (UX-08).
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { subscribeToKey } from "@/lib/storage"

const THEMES = ["light", "dark", "system"] as const
type ThemeName = (typeof THEMES)[number]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes is hydration-safe but reads `theme` only after mount; avoid SSR-shape mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // UX-08: react to theme changes from other tabs.
  // NOTE: next-themes uses raw key "aitools:theme" (no scope suffix), NOT
  // storageKey("theme") which would produce "aitools:theme:global". This divergence
  // is intentional — next-themes is a third-party consumer that doesn't follow our
  // Zustand store convention. Subscribe to next-themes' literal key directly.
  useEffect(() => {
    return subscribeToKey("aitools:theme", (newValue) => {
      if (newValue === null) return
      let parsed: string = newValue
      try {
        const j: unknown = JSON.parse(newValue)
        if (typeof j === "string") parsed = j
      } catch {
        /* raw string is fine */
      }
      if ((THEMES as readonly string[]).includes(parsed)) {
        setTheme(parsed)
      }
    })
  }, [setTheme])

  if (!mounted) {
    // Render a placeholder of correct dimensions to avoid layout shift
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const cycle = () => {
    const idx = THEMES.indexOf((theme as ThemeName) ?? "system")
    const next = THEMES[(idx + 1) % THEMES.length] ?? "system"
    setTheme(next)
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${theme ?? "system"} (click to cycle)`}
      onClick={cycle}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
