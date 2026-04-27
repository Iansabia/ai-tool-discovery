// src/pages/ComparePickerPage.tsx
import { useParams } from "react-router"

export default function ComparePickerPage() {
  const { a } = useParams<{ a: string }>()
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-compare-picker">
      <h1 className="text-3xl font-semibold">Compare — Pick Second Tool (placeholder)</h1>
      <p className="mt-2 text-muted-foreground">
        a from URL: <code data-testid="param-a">{a ?? "(none)"}</code>
      </p>
    </section>
  )
}
