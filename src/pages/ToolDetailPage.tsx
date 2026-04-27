// src/pages/ToolDetailPage.tsx
// Phase 1 / Plan 01-04 — placeholder enforces URL-as-source-of-truth pattern.
import { useParams } from "react-router"

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-tool-detail">
      <h1 className="text-3xl font-semibold">Tool Detail (placeholder)</h1>
      <p className="mt-2 text-muted-foreground">
        slug from URL: <code data-testid="param-slug">{slug ?? "(none)"}</code>
      </p>
    </section>
  )
}
