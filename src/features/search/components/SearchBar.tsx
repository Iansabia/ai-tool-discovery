// src/features/search/components/SearchBar.tsx
// Phase 3 / Plan 03-03 — Header autocomplete searchbar.
//
// Behavior:
// - Debounced 300ms while typing; up to 6 fuzzy matches via Fuse.js.
// - Enter routes to /search?q=<encoded query>.
// - Click on a match routes to /tools/{slug}.
// - Esc closes the dropdown.
// - Click outside closes the dropdown.
//
// The dropdown is closed (i.e. unmounted) when no debounced query exists,
// when there are zero matches, or when the user dismisses it. SearchPage
// (the /search?q=... results page) is the rendering target for "all
// matches"; the autocomplete only previews the top 6.

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router"
import { Input } from "@/components/ui/input"
import { searchTools } from "@/features/search/lib/fuse"
import type { Tool } from "@/types"

const DEBOUNCE_MS = 300
const MAX_DROPDOWN = 6

export function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce: only update `debounced` after DEBOUNCE_MS of input quiet.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [query])

  // Click-outside: close the dropdown if the click lands outside our container.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const matches: Tool[] = debounced ? searchTools(debounced, MAX_DROPDOWN) : []

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Input
        type="search"
        placeholder="Search tools..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        aria-label="Search tools"
      />
      {open && matches.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50 max-h-80 overflow-auto"
        >
          {matches.map((t) => (
            <Link
              key={t.slug}
              to={`/tools/${t.slug}`}
              role="option"
              aria-selected={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-accent"
            >
              <img src={t.logo} alt="" className="h-6 w-6 rounded" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {t.tagline}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
