// src/features/auth/hooks/useAuth.ts
// Phase 2 / Plan 02-02 — Ergonomic facade over useAuthStore + useUsersStore.
// Components consume this hook (not the raw stores) for sign-in/up/out, guest mode,
// session reads, and the ergonomic `currentUser` lookup.
//
// Reactivity note: `session` is a reactive subscription; `currentUser` is derived
// non-reactively via getState(). This is fine for current consumers (Header read,
// SignIn/SignUp/ForgotPassword forms which call actions and re-render via session
// changes). If a component needs to react to user-record updates (interests +
// selectedTools), it should subscribe to useUsersStore directly.
import { useAuthStore, useUsersStore } from "@/features/auth/store"
import type { User } from "@/types"
import { GUEST_USER_ID } from "@/features/auth/types"

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const isAuthenticated = !!session && session.expiresAt > Date.now()
  const isGuest = !!session && session.userId === GUEST_USER_ID
  const userId = session?.userId ?? null

  let currentUser: User | null = null
  if (session) {
    // Phase 4 fix: guests also have a user record (stub) once they complete
    // onboarding, so the lookup is unconditional. Guest record may be undefined
    // until ensureGuest() runs — fall back to null for the pre-onboarding case.
    currentUser = useUsersStore.getState().findById(session.userId) ?? null
  }

  return {
    session,
    isAuthenticated,
    isGuest,
    userId,
    currentUser,
    signIn: useAuthStore.getState().signIn,
    signUp: useAuthStore.getState().signUp,
    signOut: useAuthStore.getState().signOut,
    continueAsGuest: useAuthStore.getState().continueAsGuest,
    touchSession: useAuthStore.getState().touchSession,
    completeOnboarding: useAuthStore.getState().completeOnboarding,
  }
}
