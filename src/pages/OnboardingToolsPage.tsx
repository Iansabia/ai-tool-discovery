// src/pages/OnboardingToolsPage.tsx
// Phase 2 / Plan 02-03 — Step 2 of the onboarding wizard. Wraps the
// OnboardingToolsStep component in a page container.
import { OnboardingToolsStep } from "@/features/onboarding/components/OnboardingToolsStep"

export default function OnboardingToolsPage() {
  return (
    <section
      className="container mx-auto px-4 py-12"
      data-testid="page-onboarding-tools"
    >
      <OnboardingToolsStep />
    </section>
  )
}
