// src/features/onboarding/components/OnboardingInterestsStep.tsx
// Phase 2 / Plan 02-03 — Step 1 of the onboarding wizard.
//
// ARCHITECTURE: This component only TOGGLES chips. Transient navigation state
// (the Set of pressed chips while the user moves between step 1 and step 2)
// lives in `useOnboardingStore`, which is purely in-memory. The FINAL WRITE to
// the user record (interests + selectedTools) happens via
// `useAuth().completeOnboarding(...)` which routes through `authStore` — the
// single write path mandated by CONTEXT.md "Onboarding Interactions". This
// component does NOT call `useUsersStore.updateUser` directly; that contract
// belongs to authStore.
//
// Skip on this step persists whatever has been selected so far (also via
// `completeOnboarding`) and routes to /home — keeps user record consistent
// even if the user bails on the wizard.
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/data/categories"
import { useOnboardingStore } from "@/features/onboarding/store"
import { ToggleableChip } from "./ToggleableChip"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { CategorySlug } from "@/types"

export function OnboardingInterestsStep() {
  const navigate = useNavigate()
  const interests = useOnboardingStore((s) => s.interests)
  const tools = useOnboardingStore((s) => s.tools)
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest)
  const clear = useOnboardingStore((s) => s.clear)
  const { completeOnboarding } = useAuth()

  // Continue is gated until at least one interest is picked (CONTEXT.md: min 1).
  const continueDisabled = interests.size < 1

  function persistPartial() {
    // Final-write contract: route through authStore.completeOnboarding (NOT
    // useUsersStore.updateUser). It's a no-op for guest/null sessions, so this
    // is safe to call unconditionally.
    completeOnboarding(
      Array.from(interests) as CategorySlug[],
      Array.from(tools),
    )
  }

  function onContinue() {
    navigate("/onboarding/tools")
  }

  function onSkip() {
    persistPartial()
    clear()
    toast.success("You can update your preferences in your profile")
    navigate("/home", { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">Step 1 of 2</p>
        <h1 className="text-3xl font-semibold">What do you want to do with AI?</h1>
        <p className="text-sm text-muted-foreground">
          Pick at least one category. You can change this later.
        </p>
      </div>
      <div
        role="group"
        aria-label="Interests"
        className="flex flex-wrap justify-center gap-2"
      >
        {CATEGORIES.map((c) => (
          <ToggleableChip
            key={c.slug}
            label={c.name}
            pressed={interests.has(c.slug)}
            onToggle={() => toggleInterest(c.slug)}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button onClick={onContinue} disabled={continueDisabled}>
          Continue
        </Button>
      </div>
    </div>
  )
}
