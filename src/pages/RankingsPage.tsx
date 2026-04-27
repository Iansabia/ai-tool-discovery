// src/pages/RankingsPage.tsx
// Phase 3 / Plan 03-04 — community rankings of all 50 tools.
//
// Sort: net upvotes DESC; ties broken by total vote count DESC, then by name ASC.
// Subscribe to useUpvoteStore.data so the list reorders reactively after a vote.

import { useMemo } from "react"
import { Link } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TOOLS } from "@/data/tools"
import { CATEGORIES } from "@/data/categories"
import { useUpvoteStore } from "@/features/rankings/store"
import { VoteButton } from "@/features/rankings/components/VoteButton"

interface Ranked {
  slug: string
  name: string
  tagline: string
  category: string
  pricing: string
  logo: string
  net: number
  total: number
}

export default function RankingsPage() {
  const data = useUpvoteStore((s) => s.data)

  const ranked: Ranked[] = useMemo(() => {
    const counts: Record<string, { up: number; down: number }> = {}
    for (const userMap of Object.values(data)) {
      for (const [slug, vote] of Object.entries(userMap)) {
        counts[slug] ??= { up: 0, down: 0 }
        if (vote === "up") counts[slug]!.up += 1
        else if (vote === "down") counts[slug]!.down += 1
      }
    }
    const rows = TOOLS.map((t) => {
      const c = counts[t.slug] ?? { up: 0, down: 0 }
      return {
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        category: t.category,
        pricing: t.pricing,
        logo: t.logo,
        net: c.up - c.down,
        total: c.up + c.down,
      }
    })
    rows.sort((a, b) => {
      if (b.net !== a.net) return b.net - a.net
      if (b.total !== a.total) return b.total - a.total
      return a.name.localeCompare(b.name)
    })
    return rows
  }, [data])

  const hasAnyVotes = ranked.some((r) => r.total > 0)

  return (
    <section className="container mx-auto px-4 py-8" data-testid="page-rankings">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Rankings</h1>
        <p className="text-muted-foreground mt-1">
          {hasAnyVotes
            ? "Tools the community has voted on, sorted by net upvotes."
            : "No votes yet — cast a vote to see rankings move."}
        </p>
      </header>

      <ol className="space-y-2" data-testid="rankings-list">
        {ranked.map((r, idx) => {
          const categoryName =
            CATEGORIES.find((c) => c.slug === r.category)?.name ?? r.category
          return (
            <li key={r.slug} data-testid={`rank-row-${r.slug}`}>
              <Card>
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="text-lg font-semibold w-8 text-center text-muted-foreground tabular-nums">
                    {idx + 1}
                  </div>
                  <VoteButton slug={r.slug} size="sm" />
                  <img src={r.logo} alt={r.name} className="h-10 w-10 rounded" />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tools/${r.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {r.name}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      {r.tagline}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Badge variant="outline">{categoryName}</Badge>
                    <Badge variant="secondary">{r.pricing}</Badge>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
