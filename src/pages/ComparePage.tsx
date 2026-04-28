// src/pages/ComparePage.tsx
// Phase 3 / Plan 03-05 — side-by-side comparison table.
//
// URL is the source of truth: /compare/:a/vs/:b. useParams + TOOLS.find drive
// rendering. NotFound when slugs invalid.
//
// Controls:
//   - Swap (rewrites URL to /compare/:b/vs/:a — URL stays the source of truth)
//   - Change A / Change B (routes to /compare/:keptSide picker)
//   - Save comparison (persists pair via useSavedComparisonsStore + toast)
//
// COMP-06: rows where left === right are toned down with `opacity-50 text-muted-foreground`.
// CT15: 9-combination test verifies URL-as-truth across {claude, chatgpt, midjourney} × {cursor, dalle, github-copilot}.

import { useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router"
import { ArrowLeftRight, Bookmark, ExternalLink, Columns2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TOOLS } from "@/data/tools"
import { CATEGORIES } from "@/data/categories"
import { useUpvoteStore } from "@/features/rankings/store"
import { useSavedComparisonsStore } from "@/features/compare/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { withToast } from "@/lib/withToast"
import NotFoundPage from "@/pages/NotFoundPage"
import { cn } from "@/lib/utils"
import type { Tool } from "@/types"

interface Row {
  label: string
  a: React.ReactNode
  b: React.ReactNode
  /** Set true when both sides have the same plain-text value (drives COMP-06 muted styling). */
  match: boolean
}

function buildRows(toolA: Tool, toolB: Tool, netA: number, netB: number): Row[] {
  const catA =
    CATEGORIES.find((c) => c.slug === toolA.category)?.name ?? toolA.category
  const catB =
    CATEGORIES.find((c) => c.slug === toolB.category)?.name ?? toolB.category
  return [
    {
      label: "Pricing",
      a: toolA.pricing,
      b: toolB.pricing,
      match: toolA.pricing === toolB.pricing,
    },
    {
      label: "Category",
      a: catA,
      b: catB,
      match: catA === catB,
    },
    {
      label: "Rating",
      a: `${toolA.rating.toFixed(1)} ★`,
      b: `${toolB.rating.toFixed(1)} ★`,
      match: toolA.rating.toFixed(1) === toolB.rating.toFixed(1),
    },
    {
      label: "Net upvotes",
      a: String(netA),
      b: String(netB),
      match: netA === netB,
    },
    {
      label: "Key features",
      a: (
        <ul className="list-disc pl-4 text-sm">
          {toolA.features.slice(0, 5).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
      b: (
        <ul className="list-disc pl-4 text-sm">
          {toolB.features.slice(0, 5).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
      match: false, // ReactNode features are excluded from match-based styling
    },
    {
      label: "Website",
      a: (
        <a
          href={toolA.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          {new URL(toolA.url).hostname}
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      ),
      b: (
        <a
          href={toolB.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          {new URL(toolB.url).hostname}
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      ),
      match: false,
    },
  ]
}

export default function ComparePage() {
  const { a, b } = useParams<{ a: string; b: string }>()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"

  const toolA = TOOLS.find((t) => t.slug === a)
  const toolB = TOOLS.find((t) => t.slug === b)

  // Subscribe BEFORE conditional return — hook order must stay stable.
  const netA = useUpvoteStore((s) => {
    let n = 0
    if (!a) return 0
    for (const userMap of Object.values(s.data)) {
      const v = userMap[a]
      if (v === "up") n += 1
      else if (v === "down") n -= 1
    }
    return n
  })
  const netB = useUpvoteStore((s) => {
    let n = 0
    if (!b) return 0
    for (const userMap of Object.values(s.data)) {
      const v = userMap[b]
      if (v === "up") n += 1
      else if (v === "down") n -= 1
    }
    return n
  })

  // Dev assertion if a === b (CONTEXT.md says warn, don't crash).
  useEffect(() => {
    if (a && b && a === b && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[Compare] a === b (${a}). Did you mean to compare two different tools?`)
    }
  }, [a, b])

  if (!a || !b || !toolA || !toolB) return <NotFoundPage />

  const rows = buildRows(toolA, toolB, netA, netB)

  function onSwap() {
    navigate(`/compare/${b}/vs/${a}`, { replace: true })
  }

  function onSave() {
    if (!a || !b) return
    withToast(
      () => useSavedComparisonsStore.getState().add(effectiveUserId, a, b),
      { success: "Comparison saved" },
    )()
  }

  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-compare">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            <Columns2 className="h-3.5 w-3.5 text-primary" />
            Side-by-side
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {toolA.name} <span className="text-muted-foreground font-normal">vs</span>{" "}
            {toolB.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Differences highlighted, similarities dimmed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSwap} aria-label="Swap sides" className="glass-card">
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
          <Button
            onClick={onSave}
            aria-label="Save comparison"
            className="bg-gradient-to-r from-primary to-accent shadow shadow-primary/20"
          >
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border glass-card">
        <table
          className="w-full border-collapse"
          data-testid="compare-table"
        >
          <thead>
            <tr>
              <th className="w-32 p-3 text-left text-sm font-medium text-muted-foreground"></th>
              <th className="p-3 text-left">
                <div className="flex items-center gap-2">
                  <img src={toolA.logo} alt="" className="h-8 w-8 rounded" />
                  <Link
                    to={`/tools/${toolA.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {toolA.name}
                  </Link>
                  <Badge variant="outline" asChild>
                    <Link to={`/compare/${toolB.slug}`} aria-label="Change tool A">
                      Change
                    </Link>
                  </Badge>
                </div>
              </th>
              <th className="p-3 text-left">
                <div className="flex items-center gap-2">
                  <img src={toolB.logo} alt="" className="h-8 w-8 rounded" />
                  <Link
                    to={`/tools/${toolB.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {toolB.name}
                  </Link>
                  <Badge variant="outline" asChild>
                    <Link to={`/compare/${toolA.slug}`} aria-label="Change tool B">
                      Change
                    </Link>
                  </Badge>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                data-match={row.match}
                className={cn(
                  "border-t",
                  row.match && "opacity-50 text-muted-foreground",
                )}
              >
                <td className="p-3 align-top text-sm font-medium">
                  {row.label}
                </td>
                <td className="p-3 align-top">{row.a}</td>
                <td className="p-3 align-top">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="mt-6">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Save this comparison to your profile to revisit it later.
        </CardContent>
      </Card>
    </section>
  )
}
