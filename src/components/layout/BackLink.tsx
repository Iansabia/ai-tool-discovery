// src/components/layout/BackLink.tsx
// Phase 4 polish — global "Back" affordance.
//
// On most routes we want to go back to wherever the user came from. Browser
// history is the right answer when there IS a previous entry inside the app
// (idx > 0); otherwise we route to a safe per-page fallback. This avoids the
// classic "back goes to google.com" problem on direct URL loads.

import { useLocation, useNavigate, Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackLinkProps {
  /** Route to navigate to when there is no in-app history. Defaults to "/home". */
  fallback?: string
  /** Override label. Defaults to "Back". */
  label?: string
  /** Hide on certain routes (e.g. landing page). Default false. */
  className?: string
}

export function BackLink({ fallback = "/home", label = "Back", className }: BackLinkProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // react-router exposes the history index via location.key + state.idx.
  // The simplest reliable check: history.length > 1 plus a referrer that
  // came from this same origin. We also use a state hint set by Link clicks.
  const hasInAppHistory =
    typeof window !== "undefined" &&
    window.history.length > 1 &&
    (document.referrer === "" || document.referrer.startsWith(window.location.origin))

  function onClick(e: React.MouseEvent) {
    if (hasInAppHistory) {
      e.preventDefault()
      navigate(-1)
    }
    // Otherwise let the Link navigate to the fallback.
  }

  // Don't render on the route we'd fall back to (avoids "Back to /home" while on /home).
  if (location.pathname === fallback || location.pathname === "/") return null

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={className ?? "mb-4 -ml-2"}
    >
      <Link to={fallback} onClick={onClick} aria-label={label}>
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
