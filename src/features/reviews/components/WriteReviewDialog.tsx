// src/features/reviews/components/WriteReviewDialog.tsx
// Phase 3 / Plan 03-04 — Review form body for the ToolDetailPage Dialog.
//
// Slots into ToolDetailPage's existing <Dialog> shell. The page owns the
// open/close state; this component renders the form inside <DialogContent>.
// On successful submit, calls onSuccess() (page closes the dialog).
//
// Persistence: useReviewStore.getState().add wrapped in withToast.
// Auth: review is authored under the current user (or "guest" via useAuth).

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star } from "lucide-react"
import type { Tool } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { reviewSchema, type ReviewInput, REVIEW_BODY_MAX, REVIEW_TITLE_MAX } from "@/features/reviews/schemas"
import { useReviewStore } from "@/features/reviews/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { withToast } from "@/lib/withToast"
import { cn } from "@/lib/utils"

interface Props {
  tool: Tool
  onSuccess?: () => void
}

export function WriteReviewDialog({ tool, onSuccess }: Props) {
  const { userId, currentUser, isGuest } = useAuth()
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: "", body: "" },
  })

  const rating = form.watch("rating") ?? 0
  const body = form.watch("body") ?? ""
  const title = form.watch("title") ?? ""

  function onSubmit(values: ReviewInput) {
    const author = currentUser?.displayName ?? (isGuest ? "Guest" : "Anonymous")
    const effectiveUserId = userId ?? "guest"
    withToast(
      () =>
        useReviewStore.getState().add({
          toolSlug: tool.slug,
          userId: effectiveUserId,
          username: author,
          rating: values.rating,
          title: values.title ?? "",
          body: values.body,
        }),
      { success: "Review posted" },
    )()
    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        data-testid="write-review-form"
      >
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div
                  className="flex gap-1"
                  role="radiogroup"
                  aria-label="Rating, 1 to 5 stars"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = (hoverRating ?? rating) >= n
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={field.value === n}
                        aria-label={`${n} star${n === 1 ? "" : "s"}`}
                        onClick={() => field.onChange(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        className="rounded p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6",
                            filled ? "fill-primary text-primary" : "text-muted-foreground",
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="A one-line summary"
                  maxLength={REVIEW_TITLE_MAX}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {title.length} / {REVIEW_TITLE_MAX}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What worked, what didn't, who would benefit?"
                  rows={4}
                  maxLength={REVIEW_BODY_MAX}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {body.length} / {REVIEW_BODY_MAX}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Post review
          </Button>
        </div>
      </form>
    </Form>
  )
}
