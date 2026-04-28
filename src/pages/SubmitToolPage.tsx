// src/pages/SubmitToolPage.tsx
// Phase 3 / Plan 03-06 — Submit-a-Tool form host page.
import { SubmitToolForm } from "@/features/submit/components/SubmitToolForm"

export default function SubmitToolPage() {
  return (
    <section className="container mx-auto px-4 py-8" data-testid="page-submit">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Submit a Tool</h1>
        <p className="text-muted-foreground mt-1">
          Help the community discover something new. Submissions go to a pending
          queue for review.
        </p>
      </header>
      <SubmitToolForm />
    </section>
  )
}
