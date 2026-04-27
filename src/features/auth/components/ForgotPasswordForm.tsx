// src/features/auth/components/ForgotPasswordForm.tsx
// Phase 2 / Plan 02-02 — Forgot Password mock form (react-hook-form + Zod + shadcn Form).
//
// CRITICAL (per CONTEXT): identical success state for registered AND unregistered emails.
// This component MUST NOT branch on whether the email is in the user registry —
// any such branching would leak account-existence (the exact privacy bug we avoid).
// The negative-grep acceptance criterion structurally enforces this: this file is
// not allowed to import from the user registry or call any registry-lookup helper.
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas"

/** Per CONTEXT: identical success state for registered AND unregistered emails. */
const SUCCESS_MESSAGE =
  "If an account exists for that email, we've sent a reset link. Check your inbox."

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(_values: ForgotPasswordInput) {
    // Mock: do NOT branch on user existence. Always show success.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">{SUCCESS_MESSAGE}</p>
        <Link to="/signin" className="text-sm underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send a link.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Send reset link
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm">
        <Link to="/signin" className="underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
