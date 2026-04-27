// src/pages/CategoryDetailPage.tsx
import { useParams } from "react-router"

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-category-detail">
      <h1 className="text-3xl font-semibold">Category (placeholder)</h1>
      <p className="mt-2 text-muted-foreground">
        slug from URL: <code data-testid="param-slug">{slug ?? "(none)"}</code>
      </p>
    </section>
  )
}
