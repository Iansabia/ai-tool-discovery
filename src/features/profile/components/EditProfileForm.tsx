// src/features/profile/components/EditProfileForm.tsx
// Phase 3 / Plan 03-07 — inline display-name editor for the Profile page.

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { useUsersStore } from "@/features/auth/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { withToast } from "@/lib/withToast"

const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(60, "Display name must be 60 characters or fewer"),
})

type ProfileInput = z.infer<typeof profileSchema>

interface Props {
  onCancel?: () => void
  onSaved?: () => void
}

export function EditProfileForm({ onCancel, onSaved }: Props) {
  const { userId, currentUser } = useAuth()
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: currentUser?.displayName ?? "" },
  })

  function onSubmit(values: ProfileInput) {
    if (!userId) return
    withToast(
      () => useUsersStore.getState().updateUser(userId, { displayName: values.displayName }),
      { success: "Profile saved" },
    )()
    onSaved?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
        noValidate
        data-testid="edit-profile-form"
      >
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
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
