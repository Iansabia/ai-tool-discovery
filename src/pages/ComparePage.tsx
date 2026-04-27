// src/pages/ComparePage.tsx
// Phase 1 / Plan 01-04 — placeholder enforces URL-as-source-of-truth for both tools.
import { useParams } from "react-router"

export default function ComparePage() {
  const { a, b } = useParams<{ a: string; b: string }>()
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-compare">
      <h1 className="text-3xl font-semibold">Compare (placeholder)</h1>
      <p className="mt-2 text-muted-foreground">
        a = <code data-testid="param-a">{a ?? "(none)"}</code>, b ={" "}
        <code data-testid="param-b">{b ?? "(none)"}</code>
      </p>
    </section>
  )
}
