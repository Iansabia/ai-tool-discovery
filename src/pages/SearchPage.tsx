// src/pages/SearchPage.tsx
import { useSearchParams } from "react-router"

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get("q") ?? ""
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-search">
      <h1 className="text-3xl font-semibold">Search (placeholder)</h1>
      <p className="mt-2 text-muted-foreground">
        q = <code data-testid="param-q">{q || "(none)"}</code>
      </p>
    </section>
  )
}
