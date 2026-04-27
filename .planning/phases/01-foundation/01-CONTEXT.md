# Phase 1: Foundation - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a scaffolded SPA where every architectural pitfall is structurally prevented before any feature work begins. Concretely: Vite+React+TS+Tailwind v4+shadcn/ui scaffolded; every route registered with placeholder pages; AppShell with single Toaster mounted; TypeScript interfaces defined; namespaced+versioned localStorage helper with Zod-validated reads and `storage` event listener; brand color tokens defined in CSS variables for both `:root` and `.dark`; FOUC prevention via inline script; ~50 seed tools across 10 categories with build-time slug-uniqueness validation and real brand SVG logos. No feature UI is built in this phase.

</domain>

<decisions>
## Implementation Decisions

### Brand Tokens & Theme
- Primary green hex: `#10B981` (Tailwind emerald-500) — matches Figma "Get Started" button
- Accent orange hex: `#F97316` (orange-500) — matches Figma "Skip to Demo" button
- Theme strategy: next-themes with `attribute="class"`, `storageKey="aitools:theme"`, `defaultTheme="system"`
- FOUC prevention: inline `<script>` in `index.html` reads `localStorage["aitools:theme"]` and applies `dark` class before React mounts
- Brand tokens defined as CSS variables in `globals.css` for both `:root` and `.dark` — `--primary`, `--accent`, plus full shadcn semantic palette
- Zero raw color literals (`bg-green-*`, `text-orange-*`) in app code — enforced by code review and a grep check during Phase 4

### Seed Data Authorship
- 10 categories: Writing, Coding, Research, Image, Audio, Video, Productivity, Design, Data/Analytics, Marketing
- ~50 tools total, ~5 per category — mix of well-known leaders (ChatGPT, Claude, Cursor, Midjourney, ElevenLabs) plus lesser-known per category for variety
- Tool fields: `slug` (kebab-case, unique), `name`, `tagline`, `description`, `category` (slug ref), `pricing` (`'Free' | 'Freemium' | 'Paid'`), `features` (string[]), `url`, `rating` (seed value 1.0–5.0)
- Logos: **real brand SVGs for every tool, no fallbacks** — sourced from each tool's brand kit / official assets; stored under `src/assets/tool-logos/<slug>.svg`
- Each `Tool` import statically references its logo via Vite's static asset import: `import logo from '@/assets/tool-logos/<slug>.svg'`

### Storage & Build-Time Validation
- localStorage key namespace: `aitools:<domain>:<scope>` (e.g., `aitools:auth:session`, `aitools:favorites:user_abc123`, `aitools:theme`)
- Storage envelope: `{ version: 1, data: T }` on every persisted store; reads validate version + shape via Zod, fall back to defaults on schema mismatch
- Build-time slug uniqueness: `__validateSlugsUnique()` exported and called in `data/tools.ts` on module load — throws at startup (and during `vite build`) if duplicates exist
- Logo location: `src/assets/tool-logos/<slug>.svg` (Vite imports them as static URLs; build-time check that every tool has a corresponding file)
- All persisting code goes through `src/lib/storage.ts` helpers; no raw `localStorage.setItem` calls in feature code (enforced by ESLint rule + code review)
- Multi-tab consistency: `storage` event listener wired in storage helper from day one; same-tab updates dispatched manually since `storage` event doesn't fire on the originating tab

### Routing & App Shell
- React Router v7 declarative mode (`createBrowserRouter`)
- All v1 routes registered with placeholder pages (each rendering its slug from URL via `useParams` to prove URL-as-source-of-truth from day one): `/`, `/signin`, `/signup`, `/forgot-password`, `/onboarding`, `/home`, `/categories`, `/categories/:slug`, `/tools/:slug`, `/compare/:a`, `/compare/:a/vs/:b`, `/search`, `/favorites`, `/profile`, `/rankings`, `/submit`, `/submit/success`, `*` (NotFound)
- Single `<AppShell>` outlet wraps every route, renders `<Header>`, `<Outlet>`, `<Footer>`, and a single `<Toaster />` (sonner) at root
- `<ProtectedRoute>` wrapper exists in this phase but only stubs auth check (always-true placeholder); real auth check lands in Phase 2
- Path alias `@/` configured in `vite.config.ts` and `tsconfig.json`

### Stack Configuration
- Build: Vite + `@tailwindcss/vite` plugin (no `postcss.config.js` — Tailwind v4 uses Vite plugin directly)
- Animations: `tw-animate-css` (the Tailwind v4 successor to `tailwindcss-animate`)
- shadcn/ui CLI v4 init configures Tailwind v4 + dark mode preset
- TypeScript strict mode on; `noUncheckedIndexedAccess` on (catches array-index hazards on tool lookups)

### Claude's Discretion
- Exact ESLint config (whether to add custom no-direct-localStorage rule via plugin or via grep CI check)
- Exact placeholder page text on each route (any clear "Phase 1 placeholder — see /tools/:slug = {slug}" pattern is fine)
- Whether build-time slug check is implemented as a file at `src/data/_validate.ts` or inlined into `tools.ts`
- Whether next-themes is used for `theme-aware` favicon meta tag (nice-to-have, not required)
- Folder organization within `src/lib/` (subfolders for storage, theme, etc., or flat)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield. No existing `src/`, no `package.json`, no scaffolding yet. The `.planning/` directory and the Figma file are the only existing artifacts.

### Established Patterns
- See `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` for the full stack rationale and folder layout. This phase is the first opportunity to instantiate them.
- Visual identity established in Figma file `HeEOcLehBJFHKorF48M6mD` — clean card-based UI, generous whitespace, modern sans-serif type. Phase 1 must define the tokens but does not need to apply them visually beyond the AppShell skeleton.

### Integration Points
- This phase IS the integration foundation. Every subsequent phase plugs into the router, storage helper, theme provider, and AppShell defined here.
- Phase 2 (Auth + Persistence Stores) is the first consumer — it adds real auth check inside `<ProtectedRoute>`, attaches stores to localStorage via the helper, and consumes brand tokens for form styling.

</code_context>

<specifics>
## Specific Ideas

- The "everything is Claude" tool detail bug and "always Claude vs ChatGPT" compare bug must be structurally prevented in this phase by registering `/tools/:slug` and `/compare/:a/vs/:b` with `useParams` lookups *before* any feature work begins. Even the placeholder pages must read params from URL so the pattern is locked in.
- The Figma trusted-by row references "Boston U." — the implementer is a BU CS student, audience framing is BU-flavored. No specific copy decisions in this phase but tokens should support that vibe.
- Logos are non-negotiable real SVGs per user direction — set aside content time during this phase to source all ~50.
- Direct URL refresh on `/tools/:slug` and `/compare/:a/vs/:b` should already work in the placeholder phase — Vercel/Netlify SPA fallback config (`vercel.json` or `_redirects`) should land here, not in Phase 5, so it gets exercised throughout development.

</specifics>

<deferred>
## Deferred Ideas

- ⌘K command palette (cmdk via shadcn `<Command>`) — researched, not in v1; Phase 4 polish or v2
- Theme-aware favicon — nice-to-have, defer
- Custom ESLint plugin for no-direct-localStorage — start with a grep-based check or convention; harden into a rule only if violations appear
- Tailwind config tweaks beyond brand tokens (custom animation curves, container queries) — defer to Phase 4 polish

</deferred>
