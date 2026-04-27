// src/pages/ForgotPasswordPage.tsx
// Phase 2 / Plan 02-02 — page wrapper for the ForgotPasswordForm component.
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-forgot-password">
      <ForgotPasswordForm />
    </section>
  )
}
