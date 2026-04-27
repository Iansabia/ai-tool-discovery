// src/components/layout/Header.tsx
// Phase 2 / Plan 02-02 — auth-aware header.
//
// Affordances:
// - Authenticated real user: shows truncated displayName + "Sign out" button.
// - Guest session:           shows "Guest" label + "Sign in" link (primary CTA).
// - Unauthenticated:         shows "Sign in" + "Sign up" links.
//
// The ThemeToggle is preserved from Phase 1.
import { Link, NavLink, useNavigate } from "react-router"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { SearchBar } from "@/features/search/components/SearchBar"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-primary font-medium"
    : "text-muted-foreground hover:text-foreground transition-colors"

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, isGuest, currentUser, signOut } = useAuth()

  function onSignOut() {
    signOut()
    toast.success("Signed out")
    navigate("/", { replace: true })
  }

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
        <div className="hidden md:block flex-1 max-w-sm mx-4">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && !isGuest && (
            <>
              <span
                className="max-w-[10rem] truncate text-sm text-muted-foreground"
                title={currentUser?.displayName ?? undefined}
                data-testid="header-display-name"
              >
                {currentUser?.displayName ?? "Account"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                data-testid="header-sign-out"
              >
                Sign out
              </Button>
            </>
          )}
          {isAuthenticated && isGuest && (
            <>
              <span className="text-sm text-muted-foreground">Guest</span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign in</Link>
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
