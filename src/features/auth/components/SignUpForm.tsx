// src/features/auth/components/SignUpForm.tsx
// Phase 2 / Plan 02-02 — Sign Up form (react-hook-form + Zod + shadcn Form).
//
// Behavior:
// - Validates inline: email format, password length/letter/number, mismatched confirm.
// - Calls authStore.signUp (via useAuth). authStore auto-logs the user in on success.
// - Routes to /onboarding/interests on success (per CONTEXT — no separate sign-in step).
// - On registration failure (e.g. duplicate email), surfaces the error on the email field.
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
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
import { signUpSchema, type SignUpInput } from "@/features/auth/schemas"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function SignUpForm() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(values: SignUpInput) {
    const r = await signUp({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    })
    if (r.ok) {
      toast.success(`Welcome, ${values.displayName}`)
      // Per CONTEXT: auto-login + route directly to /onboarding/interests.
      navigate("/onboarding/interests", { replace: true })
    } else {
      form.setError("email", { message: r.error })
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Free, takes 30 seconds</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Create account
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
