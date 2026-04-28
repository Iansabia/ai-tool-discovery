// src/pages/LandingPage.tsx
// Phase 3 / Plan 03-02 — discovery front door.
// Phase 4 / polish — liquid glass hero + iconography.

import { Link } from "react-router"
import {
  Sparkles,
  Compass,
  Columns2,
  Users,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PILLARS = [
  {
    icon: Compass,
    title: "Discover",
    body: "50+ AI tools across 10 categories. Find the right one fast.",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: Columns2,
    title: "Compare",
    body: "Side-by-side, refreshable URLs, every difference highlighted.",
    accent: "from-accent/20 to-accent/5",
  },
  {
    icon: Users,
    title: "Community",
    body: "Real reviews, transparent rankings, no paid placements.",
    accent: "from-primary/15 to-accent/10",
  },
] as const

const UNIVERSITIES = [
  "Boston University",
  "MIT",
  "Northeastern",
  "Harvard",
  "Tufts",
  "Wellesley",
] as const

export default function LandingPage() {
  return (
    <section data-testid="page-landing" className="relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="blob h-96 w-96 -left-24 -top-24 bg-primary/30"
      />
      <div
        aria-hidden="true"
        className="blob h-[28rem] w-[28rem] -right-32 top-12 bg-accent/25"
      />

      <div className="container mx-auto px-4 py-20 sm:py-28">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 inline-flex items-center gap-1.5 glass-card"
          >
            <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Built by students, for students
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Discover the best{" "}
            <span className="gradient-text">AI tools</span> for any task
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Search, compare, and review thousands of AI tools — powered by the
            community.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
            >
              <Link to="/signup">
                <Sparkles className="h-4 w-4" />
                Get started — free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-card">
              <Link to="/categories">
                Browse tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/signin">Skip to demo</Link>
            </Button>
          </div>
        </div>

        {/* Trusted by */}
        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by students at
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {UNIVERSITIES.map((u) => (
              <Badge
                key={u}
                variant="outline"
                className="glass-card text-muted-foreground"
              >
                {u}
              </Badge>
            ))}
          </div>
        </div>

        {/* Value pillars */}
        <div className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <Card key={p.title} className="glass-card border">
                <CardContent className="p-6 space-y-3">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${p.accent} ring-1 ring-inset ring-border`}
                  >
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="text-xl font-semibold">{p.title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.body}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
