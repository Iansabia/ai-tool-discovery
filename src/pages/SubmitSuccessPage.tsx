// src/pages/SubmitSuccessPage.tsx
// Phase 3 / Plan 03-06 — confirmation page after a tool submission.
import { Link, useLocation } from "react-router"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface LocationState {
  toolName?: string
}

export default function SubmitSuccessPage() {
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const toolName = state.toolName

  return (
    <section
      className="container mx-auto px-4 py-12 max-w-xl"
      data-testid="page-submit-success"
    >
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Submission received</h1>
          <p className="text-muted-foreground">
            {toolName
              ? `Thanks for submitting "${toolName}". It is now in the pending queue.`
              : "Thanks for submitting. Your tool is in the pending queue."}
          </p>
          <p className="text-sm text-muted-foreground">
            You can see it in your profile under Submissions.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button asChild>
              <Link to="/home">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/submit">Submit another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
