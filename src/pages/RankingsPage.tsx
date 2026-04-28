// src/pages/RankingsPage.tsx
// Phase 3 / Plan 03-04 + Phase 4 polish — glass rankings + trophy/medal icons.

import { useMemo } from "react"
import { Link } from "react-router"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TOOLS } from "@/data/tools"
import { CATEGORIES } from "@/data/categories"
import { useUpvoteStore } from "@/features/rankings/store"
import { VoteButton } from "@/features/rankings/components/VoteButton"
import { CategoryIcon } from "@/lib/category-icon"
import { cn } from "@/lib/utils"

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

function rankIcon(idx: number) {
  if (idx === 0) return { Icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" }
  if (idx === 1) return { Icon: Medal, color: "text-zinc-400", bg: "bg-zinc-400/10" }
  if (idx === 2) return { Icon: Award, color: "text-orange-500", bg: "bg-orange-500/10" }
  return null
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
    <section className="container mx-auto px-4 py-12" data-testid="page-rankings">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          Community ranked
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Rankings</h1>
        <p className="mt-2 text-muted-foreground">
          {hasAnyVotes
            ? "Tools the community has voted on, sorted by net upvotes."
            : "No votes yet — cast a vote to see rankings move."}
        </p>
      </header>

      <ol className="space-y-2" data-testid="rankings-list">
        {ranked.map((r, idx) => {
          const categoryName =
            CATEGORIES.find((c) => c.slug === r.category)?.name ?? r.category
          const podium = rankIcon(idx)
          return (
            <li key={r.slug} data-testid={`rank-row-${r.slug}`}>
              <Card
                className={cn(
                  "glass-card border",
                  idx < 3 && "ring-1 ring-primary/20",
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 w-10">
                    {podium ? (
                      <div
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-full",
                          podium.bg,
                        )}
                      >
                        <podium.Icon className={cn("h-5 w-5", podium.color)} />
                      </div>
                    ) : (
                      <span className="text-base font-semibold text-muted-foreground tabular-nums">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <VoteButton slug={r.slug} size="sm" />
                  <img
                    src={r.logo}
                    alt=""
                    className="h-12 w-12 rounded-xl ring-1 ring-inset ring-border bg-white shrink-0"
                  />
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
                  <div className="hidden md:flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CategoryIcon
                        slug={r.category as never}
                        className="h-3 w-3"
                      />
                      {categoryName}
                    </Badge>
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
