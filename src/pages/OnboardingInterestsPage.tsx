// src/pages/OnboardingInterestsPage.tsx
// Phase 2 / Plan 02-03 — Step 1 of the onboarding wizard. Wraps the
// OnboardingInterestsStep component in a page container.
import { OnboardingInterestsStep } from "@/features/onboarding/components/OnboardingInterestsStep"

export default function OnboardingInterestsPage() {
  return (
    <section
      className="container mx-auto px-4 py-12"
      data-testid="page-onboarding-interests"
    >
      <OnboardingInterestsStep />
    </section>
  )
}
