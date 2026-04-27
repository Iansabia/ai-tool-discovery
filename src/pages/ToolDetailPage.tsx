// src/pages/ToolDetailPage.tsx
// Phase 3 / Plan 03-03 — URL-driven tool detail page.
//
// Structural correctness (the "everything is Claude" prototype bug class):
//   - useParams<{slug}>() is the SINGLE source of truth for which tool to render.
//   - TOOLS.find by slug; if no match, returns the NotFoundPage.
//   - No component-local state for "selected tool". Direct URL navigation to
//     /tools/<any-seed-slug> works without prior routing.
//
// Compose:
//   - Header row: logo + name + tagline + pricing badge + clickable category chip
//   - "Visit site" button: external <a target="_blank" rel="noopener noreferrer">
//   - Description paragraph
//   - Key features bulleted list
//   - Action row: Compare (Link to /compare/:slug) | Favorite (toast-wrapped) |
//                 Write Review (opens shadcn Dialog with placeholder body)
//   - Reviews list: subscribes reactively to useReviewStore.data[slug]; sorts
//     newest-first inside useMemo to keep the selector return ref stable
//
// Plan 03-04 will REPLACE the placeholder DialogContent body (the <p> child
// rendered just below DialogHeader) with a <WriteReviewDialog /> import.
// That single-line swap is the only change Plan 03-04 makes here.
//
// Reviews subscription pattern note (from interfaces in PLAN.md):
//   useReviewStore.listByTool() returns a NEW sorted array each call -> Zustand
//   warning if used directly as a selector. We subscribe to s.data[slug] (a
//   stable reference per store-state) and sort inside useMemo.

import { useState, useMemo } from "react"
import { useParams, Link } from "react-router"
import {
  Heart,
  ExternalLink,
  MessageSquarePlus,
  Columns2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TOOLS } from "@/data/tools"
import { CATEGORIES } from "@/data/categories"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useFavoritesStore } from "@/features/tools/store"
import { useReviewStore } from "@/features/reviews/store"
import { withToast } from "@/lib/withToast"
import NotFoundPage from "@/pages/NotFoundPage"
import { cn } from "@/lib/utils"

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = TOOLS.find((t) => t.slug === slug)

  // Reactive subscriptions are declared unconditionally — but tool may be
  // null on bad-slug URLs. Always subscribe with an empty key fallback so
  // hook order remains stable; gate rendering on `tool` afterward.
  const safeSlug = tool?.slug ?? ""
  const { userId } = useAuth()
  const isFav = useFavoritesStore((s) =>
    userId && safeSlug ? s.isFavorite(userId, safeSlug) : false,
  )
  // Subscribe to the slug's bucket directly. When the slug isn't a key on
  // s.data, the selector returns `undefined` (a stable primitive) — never a
  // freshly-allocated `[]`, which would cause Zustand to detect a new ref on
  // every store update and re-render in a loop.
  const reviewsRaw = useReviewStore((s) => s.data[safeSlug])
  const reviews = useMemo(
    () =>
      reviewsRaw
        ? [...reviewsRaw].sort((a, b) =>
            a.createdAt < b.createdAt ? 1 : -1,
          )
        : [],
    [reviewsRaw],
  )

  // Plan 03-04 will replace this state-driven open with the WriteReviewDialog
  // component (single-line swap: `<WriteReviewDialog tool={tool} ... />`).
  const [reviewOpen, setReviewOpen] = useState(false)

  if (!slug || !tool) return <NotFoundPage />

  const categoryName =
    CATEGORIES.find((c) => c.slug === tool.category)?.name ?? tool.category

  const onToggleFavorite = () => {
    if (!userId) return
    const next = !isFav
    withToast(
      () => useFavoritesStore.getState().toggle(userId, tool.slug),
      { success: next ? "Added to favorites" : "Removed from favorites" },
    )()
  }

  return (
    <section
      className="container mx-auto px-4 py-8"
      data-testid="page-tool-detail"
    >
      {/* Header row */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={tool.logo}
          alt={tool.name}
          className="h-16 w-16 rounded"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="text-muted-foreground">{tool.tagline}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{tool.pricing}</Badge>
            <Link to={`/categories/${tool.category}`}>
              <Badge variant="outline" className="cursor-pointer">
                {categoryName}
              </Badge>
            </Link>
          </div>
        </div>
        <a href={tool.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit site
          </Button>
        </a>
      </div>

      {/* Description */}
      <p className="mb-6">{tool.description}</p>

      {/* Features */}
      <h2 className="text-xl font-semibold mb-2">Key features</h2>
      <ul className="list-disc pl-6 mb-6">
        {tool.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {/* Action row */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link to={`/compare/${tool.slug}`}>
          <Button>
            <Columns2 className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={onToggleFavorite}
          aria-pressed={isFav}
          aria-label={
            isFav
              ? `Remove ${tool.name} from favorites`
              : `Favorite ${tool.name}`
          }
          disabled={!userId}
        >
          <Heart className={cn("h-4 w-4 mr-2", isFav && "fill-current")} />
          {isFav ? "Favorited" : "Favorite"}
        </Button>
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a review for {tool.name}</DialogTitle>
              <DialogDescription>
                Share your experience to help other students.
              </DialogDescription>
            </DialogHeader>
            {/* Plan 03-04 replaces this single line with <WriteReviewDialog /> body. */}
            <p className="text-sm text-muted-foreground">
              Review form lands in the next plan.
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews list */}
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No reviews yet. Be the first to write one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-baseline justify-between">
                  <div className="font-semibold">{r.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {"★".repeat(r.rating)}
                  </div>
                </div>
                {r.title && (
                  <div className="font-medium mt-1">{r.title}</div>
                )}
                <p className="text-sm mt-1">{r.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
