// src/pages/HomePage.tsx
// Phase 3 / Plan 03-02 — logged-in personalized recommendations surface.
//
// Reads the current user's `interests` (CategorySlug[]), filters TOOLS by
// matching category, and renders a grid of ToolCards each labeled with
// "Recommended because you picked [Category Name]" — using the human-readable
// category display name (CATEGORIES.name), NOT the slug.
//
// Reactivity: subscribes to useUsersStore via a selector so Phase 4 profile-edit
// (interest changes) re-renders this page. Uses useAuth() for the userId
// (preserves the Phase 2 facade pattern; never reaches into useAuthStore here).
//
// Empty states ship in the same commit (Phase 3 contract):
//   - interests empty -> "You haven't picked any interests yet" + Browse CTA
//   - recommendations empty (fallback) -> "No tools match your interests yet"
// Both states route to /categories so the user has somewhere to go.

import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ToolCard } from "@/features/tools/components/ToolCard"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useUsersStore } from "@/features/auth/store"
import { TOOLS } from "@/data/tools"
import { CATEGORIES } from "@/data/categories"
import type { CategorySlug } from "@/types"

const RECOMMENDATION_LIMIT = 9

export default function HomePage() {
  const { userId } = useAuth()
  // Subscribe reactively to the user record so interest edits in Phase 4 reflect here.
  const user = useUsersStore((s) => (userId ? s.findById(userId) : undefined))
  const interests: CategorySlug[] = user?.interests ?? []

  // Map slug -> display name for the "Recommended because you picked X" line.
  // Built once per render; CATEGORIES is 10 entries so no memoization needed.
  const categoryNameBySlug = new Map(CATEGORIES.map((c) => [c.slug, c.name]))

  // Build the recommendation list: every tool whose category is in interests.
  // Cap at RECOMMENDATION_LIMIT (9) for a reasonable initial page.
  const recommendations = TOOLS.filter((t) =>
    interests.includes(t.category),
  ).slice(0, RECOMMENDATION_LIMIT)

  return (
    <section
      className="container mx-auto px-4 py-6"
      data-testid="page-home"
    >
      <h1 className="mb-2 text-3xl font-bold">
        Welcome back{user?.displayName ? `, ${user.displayName}` : ""}
      </h1>
      <p className="mb-6 text-muted-foreground">
        Picks based on your selected interests.
      </p>

      {interests.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg">
            You haven't picked any interests yet.
          </p>
          <Link to="/categories">
            <Button>Browse Categories</Button>
          </Link>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg">
            No tools match your interests yet.
          </p>
          <Link to="/categories">
            <Button>Browse Categories</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((tool) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
              recommendedBecause={
                categoryNameBySlug.get(tool.category) ?? tool.category
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}
