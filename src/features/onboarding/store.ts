// src/features/onboarding/store.ts
// Phase 2 / Plan 02-03 — Transient wizard navigation state for the two-step
// onboarding flow. Lives ONLY in memory — onboarding is a one-shot flow, so the
// store deliberately does not hydrate from or write to localStorage at all.
// Selections survive step navigation (so Back-from-step-2 keeps step-1 chips
// pressed) but are cleared on Finish or a fresh Sign Up.
//
// ARCHITECTURAL NOTE: This store ONLY holds transient navigation state (e.g., which
// chips are pressed while the user clicks back-and-forth between step 1 and step 2).
// The FINAL WRITE to the user record (interests + selectedTools) happens via
// `authStore.completeOnboarding(...)` — the single write path mandated by
// CONTEXT.md "Onboarding Interactions". DO NOT call `useUsersStore.updateUser`
// from onboarding components; route through authStore instead.
//
// Why a Set, not an array? Pitfall 7 — array `.push` mutation does not produce a
// new reference, so React selectors won't re-render. Set + immutable copy on each
// toggle gives both correctness (real toggle, including deselect) AND reactivity.
import { create } from "zustand"
import type { CategorySlug } from "@/types"

interface OnboardingState {
  interests: Set<CategorySlug>
  tools: Set<string>
  toggleInterest(slug: CategorySlug): void
  toggleTool(slug: string): void
  clear(): void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  interests: new Set(),
  tools: new Set(),

  toggleInterest(slug) {
    const next = new Set(get().interests)
    if (next.has(slug)) next.delete(slug)
    else next.add(slug)
    set({ interests: next })
  },

  toggleTool(slug) {
    const next = new Set(get().tools)
    if (next.has(slug)) next.delete(slug)
    else next.add(slug)
    set({ tools: next })
  },

  clear() {
    set({ interests: new Set(), tools: new Set() })
  },
}))
