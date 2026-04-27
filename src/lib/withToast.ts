// src/lib/withToast.ts
// Phase 2 / Plan 02-04 — centralized action wrapper.
//
// Phase 3 features wrap their persisting actions in this so every feature gets
// toast feedback for free, consistently styled and copy-controlled. Pass-through
// for return values; preserves async/sync identity; re-throws errors after
// toasting.
//
// The `any` types in `AnyFn` are necessary for the generic-pass-through pattern:
// the signature of `wrapped` must mirror `fn` exactly, and TypeScript cannot
// infer that without an unconstrained tuple/return relationship.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner"

type AnyFn = (...args: any[]) => any

interface WithToastOptions {
  /** Message shown on success. */
  success: string
  /**
   * Message shown on error. If omitted, falls back to `err.message` when `err`
   * is an Error instance, otherwise to the literal "Action failed".
   */
  error?: string
}

/**
 * Wrap an action function so it toasts success/error around its result.
 * Preserves the original function's signature and return value.
 *
 * Usage:
 *   const onFavorite = withToast(
 *     () => useFavoritesStore.getState().toggle(userId, slug),
 *     { success: "Added to favorites" },
 *   )
 *
 * Both sync and async functions are supported — the wrapper detects a thenable
 * return value and chains toast.success on resolve / toast.error on reject.
 */
export function withToast<F extends AnyFn>(
  fn: F,
  options: WithToastOptions,
): F {
  const wrapped = ((...args: Parameters<F>): ReturnType<F> => {
    try {
      const result = fn(...args)
      if (
        result &&
        typeof (result as Promise<unknown>).then === "function"
      ) {
        return (result as Promise<unknown>)
          .then((value) => {
            toast.success(options.success)
            return value
          })
          .catch((err: unknown) => {
            const msg =
              options.error ??
              (err instanceof Error ? err.message : "Action failed")
            toast.error(msg)
            throw err
          }) as ReturnType<F>
      }
      toast.success(options.success)
      return result
    } catch (err) {
      const msg =
        options.error ??
        (err instanceof Error ? err.message : "Action failed")
      toast.error(msg)
      throw err
    }
  }) as F
  return wrapped
}
