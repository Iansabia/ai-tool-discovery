// src/features/tools/components/ToolCard.tsx
// Phase 3 / Plan 03-01 + Phase 4 polish — glass tool card with category icon.

import * as React from "react"
import { Link } from "react-router"
import { Heart, Star, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useFavoritesStore } from "@/features/tools/store"
import { withToast } from "@/lib/withToast"
import { CategoryIcon } from "@/lib/category-icon"
import { CATEGORIES } from "@/data/categories"
import type { Tool } from "@/types"

export interface ToolCardProps {
  tool: Tool
  recommendedBecause?: string
}

export function ToolCard({ tool, recommendedBecause }: ToolCardProps) {
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"
  const isFav = useFavoritesStore((s) =>
    s.isFavorite(effectiveUserId, tool.slug),
  )
  const categoryName =
    CATEGORIES.find((c) => c.slug === tool.category)?.name ?? tool.category

  const onToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !isFav
    withToast(
      () => useFavoritesStore.getState().toggle(effectiveUserId, tool.slug),
      { success: next ? "Added to favorites" : "Removed from favorites" },
    )()
  }

  return (
    <Card className="relative group glass-card border h-full">
      <Link
        to={`/tools/${tool.slug}`}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring h-full"
      >
        <CardContent className="flex flex-col gap-3 p-5 h-full">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={tool.logo}
                alt=""
                className="h-12 w-12 rounded-xl ring-1 ring-inset ring-border bg-white"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold leading-tight">
                {tool.name}
              </div>
              <div className="line-clamp-2 text-sm text-muted-foreground mt-1">
                {tool.tagline}
              </div>
            </div>
          </div>

          {recommendedBecause && (
            <div className="inline-flex items-center gap-1.5 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span className="text-muted-foreground">
                Because you picked{" "}
                <span className="font-medium text-foreground">
                  {recommendedBecause}
                </span>
              </span>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-medium" title={tool.priceLabel}>
              {tool.priceLabel}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CategoryIcon
                slug={tool.category}
                className="h-3 w-3"
              />
              {categoryName}
            </Badge>
            <span className="ml-auto inline-flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {tool.rating.toFixed(1)}
            </span>
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
        className="absolute top-3 right-3 h-8 w-8 backdrop-blur-sm bg-background/60 hover:bg-background/90"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isFav && "fill-rose-500 text-rose-500",
          )}
        />
      </Button>
    </Card>
  )
}
