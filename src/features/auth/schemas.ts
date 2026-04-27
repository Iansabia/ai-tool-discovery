// src/features/auth/schemas.ts
// Phase 2 / Plan 02-02 — Zod schemas for auth forms.
//
// Per Phase 2 CONTEXT decisions:
// - Password requirements: minimum 8 chars, at least one letter AND one number;
//   no special-character or capital-letter requirement.
// - Mismatched confirm-password is a refine() check (cross-field).
// - Forgot-password schema is intentionally minimal (just email format).
import { z } from "zod"

export const PASSWORD_MIN_LENGTH = 8

const passwordRules = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})
export type SignInInput = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    displayName: z.string().min(1, "Display name is required").max(60, "Display name too long"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: passwordRules,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type SignUpInput = z.infer<typeof signUpSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
