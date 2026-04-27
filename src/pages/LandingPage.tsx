// src/pages/LandingPage.tsx
// Phase 3 / Plan 03-02 — discovery front door for unauthenticated visitors.
//
// Structure (top to bottom):
//   1. Hero  — headline + subhead + 3 CTAs (Get Started, Browse Tools, Skip to Demo)
//   2. Value pillars — 3 cards: Discover / Compare / Community
//   3. Trusted-by — text + university chips (Badge variant="outline")
//
// Constraints (per Phase 3 contract): NO custom typography, NO animations,
// NO spacing finesse. Tailwind defaults only. Reuses shadcn primitives.
// "Skip to Demo" routes to /signin for now (Phase 5 hardening will rewire to a
// pre-seeded demo user auto-fill per CONTEXT.md).

import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PILLARS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Discover",
    body: "50+ AI tools across 10 categories. Find the right one fast.",
  },
  {
    title: "Compare",
    body: "Side-by-side comparison. URLs that survive a refresh.",
  },
  {
    title: "Community",
    body: "Real reviews, transparent rankings, no paid placements.",
  },
] as const

const UNIVERSITIES: ReadonlyArray<string> = [
  "Boston University",
  "MIT",
  "Northeastern",
  "Harvard",
  "Tufts",
  "Wellesley",
] as const

export default function LandingPage() {
  return (
    <section
      className="container mx-auto px-4 py-12"
      data-testid="page-landing"
    >
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold">
          Discover the best AI tools for any task
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Compare, review, and find what works for you.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signup">
            <Button>Get Started — Free</Button>
          </Link>
          <Link to="/categories">
            <Button variant="outline">Browse Tools</Button>
          </Link>
          <Link to="/signin">
            <Button variant="ghost">Skip to Demo</Button>
          </Link>
        </div>
      </div>

      {/* Value pillars */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Card key={pillar.title}>
            <CardContent className="p-4">
              <div className="text-xl font-semibold">{pillar.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {pillar.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trusted by */}
      <div>
        <p className="text-sm text-muted-foreground">
          Trusted by students at
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {UNIVERSITIES.map((u) => (
            <Badge key={u} variant="outline">
              {u}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
