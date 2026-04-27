// src/features/auth/types.ts
// Phase 2 / Plan 02-01 — auth domain types and constants.
//
// Constants are exported so tests and other plans (02-02 SignIn form, 02-03 onboarding)
// can reference them by import rather than duplicating string literals.

import type { User } from "@/types"

/**
 * Persisted session shape (key: aitools:auth:session).
 *
 * `expiresAt` is epoch milliseconds (number) — chosen over ISO 8601 strings so the
 * sliding-refresh arithmetic in `useAuthStore.touchSession` is a simple subtraction.
 * The original `Session` type in `@/types` uses ISO strings for backward shape; this
 * `AuthSession` is the runtime shape Phase 2 actually persists.
 */
export interface AuthSession {
  userId: string
  /** epoch ms — when this session was issued */
  issuedAt: number
  /** epoch ms — sliding 30-day expiry */
  expiresAt: number
  /** mock random token (uuid). Not used for verification (no backend); kept for shape parity. */
  token: string
}

export type UsersRegistry = User[]

/** 30 days in ms. Sessions are issued with `expiresAt = now + SESSION_DURATION_MS`. */
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Threshold for sliding-refresh. When the remaining time on a session is below this,
 * `touchSession()` re-issues `expiresAt = now + SESSION_DURATION_MS`. Above this, the
 * session is left untouched (avoids a write storm on every authenticated render).
 */
export const SESSION_REFRESH_THRESHOLD_MS = 25 * 24 * 60 * 60 * 1000

/** Reserved userId for guest mode. Real users get `crypto.randomUUID()`. */
export const GUEST_USER_ID = "guest"

/**
 * Generic sign-in error. CRITICAL: this exact string is used for both unknown-email
 * AND wrong-password to avoid leaking account existence (CONTEXT.md decision).
 * Plan 02-02's SignIn form imports this constant for inline error display.
 */
export const GENERIC_SIGNIN_ERROR = "Email or password is incorrect"
