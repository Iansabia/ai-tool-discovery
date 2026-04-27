// src/pages/NotFoundPage.tsx
export default function NotFoundPage() {
  return (
    <section className="container mx-auto px-4 py-12" data-testid="page-notfound">
      <h1 className="text-3xl font-semibold">404 — Not Found</h1>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist.</p>
    </section>
  )
}
