// src/features/onboarding/components/OnboardingToolsStep.tsx
// Phase 2 / Plan 02-03 — Step 2 of the onboarding wizard.
//
// ARCHITECTURE: Finish AND Skip both call `useAuth().completeOnboarding(...)`
// which routes through `authStore` — the single write path mandated by
// CONTEXT.md "Onboarding Interactions". This component does NOT call
// `useUsersStore.updateUser` directly. Transient navigation state (which chips
// are pressed mid-flow) lives in `useOnboardingStore`. Back navigates to
// step 1 WITHOUT clearing — preserves selections per ONBO-04.
//
// Tools are fully optional: Finish is enabled even with 0 tools picked.
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { TOOLS } from "@/data/tools"
import { useOnboardingStore } from "@/features/onboarding/store"
import { ToggleableChip } from "./ToggleableChip"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { CategorySlug } from "@/types"

export function OnboardingToolsStep() {
  const navigate = useNavigate()
  const interests = useOnboardingStore((s) => s.interests)
  const tools = useOnboardingStore((s) => s.tools)
  const toggleTool = useOnboardingStore((s) => s.toggleTool)
  const clear = useOnboardingStore((s) => s.clear)
  const { completeOnboarding } = useAuth()

  function persist() {
    // Final-write contract: route through authStore.completeOnboarding (NOT
    // useUsersStore.updateUser). It's a no-op for guest/null sessions, so this
    // is safe to call unconditionally.
    completeOnboarding(
      Array.from(interests) as CategorySlug[],
      Array.from(tools),
    )
  }

  function onFinish() {
    persist()
    clear()
    toast.success("You're all set")
    navigate("/home", { replace: true })
  }

  function onSkip() {
    persist()
    clear()
    toast.success("You can update your preferences in your profile")
    navigate("/home", { replace: true })
  }

  function onBack() {
    // Back-nav preserves store state (no clear). User-facing back goes to the
    // explicit step-1 URL so React Router does the right thing inside MemoryRouter
    // tests as well as the real BrowserRouter.
    navigate("/onboarding/interests")
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">Step 2 of 2</p>
        <h1 className="text-3xl font-semibold">Which tools have you used?</h1>
        <p className="text-sm text-muted-foreground">
          Optional. Helps us show you familiar names first.
        </p>
      </div>
      <div
        role="group"
        aria-label="Tools"
        className="flex flex-wrap justify-center gap-2"
      >
        {TOOLS.map((t) => (
          <ToggleableChip
            key={t.slug}
            label={t.name}
            pressed={tools.has(t.slug)}
            onToggle={() => toggleTool(t.slug)}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onFinish}>Finish</Button>
        </div>
      </div>
    </div>
  )
}
