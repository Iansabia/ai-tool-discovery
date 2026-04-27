// src/features/tools/components/ToolCard.tsx
// Phase 3 / Plan 03-01 — canonical tool card component.
//
// Single rendering primitive every list in Phase 3 uses (search, categories,
// favorites, rankings, home). Renders logo + name + tagline + pricing badge +
// category chip + favorite heart. Click-through to /tools/{slug}.
//
// Auth coupling: uses useAuth() (NOT useAuthStore directly) for userId.
// Favorite write: wraps useFavoritesStore.toggle in withToast for consistent
// "Added to favorites" / "Removed from favorites" wording.
//
// When signed out (userId === null), the heart is disabled — we never persist
// favorites under a null userId.

import * as React from "react"
import { Link } from "react-router"
import { Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useFavoritesStore } from "@/features/tools/store"
import { withToast } from "@/lib/withToast"
import type { Tool } from "@/types"

export interface ToolCardProps {
  tool: Tool
  /**
   * Optional context line (e.g. "Recommended because you picked Writing").
   * Rendered between the tagline row and the badges row when present.
   * Used by /home recommendations; absent on /search, /categories, /favorites.
   */
  recommendedBecause?: string
}

export function ToolCard({ tool, recommendedBecause }: ToolCardProps) {
  const { userId } = useAuth()
  const isFav = useFavoritesStore((s) =>
    userId ? s.isFavorite(userId, tool.slug) : false,
  )

  const onToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent navigation: even though the button sits outside the <Link>, we
    // belt-and-suspenders against future layouts that nest it inside.
    e.preventDefault()
    e.stopPropagation()
    if (!userId) return // signed-out — no-op (button is also disabled)
    const next = !isFav
    withToast(
      () => useFavoritesStore.getState().toggle(userId, tool.slug),
      { success: next ? "Added to favorites" : "Removed from favorites" },
    )()
  }

  return (
    <Card className="relative">
      <Link
        to={`/tools/${tool.slug}`}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-3">
            <img
              src={tool.logo}
              alt={tool.name}
              className="h-10 w-10 rounded"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{tool.name}</div>
              <div className="truncate text-sm text-muted-foreground">
                {tool.tagline}
              </div>
            </div>
          </div>
          {recommendedBecause && (
            <div className="text-xs text-muted-foreground">
              Recommended because you picked{" "}
              <span className="font-medium">{recommendedBecause}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{tool.pricing}</Badge>
            <Badge variant="outline">{tool.category}</Badge>
          </div>
        </CardContent>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={
          isFav
            ? `Remove ${tool.name} from favorites`
            : `Favorite ${tool.name}`
        }
        aria-pressed={isFav}
        onClick={onToggleFavorite}
        disabled={!userId}
        className="absolute top-2 right-2"
      >
        <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
      </Button>
    </Card>
  )
}
