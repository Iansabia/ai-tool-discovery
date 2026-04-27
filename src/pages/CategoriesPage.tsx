// src/pages/CategoriesPage.tsx
// Phase 3 / Plan 03-02 — browse-all index. Renders every category as a card
// with a derived tool-count and links to /categories/:slug.
//
// Count is computed at render via TOOLS.filter — small dataset (50 tools), no
// memoization needed. Phase 4 polish can lift the count map if perf demands it.

import { Link } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIES } from "@/data/categories"
import { TOOLS } from "@/data/tools"

export default function CategoriesPage() {
  return (
    <section
      className="container mx-auto px-4 py-6"
      data-testid="page-categories"
    >
      <h1 className="mb-6 text-3xl font-bold">Categories</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const count = TOOLS.filter((t) => t.category === category.slug).length
          return (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="font-semibold">{category.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.description}
                  </div>
                  <div className="mt-2 text-xs">
                    {count} tool{count === 1 ? "" : "s"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
