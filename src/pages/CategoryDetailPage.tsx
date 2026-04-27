// src/pages/CategoryDetailPage.tsx
// Phase 3 / Plan 03-02 — per-category list page.
//
// URL-driven: useParams<{slug}>() is the source of truth. Invalid slugs render
// the NotFound state directly (no redirect — preserves browser-history /
// shareable-URL semantics). Empty state ships in the same commit as the list
// (won't fire with seed data, but enforced for resilience).

import { Link, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { ToolCard } from "@/features/tools/components/ToolCard"
import { CATEGORIES } from "@/data/categories"
import { TOOLS } from "@/data/tools"
import NotFoundPage from "@/pages/NotFoundPage"

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = CATEGORIES.find((c) => c.slug === slug)

  if (!category) {
    return <NotFoundPage />
  }

  const tools = TOOLS.filter((t) => t.category === category.slug)

  return (
    <section
      className="container mx-auto px-4 py-6"
      data-testid="page-category-detail"
    >
      <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
      <p className="mb-6 text-muted-foreground">{category.description}</p>

      {tools.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg">No tools in this category yet.</p>
          <Link to="/categories">
            <Button>Browse all categories</Button>
          </Link>
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
