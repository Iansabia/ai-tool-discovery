// src/pages/FavoritesPage.tsx
// Phase 3 / Plan 03-07 — favorites grid for the current user.
import { useMemo } from "react"
import { Link } from "react-router"
import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TOOLS } from "@/data/tools"
import { useFavoritesStore } from "@/features/tools/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ToolCard } from "@/features/tools/components/ToolCard"

export default function FavoritesPage() {
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"
  const favoriteSlugsRaw = useFavoritesStore((s) => s.data[effectiveUserId])

  const tools = useMemo(() => {
    const bySlug = new Map(TOOLS.map((t) => [t.slug, t]))
    return (favoriteSlugsRaw ?? [])
      .map((s) => bySlug.get(s))
      .filter((t): t is (typeof TOOLS)[number] => Boolean(t))
  }, [favoriteSlugsRaw])

  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-favorites">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            Saved
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Favorites</h1>
          <p className="mt-2 text-muted-foreground">
            Tools you have hearted across the directory.
          </p>
        </div>
        {tools.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {tools.length} tool{tools.length === 1 ? "" : "s"}
          </span>
        )}
      </header>

      {tools.length === 0 ? (
        <Card className="glass-card border">
          <CardContent className="py-16 text-center space-y-4">
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-rose-500/10">
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
            <p className="text-lg font-semibold">No favorites yet</p>
            <p className="text-sm text-muted-foreground">
              Browse tools and tap the heart to save them here.
            </p>
            <Button asChild>
              <Link to="/categories">
                Browse tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          data-testid="favorites-grid"
        >
          {tools.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      )}
    </section>
  )
}
