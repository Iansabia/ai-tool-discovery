// src/components/layout/Header.tsx
// Phase 2 / Plan 02-02 — auth-aware header.
// Phase 4 / polish — sticky liquid-glass + icon-led brand.
import { Link, NavLink, useNavigate } from "react-router"
import { toast } from "sonner"
import {
  Sparkles,
  LayoutGrid,
  Trophy,
  LogOut,
  UserCircle2,
  Heart,
  Plus,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { SearchBar } from "@/features/search/components/SearchBar"
import { cn } from "@/lib/utils"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
    isActive
      ? "text-primary font-medium bg-primary/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
  )

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, isGuest, currentUser, signOut } = useAuth()

  function onSignOut() {
    signOut()
    toast.success("Signed out")
    navigate("/", { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 glass-panel border-b">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground shrink-0"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-lg tracking-tight">AI&nbsp;Tools</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary">
          <NavLink to="/categories" className={navLinkClass}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Categories
          </NavLink>
          <NavLink to="/rankings" className={navLinkClass}>
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Rankings
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/favorites" className={navLinkClass}>
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favorites
            </NavLink>
          )}
          <NavLink to="/submit" className={navLinkClass}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Submit
          </NavLink>
        </nav>

        <div className="hidden md:block flex-1 max-w-sm">
          <SearchBar />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {isAuthenticated && !isGuest && (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/profile" className="gap-1.5">
                  <UserCircle2 className="h-4 w-4" />
                  <span
                    className="max-w-[8rem] truncate"
                    data-testid="header-display-name"
                  >
                    {currentUser?.displayName ?? "Account"}
                  </span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                data-testid="header-sign-out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline ml-1">Sign out</span>
              </Button>
            </>
          )}
          {isAuthenticated && isGuest && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Guest
              </span>
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
              <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent">
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
