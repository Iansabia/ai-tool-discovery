// src/pages/ProfilePage.tsx
// Phase 3 / Plan 03-07 — user profile with 3 sections:
//   1. Identity (display name + email + Edit)
//   2. Preferences (interests + selectedTools)
//   3. My Activity (Saved Comparisons + Submissions)

import { useState } from "react"
import { Link } from "react-router"
import { UserCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useSavedComparisonsStore } from "@/features/compare/store"
import { useSubmissionStore } from "@/features/submit/store"
import { CATEGORIES } from "@/data/categories"
import { TOOLS } from "@/data/tools"
import { EditProfileForm } from "@/features/profile/components/EditProfileForm"

export default function ProfilePage() {
  const { userId, currentUser, isGuest } = useAuth()
  const [editing, setEditing] = useState(false)
  const effectiveUserId = userId ?? "guest"

  // Subscribe to the bucket directly. Returning a fresh [] when the user has
  // no entries causes Zustand to detect a ref change every call → infinite
  // render loop. Default to [] only in the consumer.
  const savedComparisonsRaw = useSavedComparisonsStore(
    (s) => s.data[effectiveUserId],
  )
  const savedComparisons = savedComparisonsRaw ?? []
  const submissionsRaw = useSubmissionStore(
    (s) => s.data[effectiveUserId],
  )
  const submissions = submissionsRaw ?? []

  const interests = currentUser?.interests ?? []
  const selectedTools = currentUser?.selectedTools ?? []

  return (
    <section className="container mx-auto px-4 py-8 max-w-3xl" data-testid="page-profile">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
          <UserCircle2 className="h-3.5 w-3.5 text-primary" />
          Account
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Profile</h1>
      </header>

      <Card className="glass-card border mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold">Identity</h2>
            {!editing && !isGuest && currentUser && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          {editing && currentUser ? (
            <EditProfileForm
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Display name: </span>
                <span className="font-medium">
                  {currentUser?.displayName ?? (isGuest ? "Guest" : "—")}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email: </span>
                <span className="font-medium">
                  {currentUser?.email ?? (isGuest ? "(guest session)" : "—")}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
            {interests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interests selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((slug) => {
                  const c = CATEGORIES.find((c) => c.slug === slug)
                  return (
                    <Badge key={slug} variant="secondary">
                      {c?.name ?? slug}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Selected tools</h3>
            {selectedTools.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tools selected during onboarding.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTools.map((slug) => {
                  const t = TOOLS.find((t) => t.slug === slug)
                  return (
                    <Badge key={slug} variant="outline">
                      {t?.name ?? slug}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">My Activity</h2>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Saved Comparisons</h3>
            {savedComparisons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved comparisons yet.</p>
            ) : (
              <ul className="space-y-2" data-testid="saved-comparisons-list">
                {savedComparisons.map((c) => {
                  const a = TOOLS.find((t) => t.slug === c.a)
                  const b = TOOLS.find((t) => t.slug === c.b)
                  return (
                    <li key={`${c.a}-${c.b}`}>
                      <Link
                        to={`/compare/${c.a}/vs/${c.b}`}
                        className="text-primary hover:underline"
                      >
                        {a?.name ?? c.a} vs {b?.name ?? c.b}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Submissions</h3>
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submitted tools yet.</p>
            ) : (
              <ul className="space-y-2" data-testid="submissions-list">
                {submissions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(s.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="secondary">{s.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </section>
  )
}
