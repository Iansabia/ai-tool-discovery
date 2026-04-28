// src/features/submit/components/SubmitToolForm.tsx
// Phase 3 / Plan 03-06 — Submit-a-Tool form.
//
// Persists to useSubmissionStore (status: "pending"); navigates to /submit/success
// on success. Toast: "Tool submitted for review".

import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  submitSchema,
  type SubmitInput,
  parseTags,
  SUBMIT_DESCRIPTION_MAX,
  SUBMIT_NAME_MAX,
  SUBMIT_TAGS_MAX,
} from "@/features/submit/schemas"
import { useSubmissionStore } from "@/features/submit/store"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { withToast } from "@/lib/withToast"
import { CATEGORIES } from "@/data/categories"
import type { CategorySlug } from "@/types"

export function SubmitToolForm() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const effectiveUserId = userId ?? "guest"

  const form = useForm<SubmitInput>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      name: "",
      url: "",
      category: "",
      description: "",
      tags: "",
    },
  })

  const description = form.watch("description") ?? ""
  const name = form.watch("name") ?? ""

  function onSubmit(values: SubmitInput) {
    const tags = parseTags(values.tags)
    withToast(
      () =>
        useSubmissionStore.getState().add({
          submitterId: effectiveUserId,
          name: values.name,
          url: values.url,
          category: values.category as CategorySlug,
          description: values.description,
          tags,
        }),
      { success: "Tool submitted for review" },
    )()
    navigate("/submit/success", {
      replace: true,
      state: { toolName: values.name },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-xl"
        noValidate
        data-testid="submit-tool-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tool name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Cursor"
                  maxLength={SUBMIT_NAME_MAX}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {name.length} / {SUBMIT_NAME_MAX}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  maxLength={SUBMIT_DESCRIPTION_MAX}
                  placeholder="What does this tool do? Who is it for?"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {description.length} / {SUBMIT_DESCRIPTION_MAX}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional, comma-separated, max {SUBMIT_TAGS_MAX})</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ai, writing, productivity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit for review
        </Button>
      </form>
    </Form>
  )
}
