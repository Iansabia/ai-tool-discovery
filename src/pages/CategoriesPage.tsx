// src/pages/CategoriesPage.tsx
// Phase 3 / Plan 03-02 + Phase 4 polish — category index with icons + glass cards.

import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES } from "@/data/categories"
import { TOOLS } from "@/data/tools"
import { CategoryIcon } from "@/lib/category-icon"

export default function CategoriesPage() {
  return (
    <section
      className="container mx-auto px-4 py-12"
      data-testid="page-categories"
    >
      <header className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse the directory by what you want to build.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const count = TOOLS.filter((t) => t.category === category.slug).length
          return (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="glass-card h-full border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-inset ring-border">
                      <CategoryIcon
                        slug={category.slug}
                        className="h-6 w-6 text-foreground"
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count} tool{count === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{category.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5" />
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
