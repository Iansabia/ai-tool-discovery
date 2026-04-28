// src/pages/HomePage.tsx
// Phase 3 / Plan 03-02 + Phase 4 polish — personalized home surface.

import { Link } from "react-router"
import { Sparkles, Trophy, ArrowRight, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToolCard } from "@/features/tools/components/ToolCard"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useUsersStore } from "@/features/auth/store"
import { TOOLS } from "@/data/tools"
import { CATEGORIES } from "@/data/categories"
import type { CategorySlug } from "@/types"

const RECOMMENDATION_LIMIT = 9

export default function HomePage() {
  const { userId, isGuest } = useAuth()
  const user = useUsersStore((s) => (userId ? s.findById(userId) : undefined))
  const interests: CategorySlug[] = user?.interests ?? []

  const categoryNameBySlug = new Map(CATEGORIES.map((c) => [c.slug, c.name]))

  const recommendations = TOOLS.filter((t) =>
    t.categories.some((c) => interests.includes(c)),
  ).slice(0, RECOMMENDATION_LIMIT)

  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-home">
      {/* Hero greeting */}
      <header className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {isGuest ? "Browsing as guest" : "For you"}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Welcome back
            {user?.displayName ? (
              <span className="gradient-text">, {user.displayName}</span>
            ) : (
              ""
            )}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Picks based on your selected interests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="glass-card">
            <Link to="/rankings">
              <Trophy className="h-4 w-4" />
              Top ranked
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="glass-card">
            <Link to="/categories">
              <LayoutGrid className="h-4 w-4" />
              Categories
            </Link>
          </Button>
        </div>
      </header>

      {interests.length === 0 ? (
        <Card className="glass-card border">
          <CardContent className="py-16 text-center space-y-4">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-lg">You haven't picked any interests yet.</p>
            <p className="text-sm text-muted-foreground">
              Tell us what you're interested in to get personalized recommendations.
            </p>
            <Button asChild>
              <Link to="/onboarding/interests">
                Pick interests
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="glass-card border">
          <CardContent className="py-16 text-center space-y-4">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-lg">No tools match your interests yet.</p>
            <Button asChild>
              <Link to="/categories">Browse all categories</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((tool) => {
            // Pick the first interest the user has that this tool also belongs to.
            const matchedCategory =
              tool.categories.find((c) => interests.includes(c)) ?? tool.category
            return (
            <ToolCard
              key={tool.slug}
              tool={tool}
              recommendedBecause={
                categoryNameBySlug.get(matchedCategory) ?? matchedCategory
              }
            />
            )
          })}
        </div>
      )}
    </section>
  )
}
