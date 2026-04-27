// src/pages/SearchPage.tsx
// Phase 3 / Plan 03-03 — /search?q=... results page.
//
// URL is the source of truth: `q` lives in the query string, never in
// component state. Three render paths:
//   1. No q   → "Type a query in the header to search."
//   2. q matches → grid of ToolCards
//   3. q has zero matches → "No tools matched ..." + 3 popular-category fallback chips
//
// The fallback chips link into /categories/:slug, which Plan 03-02 ships.
// (If 03-02 hasn't landed yet, the link still routes; the destination is
// just a placeholder. URL contract is what we lock in now.)
import { useSearchParams, Link } from "react-router"
import { ToolCard } from "@/features/tools/components/ToolCard"
import { Badge } from "@/components/ui/badge"
import { searchTools } from "@/features/search/lib/fuse"
import { CATEGORIES } from "@/data/categories"

const FALLBACK_CATEGORIES = CATEGORIES.slice(0, 3) // writing, coding, research

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get("q") ?? ""

  if (!q.trim()) {
    return (
      <section
        className="container mx-auto px-4 py-12 text-center"
        data-testid="page-search"
      >
        <p className="text-lg">Type a query in the header to search.</p>
      </section>
    )
  }

  const results = searchTools(q)

  if (results.length === 0) {
    return (
      <section
        className="container mx-auto px-4 py-12 text-center"
        data-testid="page-search"
      >
        <p className="text-lg mb-4">No tools matched &quot;{q}&quot;</p>
        <p className="text-sm text-muted-foreground mb-4">
          Try one of these popular categories:
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {FALLBACK_CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/categories/${c.slug}`}>
              <Badge variant="outline" className="cursor-pointer">
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8" data-testid="page-search">
      <h1 className="text-2xl font-bold mb-4">
        {results.length} result{results.length === 1 ? "" : "s"} for &quot;{q}
        &quot;
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  )
}
