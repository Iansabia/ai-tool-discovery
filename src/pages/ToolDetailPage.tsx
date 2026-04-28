// src/pages/ToolDetailPage.tsx
// Phase 3 / Plan 03-03 + Phase 4 polish — glass tool detail with rich icons.

import { useState, useMemo } from "react"
import { useParams, Link } from "react-router"
import {
  Heart,
  ExternalLink,
  MessageSquarePlus,
  Columns2,
  Star,
  CheckCircle2,
  ArrowLeft,
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
import { useUpvoteStore } from "@/features/rankings/store"
import { WriteReviewDialog } from "@/features/reviews/components/WriteReviewDialog"
import { CategoryIcon } from "@/lib/category-icon"
import { withToast } from "@/lib/withToast"
import NotFoundPage from "@/pages/NotFoundPage"
import { cn } from "@/lib/utils"

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= full
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
      <span className="ml-1.5 text-sm text-muted-foreground tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = TOOLS.find((t) => t.slug === slug)
  const safeSlug = tool?.slug ?? ""
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"
  const isFav = useFavoritesStore((s) =>
    safeSlug ? s.isFavorite(effectiveUserId, safeSlug) : false,
  )
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
  const netVotes = useUpvoteStore((s) => {
    if (!safeSlug) return 0
    let n = 0
    for (const userMap of Object.values(s.data)) {
      const v = userMap[safeSlug]
      if (v === "up") n += 1
      else if (v === "down") n -= 1
    }
    return n
  })

  const [reviewOpen, setReviewOpen] = useState(false)

  if (!slug || !tool) return <NotFoundPage />

  const categoryName =
    CATEGORIES.find((c) => c.slug === tool.category)?.name ?? tool.category

  const onToggleFavorite = () => {
    const next = !isFav
    withToast(
      () => useFavoritesStore.getState().toggle(effectiveUserId, tool.slug),
      { success: next ? "Added to favorites" : "Removed from favorites" },
    )()
  }

  return (
    <section
      className="container mx-auto px-4 py-12"
      data-testid="page-tool-detail"
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/categories">
          <ArrowLeft className="h-4 w-4" />
          All categories
        </Link>
      </Button>

      {/* Hero card */}
      <Card className="glass-card border mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={tool.logo}
              alt=""
              className="h-20 w-20 rounded-2xl ring-1 ring-inset ring-border bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {tool.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {tool.tagline}
              </p>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Badge variant="secondary" className="font-medium">
                  {tool.pricing}
                </Badge>
                <Link to={`/categories/${tool.category}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1 hover:bg-muted"
                  >
                    <CategoryIcon
                      slug={tool.category}
                      className="h-3 w-3"
                    />
                    {categoryName}
                  </Badge>
                </Link>
                <StarRating rating={tool.rating} />
                {netVotes !== 0 && (
                  <Badge variant="outline" className="ml-auto">
                    {netVotes > 0 ? "+" : ""}
                    {netVotes} community votes
                  </Badge>
                )}
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0 glass-card">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Visit site
              </a>
            </Button>
          </div>

          {/* Action row */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-accent shadow shadow-primary/20"
            >
              <Link to={`/compare/${tool.slug}`}>
                <Columns2 className="h-4 w-4" />
                Compare
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={onToggleFavorite}
              aria-pressed={isFav}
              aria-label={
                isFav
                  ? `Remove ${tool.name} from favorites`
                  : `Favorite ${tool.name}`
              }
              className={cn(isFav && "border-rose-300 bg-rose-50 dark:bg-rose-950/20")}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isFav && "fill-rose-500 text-rose-500",
                )}
              />
              {isFav ? "Favorited" : "Favorite"}
            </Button>
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquarePlus className="h-4 w-4" />
                  Write review
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel">
                <DialogHeader>
                  <DialogTitle>Write a review for {tool.name}</DialogTitle>
                  <DialogDescription>
                    Share your experience to help other students.
                  </DialogDescription>
                </DialogHeader>
                <WriteReviewDialog
                  tool={tool}
                  onSuccess={() => setReviewOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Key features</h2>
              <ul className="space-y-2">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {reviews.length === 0 ? (
            <Card className="glass-card border">
              <CardContent className="p-6 text-center space-y-2">
                <MessageSquarePlus className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first to write one.
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((r) => (
              <Card key={r.id} className="glass-card border">
                <CardContent className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold truncate">{r.username}</div>
                    <div className="text-sm text-amber-500 shrink-0">
                      {"★".repeat(r.rating)}
                    </div>
                  </div>
                  {r.title && (
                    <div className="font-medium mt-1">{r.title}</div>
                  )}
                  <p className="text-sm mt-2 text-muted-foreground leading-relaxed">
                    {r.body}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
