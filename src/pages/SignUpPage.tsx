// src/pages/SignUpPage.tsx
// Phase 2 / Plan 02-02 — page wrapper for the SignUpForm component.
import { SignUpForm } from "@/features/auth/components/SignUpForm"

export default function SignUpPage() {
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-signup">
      <SignUpForm />
    </section>
  )
}
