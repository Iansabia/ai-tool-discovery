// src/components/layout/Header.tsx
// Phase 1 / Plan 01-04 — header stub: brand link + nav stubs + ThemeToggle.
// Real search bar + auth nav land in Phase 2 / Phase 3.
import { Link, NavLink } from "react-router"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-primary font-medium"
    : "text-muted-foreground hover:text-foreground transition-colors"

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold text-foreground">
          AI&nbsp;Tools
        </Link>
        <nav className="flex items-center gap-6 text-sm" aria-label="Primary">
          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
          <NavLink to="/rankings" className={navLinkClass}>
            Rankings
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Search
          </NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
