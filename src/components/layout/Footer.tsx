// src/components/layout/Footer.tsx
// Phase 1 / Plan 01-04 + Phase 4 polish — glass footer with brand mark.
import { Link } from "react-router"
import { Sparkles, Code2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 border-t glass-panel">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">AI Tools</span>
            <span className="text-sm text-muted-foreground">
              UI/UX Final · Boston University
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link to="/categories" className="hover:text-foreground">
              Categories
            </Link>
            <Link to="/rankings" className="hover:text-foreground">
              Rankings
            </Link>
            <Link to="/submit" className="hover:text-foreground">
              Submit a tool
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              Source
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
