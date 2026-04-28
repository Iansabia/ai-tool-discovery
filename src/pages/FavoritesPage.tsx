// src/pages/FavoritesPage.tsx
// Phase 3 / Plan 03-07 — favorites grid for the current user.
import { useMemo } from "react"
import { Link } from "react-router"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TOOLS } from "@/data/tools"
import { useFavoritesStore } from "@/features/tools/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ToolCard } from "@/features/tools/components/ToolCard"

export default function FavoritesPage() {
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"
  // Subscribe to the bucket directly. When the userId is missing from data,
  // the selector returns `undefined` (stable) instead of a fresh [] (ref
  // changes every call → infinite render loop).
  const favoriteSlugsRaw = useFavoritesStore((s) => s.data[effectiveUserId])

  const tools = useMemo(() => {
    const bySlug = new Map(TOOLS.map((t) => [t.slug, t]))
    return (favoriteSlugsRaw ?? [])
      .map((s) => bySlug.get(s))
      .filter((t): t is (typeof TOOLS)[number] => Boolean(t))
  }, [favoriteSlugsRaw])

  return (
    <section className="container mx-auto px-4 py-8" data-testid="page-favorites">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-muted-foreground mt-1">
          Tools you have hearted across the directory.
        </p>
      </header>

      {tools.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg">No favorites yet</p>
            <p className="text-sm text-muted-foreground">
              Browse tools and tap the heart to save them here.
            </p>
            <Button asChild>
              <Link to="/categories">Browse tools</Link>
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
