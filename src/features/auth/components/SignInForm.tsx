// src/features/auth/components/SignInForm.tsx
// Phase 2 / Plan 02-02 — Sign In form (react-hook-form + Zod + shadcn Form).
//
// Behavior:
// - Validates email format inline.
// - Calls authStore.signIn (via useAuth) on submit.
// - On bad credentials, surfaces the GENERIC_SIGNIN_ERROR via form.setError("password", ...).
//   Critical: same wording for unknown email AND wrong password (no email-existence leak).
// - On success, navigates to ?return_to or /home (BLOCKER 3 fix: round-trip works for
//   credentialed sign-in, not just guest-continue).
// - "Continue as Guest" button sets a guest session and respects ?return_to.
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useSearchParams } from "react-router"
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
import { signInSchema, type SignInInput } from "@/features/auth/schemas"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function SignInForm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { signIn, continueAsGuest } = useAuth()

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  // Only honor return_to values that are app-internal (start with "/").
  // Reject absolute URLs to avoid open-redirect.
  const returnTo = params.get("return_to")
  const safeReturnTo = returnTo && returnTo.startsWith("/") ? returnTo : "/home"

  async function onSubmit(values: SignInInput) {
    const r = await signIn(values.email, values.password)
    if (r.ok) {
      toast.success("Signed in")
      navigate(safeReturnTo, { replace: true })
    } else {
      // GENERIC_SIGNIN_ERROR — same wording for unknown email AND wrong password.
      form.setError("password", { message: r.error })
    }
  }

  async function onGuest() {
    await continueAsGuest()
    toast.success("Continuing as guest (fresh session)")
    navigate(safeReturnTo, { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back</p>
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
                  <Input type="email" autoComplete="email" placeholder="you@bu.edu" {...field} />
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
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Sign in
          </Button>
        </form>
      </Form>
      <Button type="button" variant="outline" className="w-full" onClick={onGuest}>
        Continue as Guest
      </Button>
      <div className="flex justify-between text-sm">
        <Link to="/signup" className="underline">
          Create account
        </Link>
        <Link to="/forgot-password" className="underline">
          Forgot password?
        </Link>
      </div>
    </div>
  )
}
