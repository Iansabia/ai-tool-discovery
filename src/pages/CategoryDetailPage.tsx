// src/pages/CategoryDetailPage.tsx
// Phase 3 / Plan 03-02 + Phase 4 polish — category detail with icon hero.

import { Link, useParams } from "react-router"
import { ArrowLeft, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToolCard } from "@/features/tools/components/ToolCard"
import { CATEGORIES } from "@/data/categories"
import { TOOLS } from "@/data/tools"
import { CategoryIcon } from "@/lib/category-icon"
import NotFoundPage from "@/pages/NotFoundPage"

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = CATEGORIES.find((c) => c.slug === slug)

  if (!category) {
    return <NotFoundPage />
  }

  const tools = TOOLS.filter((t) => t.categories.includes(category.slug))

  return (
    <section
      className="container mx-auto px-4 py-12"
      data-testid="page-category-detail"
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/categories">
          <ArrowLeft className="h-4 w-4" />
          All categories
        </Link>
      </Button>

      <header className="mb-8 flex items-start gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-inset ring-border">
          <CategoryIcon
            slug={category.slug}
            className="h-8 w-8 text-foreground"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
            <Badge variant="outline" className="ml-2">
              {tools.length} tool{tools.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{category.description}</p>
        </div>
      </header>

      {tools.length === 0 ? (
        <div className="rounded-xl border glass-card py-16 text-center">
          <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="mb-4 text-lg">No tools in this category yet.</p>
          <Button asChild>
            <Link to="/categories">Browse all categories</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </section>
  )
}
