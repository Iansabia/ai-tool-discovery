// src/features/onboarding/components/ToggleableChip.tsx
// Phase 2 / Plan 02-03 — Reusable pill-button used for both interest and tool chips.
// `aria-pressed` is the accessibility contract: screen readers announce "pressed"/
// "not pressed" and the visual variant flips between filled (pressed) and outline
// (unpressed). Fully controlled — parent owns selection state.
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ToggleableChipProps {
  label: string
  pressed: boolean
  onToggle(): void
  "aria-label"?: string
}

export function ToggleableChip({
  label,
  pressed,
  onToggle,
  "aria-label": ariaLabel,
}: ToggleableChipProps) {
  return (
    <Button
      type="button"
      variant={pressed ? "default" : "outline"}
      aria-pressed={pressed}
      aria-label={ariaLabel ?? label}
      onClick={onToggle}
      className={cn("rounded-full")}
    >
      {label}
    </Button>
  )
}
