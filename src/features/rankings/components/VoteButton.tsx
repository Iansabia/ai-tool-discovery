// src/features/rankings/components/VoteButton.tsx
// Phase 3 / Plan 03-04 — stacked ▲ count ▼ vote affordance.
//
// Wires through useUpvoteStore (Phase 2 / Plan 02-04). The vote state machine
// is owned by the store; this component is purely a visual + dispatching
// affordance:
//
//   - getVote(userId, slug) → "none" | "up" | "down" determines pressed state
//   - netCount(slug)        → integer to display
//   - setVote(userId, slug, "up" | "down") → dispatches the state machine
//
// Toast wording is pre-computed BEFORE dispatch based on the resulting state:
//   - clicking same vote   → "Vote removed"
//   - clicking opposite    → "Voted up" or "Voted down"
//   - first time vote      → "Voted up" or "Voted down"

import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpvoteStore } from "@/features/rankings/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { withToast } from "@/lib/withToast"
import { cn } from "@/lib/utils"

interface Props {
  slug: string
  size?: "sm" | "default"
}

export function VoteButton({ slug, size = "default" }: Props) {
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"
  const vote = useUpvoteStore((s) =>
    (s.data[effectiveUserId]?.[slug] ?? "none"),
  )
  const netCount = useUpvoteStore((s) => {
    let n = 0
    for (const userMap of Object.values(s.data)) {
      const v = userMap[slug]
      if (v === "up") n += 1
      else if (v === "down") n -= 1
    }
    return n
  })

  function dispatch(next: "up" | "down") {
    // Pre-compute toast wording. State machine: same → "none", different → next.
    const resulting = vote === next ? "none" : next
    const message =
      resulting === "none"
        ? "Vote removed"
        : resulting === "up"
        ? "Voted up"
        : "Voted down"
    withToast(
      () => useUpvoteStore.getState().setVote(effectiveUserId, slug, next),
      { success: message },
    )()
  }

  const buttonSize = size === "sm" ? "icon" : "icon"
  const heightClass = size === "sm" ? "h-7 w-7" : "h-9 w-9"

  return (
    <div className="inline-flex flex-col items-center gap-1" data-testid={`vote-${slug}`}>
      <Button
        type="button"
        variant={vote === "up" ? "default" : "outline"}
        size={buttonSize}
        aria-label={`Upvote (currently ${vote})`}
        aria-pressed={vote === "up"}
        onClick={() => dispatch("up")}
        className={cn(heightClass)}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <span
        className="text-sm font-semibold tabular-nums"
        data-testid={`vote-count-${slug}`}
      >
        {netCount}
      </span>
      <Button
        type="button"
        variant={vote === "down" ? "default" : "outline"}
        size={buttonSize}
        aria-label={`Downvote (currently ${vote})`}
        aria-pressed={vote === "down"}
        onClick={() => dispatch("down")}
        className={cn(heightClass)}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
