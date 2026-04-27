// src/pages/SignInPage.tsx
// Phase 2 / Plan 02-02 — page wrapper for the SignInForm component.
import { SignInForm } from "@/features/auth/components/SignInForm"

export default function SignInPage() {
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-signin">
      <SignInForm />
    </section>
  )
}
