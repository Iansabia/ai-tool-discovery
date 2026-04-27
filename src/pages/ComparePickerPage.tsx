// src/pages/ComparePickerPage.tsx
// Phase 3 / Plan 03-05 — picker step for the compare flow.
//
// Routes to /compare/:a where :a is the origin tool slug. Renders a searchable
// grid of all OTHER tools. Selecting a second tool routes to /compare/:a/vs/:b.

import { useState, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TOOLS } from "@/data/tools"
import NotFoundPage from "@/pages/NotFoundPage"

export default function ComparePickerPage() {
  const { a } = useParams<{ a: string }>()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const origin = TOOLS.find((t) => t.slug === a)
  if (!a || !origin) return <NotFoundPage />

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOLS.filter((t) => t.slug !== a).filter((t) => {
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    })
  }, [a, query])

  return (
    <section
      className="container mx-auto px-4 py-8"
      data-testid="page-compare-picker"
    >
      <header className="mb-6">
        <Button variant="ghost" asChild className="mb-2">
          <Link to={`/tools/${origin.slug}`}>← Back to {origin.name}</Link>
        </Button>
        <h1 className="text-3xl font-bold">
          Compare {origin.name} with…
        </h1>
        <p className="text-muted-foreground mt-1">
          Pick a second tool to compare side by side.
        </p>
      </header>

      <Input
        type="search"
        placeholder="Search tools by name, tagline, or category"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md mb-6"
        aria-label="Search tools"
      />

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No tools matched your search.
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          data-testid="compare-picker-grid"
        >
          {candidates.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => navigate(`/compare/${origin.slug}/vs/${t.slug}`)}
              className="text-left"
              data-testid={`compare-pick-${t.slug}`}
            >
              <Card className="h-full hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <img src={t.logo} alt={t.name} className="h-12 w-12 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{t.name}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {t.tagline}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{t.pricing}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
