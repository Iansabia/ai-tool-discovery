# Phase 1: Foundation - Research

**Researched:** 2026-04-26
**Domain:** Vite SPA scaffolding — Tailwind v4, shadcn/ui CLI v4, React Router v7 skeleton, namespaced+versioned localStorage, next-themes FOUC prevention, ~50 brand SVG logo sourcing, Vercel/Netlify SPA fallback config
**Confidence:** HIGH

## Summary

Project-level research (`SUMMARY.md`, `STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md`) already locks the stack and architecture. This phase research fills the implementation-level gaps a planner needs to write atomic tasks: exact CLI commands, exact config snippets, exact Zustand v5 + persist pattern with version envelope, the build-time slug uniqueness check, the SPA-fallback config for the two static hosts the project might deploy to, and a sourcing strategy for ~50 brand SVG logos.

Three pieces have moving parts worth flagging:

1. **shadcn CLI v4 init flow.** As of April 2026 the canonical command is `pnpm dlx shadcn@latest init -t vite` (or `npx shadcn@latest init -t vite`). It scaffolds Vite + React + TS + Tailwind v4 + tw-animate-css in one shot, including `components.json`, `vite.config.ts`, `tsconfig.json` path alias, `src/index.css` with `@import "tailwindcss"`, and a starter `App.tsx`. It does **not** create `tailwind.config.ts` — Tailwind v4 reads tokens from CSS via `@theme` directive in `globals.css`. Do not add `postcss.config.js` and do not install `tailwindcss-animate`.
2. **next-themes vs shadcn's built-in ThemeProvider.** shadcn's official Vite dark-mode docs ship a 30-line custom `ThemeProvider` keyed by `vite-ui-theme`. CONTEXT.md locks the choice on `next-themes` instead, with `storageKey="aitools:theme"`. Both work; next-themes gives system-preference detection for free. The FOUC-prevention inline script must be authored manually in `index.html` (next-themes injects its script in Next.js only — in Vite it's a no-op for the pre-React paint window).
3. **Logo sourcing.** `simple-icons` v16.18.0 (3400+ brand SVGs, CC0) is the right primary source for well-known tools (ChatGPT, Claude, Cursor, GitHub Copilot, Notion, Figma, Midjourney, ElevenLabs, OpenAI, Anthropic, Adobe products are all in the catalog). For lesser-known tools missing from simple-icons, fall back to each tool's official brand kit / press page. CONTEXT.md mandates real SVGs with no fallbacks, so this work must be scheduled into the phase, not deferred.

**Primary recommendation:** Plan Phase 1 as five sequential waves: (Wave 0) test infra setup, (Wave 1) scaffolding + config, (Wave 2) lib/types/storage, (Wave 3) router + AppShell + theme, (Wave 4) seed data + logo authorship + deploy config. Logo authorship parallelizes with everything else once the data schema is locked.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Brand Tokens & Theme**
- Primary green hex: `#10B981` (Tailwind emerald-500) — matches Figma "Get Started" button
- Accent orange hex: `#F97316` (orange-500) — matches Figma "Skip to Demo" button
- Theme strategy: next-themes with `attribute="class"`, `storageKey="aitools:theme"`, `defaultTheme="system"`
- FOUC prevention: inline `<script>` in `index.html` reads `localStorage["aitools:theme"]` and applies `dark` class before React mounts
- Brand tokens defined as CSS variables in `globals.css` for both `:root` and `.dark` — `--primary`, `--accent`, plus full shadcn semantic palette
- Zero raw color literals (`bg-green-*`, `text-orange-*`) in app code — enforced by code review and a grep check during Phase 4

**Seed Data Authorship**
- 10 categories: Writing, Coding, Research, Image, Audio, Video, Productivity, Design, Data/Analytics, Marketing
- ~50 tools total, ~5 per category — mix of well-known leaders (ChatGPT, Claude, Cursor, Midjourney, ElevenLabs) plus lesser-known per category for variety
- Tool fields: `slug` (kebab-case, unique), `name`, `tagline`, `description`, `category` (slug ref), `pricing` (`'Free' | 'Freemium' | 'Paid'`), `features` (string[]), `url`, `rating` (seed value 1.0–5.0)
- Logos: **real brand SVGs for every tool, no fallbacks** — sourced from each tool's brand kit / official assets; stored under `src/assets/tool-logos/<slug>.svg`
- Each `Tool` import statically references its logo via Vite's static asset import: `import logo from '@/assets/tool-logos/<slug>.svg'`

**Storage & Build-Time Validation**
- localStorage key namespace: `aitools:<domain>:<scope>` (e.g., `aitools:auth:session`, `aitools:favorites:user_abc123`, `aitools:theme`)
- Storage envelope: `{ version: 1, data: T }` on every persisted store; reads validate version + shape via Zod, fall back to defaults on schema mismatch
- Build-time slug uniqueness: `__validateSlugsUnique()` exported and called in `data/tools.ts` on module load — throws at startup (and during `vite build`) if duplicates exist
- Logo location: `src/assets/tool-logos/<slug>.svg` (Vite imports them as static URLs; build-time check that every tool has a corresponding file)
- All persisting code goes through `src/lib/storage.ts` helpers; no raw `localStorage.setItem` calls in feature code (enforced by ESLint rule + code review)
- Multi-tab consistency: `storage` event listener wired in storage helper from day one; same-tab updates dispatched manually since `storage` event doesn't fire on the originating tab

**Routing & App Shell**
- React Router v7 declarative mode (`createBrowserRouter`)
- All v1 routes registered with placeholder pages (each rendering its slug from URL via `useParams` to prove URL-as-source-of-truth from day one): `/`, `/signin`, `/signup`, `/forgot-password`, `/onboarding`, `/home`, `/categories`, `/categories/:slug`, `/tools/:slug`, `/compare/:a`, `/compare/:a/vs/:b`, `/search`, `/favorites`, `/profile`, `/rankings`, `/submit`, `/submit/success`, `*` (NotFound)
- Single `<AppShell>` outlet wraps every route, renders `<Header>`, `<Outlet>`, `<Footer>`, and a single `<Toaster />` (sonner) at root
- `<ProtectedRoute>` wrapper exists in this phase but only stubs auth check (always-true placeholder); real auth check lands in Phase 2
- Path alias `@/` configured in `vite.config.ts` and `tsconfig.json`

**Stack Configuration**
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

### Deferred Ideas (OUT OF SCOPE)

- ⌘K command palette (cmdk via shadcn `<Command>`) — researched, not in v1; Phase 4 polish or v2
- Theme-aware favicon — nice-to-have, defer
- Custom ESLint plugin for no-direct-localStorage — start with a grep-based check or convention; harden into a rule only if violations appear
- Tailwind config tweaks beyond brand tokens (custom animation curves, container queries) — defer to Phase 4 polish
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Vite + React 18 + TS + Tailwind v4 + shadcn/ui project scaffolded with `@/` path alias and dev server running | Scaffolding section: exact `pnpm dlx shadcn@latest init -t vite` flow, `vite.config.ts`, `tsconfig.json`, `package.json` snippets |
| FOUND-02 | Router skeleton registers every route | Router section: `createBrowserRouter` skeleton with all 18 paths, `useParams`-driven placeholder pages |
| FOUND-03 | AppShell renders Header, Footer, single `<Toaster />` mounted at root | AppShell section: `<Outlet />` pattern, single Toaster placement, sonner import |
| FOUND-04 | TypeScript interfaces for Tool, Category, User, Session, Review, Vote, Submission with required `slug` on Tool | Already covered in `.planning/research/ARCHITECTURE.md` — copy verbatim into `features/<x>/types.ts` files |
| FOUND-05 | Storage helper with namespaced keys, Zod-validated reads, version fields | Storage helper section: full implementation with `safeGet`/`safeSet`/`storageKey`/`subscribeToKey`, Zod envelope, storage-event listener |
| FOUND-06 | Brand color tokens (green primary, orange accent) defined as CSS variables in `globals.css` for `:root` and `.dark` | Tokens section: full `globals.css` with `@import "tailwindcss"`, `@custom-variant dark`, `@theme inline`, `:root` + `.dark` blocks with HSL values for `#10B981` and `#F97316` |
| FOUND-07 | Build-time validation enforces unique slugs across seed dataset | Build-time validation section: `__validateSlugsUnique()` pattern with module-load throw + Zod check + logo-presence check |
| DATA-01 | ~50 tools across ~10 categories with all required fields | Seed data section: schema, 10 categories listed, sourcing plan for ~50 tools |
| DATA-02 | Categories include the 10 specific names | Seed data section: exact `CategorySlug` union type matching CONTEXT decisions |
| DATA-03 | Each tool has a logo asset | Logo sourcing section: simple-icons primary, brand kits fallback, build-time presence check |
| UX-03 | Inline `<script>` in `index.html` applies persisted theme class before React mounts | Theme/FOUC section: exact 12-line script keyed on `aitools:theme` |
| UX-07 | All persisting actions write through shared storage helper | Storage helper section: API contract; ESLint/grep enforcement noted |
| UX-08 | Multi-tab consistency via `storage` event listener | Storage helper section: `subscribeToKey(key, cb)` implementation with `window.addEventListener('storage', ...)` and same-tab manual dispatch |
</phase_requirements>

## Standard Stack

### Core (verified against npm registry, April 2026)

| Library | Verified Version | Purpose | Why Standard |
|---------|------------------|---------|--------------|
| `vite` | `^6.x` | Dev server + bundler | Required by stack decision; native ESM, single static `dist/` |
| `react` | `^18.3.1` | UI library | Locked to 18 by project (most-tested ecosystem path) |
| `react-dom` | `^18.3.1` | DOM renderer | Pairs with React 18 |
| `typescript` | `^5.6` | Type safety | Locked by stack |
| `@vitejs/plugin-react` | latest | React fast-refresh | Comes with Vite template |
| `@types/node` | latest | `path.resolve` types in `vite.config.ts` | Required for shadcn Vite alias setup |
| `tailwindcss` | `^4.x` | Styling | Locked v4; CSS-first config |
| `@tailwindcss/vite` | `4.2.4` | Tailwind v4 Vite plugin | Replaces PostCSS pipeline |
| `tw-animate-css` | `1.4.0` | Animation utilities | Tailwind v4 successor to deprecated `tailwindcss-animate`; installed by shadcn CLI |
| `react-router` | `7.14.2` | Routing | Locked; declarative mode for SPA |
| `zustand` | `5.0.12` | State + persist | Locked; per-feature store pattern |
| `zod` | `^3.25.x` (latest stable v3 = `3.25.76`) | Schema validation | Locked at v3, NOT v4 (resolver TS overload mismatch with `@hookform/resolvers@5.2.x`) |
| `react-hook-form` | `7.74.0` | Form state | Locked; transitively installed by shadcn |
| `@hookform/resolvers` | `5.2.2` | RHF ↔ Zod bridge | Locked; v3 resolver paired with v3 Zod |
| `next-themes` | `0.4.6` | Theme provider | Locked; works in Vite via `attribute="class"` strategy |
| `sonner` | `2.0.7` | Toasts | Locked; transitively installed by `npx shadcn add sonner` |
| `lucide-react` | `1.11.0` | Icons | Locked; shadcn default |
| `fuse.js` | `7.3.0` | Fuzzy search (used in Phase 3) | Locked; not consumed in Phase 1 but ok to install now |
| `motion` | `12.38.0` | Animations (used in Phase 4) | Locked; not consumed in Phase 1 |

### Supporting (Phase 1 specific)

| Library | Verified Version | Purpose | When to Use |
|---------|------------------|---------|-------------|
| `simple-icons` | `16.18.0` | 3400+ brand SVG icons (CC0) | Primary logo source for ~80% of seed tools |
| `clsx` | shadcn-managed | `cn()` helper | Auto-installed by shadcn |
| `tailwind-merge` | shadcn-managed | `cn()` helper | Auto-installed by shadcn |

### Alternatives Considered (against locked decisions — for plan-check awareness only)

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | shadcn's built-in `ThemeProvider` | shadcn's is 30 LOC and avoids one dep, but lacks `enableSystem` polish and uses key `vite-ui-theme` not `aitools:theme`. CONTEXT locks next-themes — do not switch. |
| simple-icons (npm) | Brandfetch API / per-tool brand kit fetch | simple-icons is offline, CC0, type-safe, and tree-shakable. Use brand kits only as fallback for tools missing from simple-icons. |
| Build-time slug check via module-load throw | Vite plugin that validates at `vite build` | Module-load throw fires both at dev server startup AND during build (because Vite imports the module to bundle it), so it covers both. A separate Vite plugin is over-engineering. |

### Installation (exact commands)

```bash
# Step 1: Scaffold via shadcn CLI v4 (one-shot — Vite + React + TS + Tailwind v4 + tw-animate-css)
pnpm dlx shadcn@latest init -t vite
# OR
npx shadcn@latest init -t vite
#
# Prompts (answer):
#   - Style: New York (default)
#   - Base color: Neutral (matches Figma white background; Stone is also fine)
#   - CSS variables: Yes
#   - Use src/ directory: Yes
#
# This creates:
#   - package.json with vite, react, react-dom, typescript, @types/node,
#     @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, tw-animate-css,
#     clsx, tailwind-merge, class-variance-authority, lucide-react
#   - vite.config.ts with @tailwindcss/vite plugin and @ alias
#   - tsconfig.json + tsconfig.app.json with @/* paths
#   - src/index.css with @import "tailwindcss" + @custom-variant dark + @theme
#   - src/lib/utils.ts with cn() helper
#   - components.json
#   - src/App.tsx, src/main.tsx, index.html

# Step 2: Install Phase 1 runtime deps
npm install react-router@^7.14 \
            zustand@^5.0 \
            zod@^3.25 \
            next-themes@^0.4 \
            simple-icons@^16

# Step 3: Install Phase 1 components from shadcn registry
npx shadcn@latest add button card sonner

# Step 4: Verify dev server
npm run dev    # should serve on http://localhost:5173

# Notes:
#   - DO NOT install tailwindcss-animate (deprecated; tw-animate-css supersedes it)
#   - DO NOT install postcss or autoprefixer; Tailwind v4 + Vite plugin handles both
#   - DO NOT install zod@^4 — @hookform/resolvers@5.2.2 has TS overload mismatch
#   - sonner, lucide-react, react-hook-form will be pulled in by shadcn add as needed;
#     Phase 1 only needs sonner from that list
#   - react-hook-form, @hookform/resolvers, fuse.js, motion are not needed in Phase 1;
#     defer to Phase 2 / Phase 3 / Phase 4 to keep this phase's diff small
```

**Version verification log:**

| Package | Latest as of 2026-04-26 | Pinned in install |
|---------|------------------------|-------------------|
| `simple-icons` | 16.18.0 | `^16` |
| `next-themes` | 0.4.6 | `^0.4` |
| `zustand` | 5.0.12 | `^5.0` |
| `zod` (v3 line) | 3.25.76 | `^3.25` |
| `@tailwindcss/vite` | 4.2.4 | (transitively pinned by shadcn init) |
| `tw-animate-css` | 1.4.0 | (transitively pinned by shadcn init) |
| `react-router` | 7.14.2 | `^7.14` |
| `react-hook-form` | 7.74.0 | (deferred to Phase 2) |
| `@hookform/resolvers` | 5.2.2 | (deferred to Phase 2) |
| `sonner` | 2.0.7 | (transitively from `shadcn add sonner`) |
| `fuse.js` | 7.3.0 | (deferred to Phase 3) |
| `motion` | 12.38.0 | (deferred to Phase 4) |
| `lucide-react` | 1.11.0 | (transitively from shadcn) |

## Architecture Patterns

### Recommended Project Structure (Phase 1 deliverable)

```
.
├── index.html                       # FOUC-prevention inline <script>
├── package.json
├── tsconfig.json                    # extends app/node configs
├── tsconfig.app.json                # baseUrl + @/* path alias
├── tsconfig.node.json
├── vite.config.ts                   # @tailwindcss/vite + @ alias
├── components.json                  # shadcn config
├── vercel.json                      # SPA fallback (rewrite to /index.html)
├── public/
│   └── _redirects                   # Netlify SPA fallback
├── src/
│   ├── main.tsx                     # ReactDOM.createRoot
│   ├── App.tsx                      # ThemeProvider + RouterProvider
│   ├── router.tsx                   # createBrowserRouter, all 18 routes
│   ├── index.css                    # @import "tailwindcss" + tokens
│   │
│   ├── pages/                       # 18 placeholder pages
│   │   ├── LandingPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── CategoryDetailPage.tsx       # uses useParams<{slug}>
│   │   ├── ToolDetailPage.tsx           # uses useParams<{slug}>
│   │   ├── ComparePickerPage.tsx        # uses useParams<{a}>
│   │   ├── ComparePage.tsx              # uses useParams<{a, b}>
│   │   ├── SearchPage.tsx
│   │   ├── FavoritesPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RankingsPage.tsx
│   │   ├── SubmitToolPage.tsx
│   │   ├── SubmitSuccessPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn primitives (button, card, sonner)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Header + <Outlet/> + Footer + <Toaster/>
│   │   │   ├── Header.tsx               # logo + nav stub + ThemeToggle slot
│   │   │   └── Footer.tsx
│   │   └── theme/
│   │       ├── ThemeProvider.tsx        # next-themes wrapper
│   │       └── ThemeToggle.tsx
│   │
│   ├── features/
│   │   └── auth/
│   │       └── components/
│   │           └── ProtectedRoute.tsx   # stub: always-true in Phase 1
│   │
│   ├── lib/
│   │   ├── utils.ts                     # cn() — generated by shadcn
│   │   ├── storage.ts                   # namespaced keys, Zod-validated reads, storage events
│   │   └── slug.ts                      # (optional helper)
│   │
│   ├── types/
│   │   └── index.ts                     # Tool, Category, User, Session, Review, Vote, Submission
│   │
│   ├── data/
│   │   ├── categories.ts                # 10 categories, typed
│   │   ├── tools.ts                     # ~50 tools, typed; calls __validateSlugsUnique() at module load
│   │   └── _validate.ts                 # __validateSlugsUnique + __validateLogosPresent
│   │
│   └── assets/
│       └── tool-logos/                  # <slug>.svg × ~50
│           ├── chatgpt.svg
│           ├── claude.svg
│           ├── ...
│           └── README.md                # provenance: simple-icons vs brand kit, license note
│
└── .planning/                       # (already exists)
```

### Pattern 1: Vite Config with Tailwind v4 Plugin and Path Alias

**What:** Single `vite.config.ts` registers React fast-refresh, Tailwind v4, and the `@/*` import alias.
**When to use:** Always — this is the shadcn-blessed pattern for Vite + Tailwind v4.

```typescript
// vite.config.ts
// Source: https://ui.shadcn.com/docs/installation/vite (verified 2026-04-26)
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

```jsonc
// tsconfig.json (root) — referenced by both app and node configs
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```jsonc
// tsconfig.app.json — adds strict + noUncheckedIndexedAccess per CONTEXT decision
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

### Pattern 2: Tailwind v4 globals.css with Brand Tokens

**What:** All theming lives in CSS via `@theme inline` and per-mode `:root` / `.dark` blocks. No `tailwind.config.ts` is needed in v4.
**When to use:** Always — this replaces the v3 JS config.

```css
/* src/index.css
   Source: https://ui.shadcn.com/docs/tailwind-v4 (verified 2026-04-26)
   Brand: primary = emerald-500 (#10B981), accent = orange-500 (#F97316) per CONTEXT */

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;

  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);

  /* Brand: emerald-500 #10B981 */
  --primary: oklch(0.69 0.15 162);
  --primary-foreground: oklch(0.985 0 0);

  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);

  /* Brand: orange-500 #F97316 */
  --accent: oklch(0.71 0.18 47);
  --accent-foreground: oklch(0.985 0 0);

  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.69 0.15 162);  /* matches --primary for focus rings */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);

  /* Brand: slightly desaturated for dark mode contrast */
  --primary: oklch(0.74 0.14 162);
  --primary-foreground: oklch(0.145 0 0);

  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);

  --accent: oklch(0.75 0.16 47);
  --accent-foreground: oklch(0.145 0 0);

  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.74 0.14 162);
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

**Note on OKLCH vs HSL:** shadcn's CLI v4 emits OKLCH by default in 2026 (better perceptual uniformity in dark mode). HSL still works. The hex-to-oklch conversion above is approximate; the planner should run the values through a converter (e.g., `culori` or `oklch.com`) to match Figma exactly. Quick reference: `#10B981` ≈ `oklch(0.69 0.15 162)`, `#F97316` ≈ `oklch(0.71 0.18 47)`.

### Pattern 3: FOUC-Prevention Inline Script

**What:** A tiny inline `<script>` in `index.html` `<head>` reads `localStorage["aitools:theme"]` and applies the `dark` class to `<html>` BEFORE the React bundle parses.
**When to use:** Always when using class-based dark mode.

```html
<!-- index.html — exact placement: inside <head>, BEFORE the <link rel="stylesheet"> and <script type="module"> -->
<!-- Source: shadcn/ui dark mode docs + next-themes Vite community pattern -->
<script>
  (function () {
    try {
      var key = 'aitools:theme';
      var stored = localStorage.getItem(key);
      var theme = stored ? JSON.parse(stored) : null;
      // next-themes stores the raw string ("dark" | "light" | "system") in localStorage.
      // It is NOT JSON-encoded by next-themes — handle both shapes defensively.
      if (typeof theme !== 'string') theme = stored;
      var isDark =
        theme === 'dark' ||
        ((!theme || theme === 'system') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
    } catch (_) {}
  })();
</script>
```

**Critical:** next-themes writes the theme as a raw string (e.g., `"dark"`), not JSON. The defensive `try { JSON.parse }` above handles both cases. If the planner observes flicker after wiring, log `localStorage.getItem('aitools:theme')` in DevTools — it should be one of `"dark"`, `"light"`, or `"system"` (with quotes if you want JSON shape, without if next-themes is using its raw default).

### Pattern 4: ThemeProvider Wrapping (next-themes in Vite)

```typescript
// src/components/theme/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="aitools:theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

```typescript
// src/App.tsx
import { RouterProvider } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { router } from "./router"

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" visibleToasts={3} />
    </ThemeProvider>
  )
}
```

**Note:** `<Toaster />` mounts here, NOT inside AppShell. Reason: AppShell unmounts/remounts when nested routes transition; the Toaster should outlive every navigation. Mount it at the very root, sibling to RouterProvider.

### Pattern 5: Storage Helper with Zod Envelope and Cross-Tab Subscriber

**What:** Single `src/lib/storage.ts` module is the only code that talks to `localStorage`. Every read validates a `{ version, data }` envelope via Zod and falls back to defaults on shape mismatch. A `subscribeToKey` helper bridges the same-tab gap (the native `storage` event fires only on OTHER tabs).

```typescript
// src/lib/storage.ts
import { z, type ZodType } from "zod"

const NAMESPACE = "aitools"

export function storageKey(domain: string, scope: string = "global"): string {
  return `${NAMESPACE}:${domain}:${scope}`
}

/** Generic envelope every persisted value wraps in. Bump version on shape change. */
export interface StorageEnvelope<T> {
  version: number
  data: T
}

const envelopeSchema = <T extends ZodType>(dataSchema: T) =>
  z.object({ version: z.number().int().nonnegative(), data: dataSchema })

/**
 * Read a value from localStorage, validating the envelope shape and version.
 * Returns `fallback` on any of: missing key, malformed JSON, schema mismatch,
 * or version mismatch. Never throws.
 */
export function safeGet<T>(
  key: string,
  schema: ZodType<T>,
  expectedVersion: number,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const envelope = envelopeSchema(schema).safeParse(parsed)
    if (!envelope.success) {
      console.warn(`[storage] schema mismatch on ${key}, falling back`, envelope.error)
      return fallback
    }
    if (envelope.data.version !== expectedVersion) {
      console.warn(
        `[storage] version mismatch on ${key} (got ${envelope.data.version}, expected ${expectedVersion}), falling back`,
      )
      return fallback
    }
    return envelope.data.data
  } catch (err) {
    console.warn(`[storage] read failed for ${key}`, err)
    return fallback
  }
}

/**
 * Write a value to localStorage wrapped in `{ version, data }`. Dispatches a
 * synthetic `storage` event on the same tab so subscribers update immediately
 * (the native event only fires on other tabs).
 */
export function safeSet<T>(key: string, value: T, version: number): void {
  try {
    const envelope: StorageEnvelope<T> = { version, data: value }
    const serialized = JSON.stringify(envelope)
    const oldValue = localStorage.getItem(key)
    localStorage.setItem(key, serialized)
    // Same-tab fan-out: native `storage` event only fires on OTHER tabs.
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        oldValue,
        newValue: serialized,
        storageArea: localStorage,
      }),
    )
  } catch (err) {
    // QuotaExceededError, SecurityError, etc.
    console.warn(`[storage] write failed for ${key}`, err)
  }
}

/**
 * Subscribe to changes on a specific key (same-tab and cross-tab).
 * Returns an unsubscribe function. Use for non-Zustand consumers; Zustand
 * stores can use the persist middleware's own rehydration hooks.
 */
export function subscribeToKey(key: string, cb: (newValue: string | null) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === key) cb(e.newValue)
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

/** Wipe everything in our namespace — useful for the Phase 5 "Reset App" button. */
export function clearNamespace(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${NAMESPACE}:`))
    .forEach((k) => localStorage.removeItem(k))
}
```

**Critical detail on Zustand integration:** Zustand's `persist` middleware writes to `localStorage` directly via its own `createJSONStorage(() => localStorage)`. Phase 2's stores will need to either (a) wrap that storage to inject the version envelope, or (b) use Zustand's own `version` + `migrate` config and skip our envelope on persist-managed keys. Recommended (a) — keep one envelope shape across all keys for grep-ability and Phase 4 multi-tab consistency.

A custom storage adapter for Zustand persist (Phase 2 will implement, but document the shape here so Phase 1 leaves room):

```typescript
// Sketch — Phase 2 deliverable, shown for forward-compat
import { createJSONStorage, type StateStorage } from "zustand/middleware"

export const versionedStorage = (version: number): StateStorage => ({
  getItem: (name) => {
    const raw = localStorage.getItem(name)
    if (!raw) return null
    try {
      const env = JSON.parse(raw)
      if (env?.version !== version) return null  // forces persist to use initial state
      return JSON.stringify(env.data)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    const envelope = { version, data: JSON.parse(value) }
    localStorage.setItem(name, JSON.stringify(envelope))
    window.dispatchEvent(new StorageEvent("storage", { key: name, newValue: JSON.stringify(envelope), storageArea: localStorage }))
  },
  removeItem: (name) => localStorage.removeItem(name),
})
```

### Pattern 6: Router Skeleton with Placeholder Pages

```typescript
// src/router.tsx
import { createBrowserRouter } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
// 18 page imports omitted for brevity

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/signin", element: <SignInPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/categories/:slug", element: <CategoryDetailPage /> },
      { path: "/tools/:slug", element: <ToolDetailPage /> },
      { path: "/compare/:a", element: <ComparePickerPage /> },
      { path: "/compare/:a/vs/:b", element: <ComparePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/rankings", element: <RankingsPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/onboarding", element: <OnboardingPage /> },
          { path: "/home", element: <HomePage /> },
          { path: "/favorites", element: <FavoritesPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/submit", element: <SubmitToolPage /> },
          { path: "/submit/success", element: <SubmitSuccessPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
```

**Placeholder page convention** — every dynamic route must read params via `useParams` so URL-as-source-of-truth is enforced from day one. Example:

```typescript
// src/pages/ToolDetailPage.tsx — Phase 1 placeholder
import { useParams } from "react-router"

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-2xl font-semibold">Tool Detail (placeholder)</h1>
      <p className="text-muted-foreground">slug from URL: <code>{slug}</code></p>
    </main>
  )
}
```

```typescript
// src/pages/ComparePage.tsx — Phase 1 placeholder
import { useParams } from "react-router"

export default function ComparePage() {
  const { a, b } = useParams<{ a: string; b: string }>()
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-2xl font-semibold">Compare (placeholder)</h1>
      <p className="text-muted-foreground">a = <code>{a}</code>, b = <code>{b}</code></p>
    </main>
  )
}
```

This ensures the structural fix lands in Phase 1 even though the feature work is Phase 3.

### Pattern 7: Build-Time Slug Uniqueness Check

```typescript
// src/data/_validate.ts
import type { Tool } from "@/types"

export function __validateSlugsUnique(tools: ReadonlyArray<Tool>): void {
  const seen = new Map<string, string>()
  for (const t of tools) {
    if (seen.has(t.slug)) {
      throw new Error(
        `[seed] duplicate slug "${t.slug}" — found on "${seen.get(t.slug)}" and "${t.name}". ` +
          `Slugs must be unique.`,
      )
    }
    seen.set(t.slug, t.name)
  }
}

export function __validateLogosPresent(tools: ReadonlyArray<Tool>): void {
  // tool.logo is a Vite-imported URL string. If the import succeeded at build
  // time, the string will be non-empty. An empty string here means the import
  // path was broken or the static asset module returned undefined.
  for (const t of tools) {
    if (!t.logo || typeof t.logo !== "string") {
      throw new Error(`[seed] tool "${t.slug}" has missing or invalid logo asset.`)
    }
  }
}
```

```typescript
// src/data/tools.ts
import type { Tool } from "@/types"
import { __validateSlugsUnique, __validateLogosPresent } from "./_validate"

import chatgptLogo from "@/assets/tool-logos/chatgpt.svg"
import claudeLogo from "@/assets/tool-logos/claude.svg"
// ... 48 more imports

export const TOOLS: ReadonlyArray<Tool> = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "Conversational AI assistant from OpenAI.",
    description: "...",
    category: "writing",
    pricing: "Freemium",
    features: ["Long-form chat", "Code generation", "Image input"],
    url: "https://chat.openai.com",
    rating: 4.7,
    logo: chatgptLogo,
  },
  // ... 49 more tools
] as const

// Module-load validation: throws at dev-server start AND during `vite build`.
__validateSlugsUnique(TOOLS)
__validateLogosPresent(TOOLS)
```

**Why module-load throw works as a "build-time" check:** Vite resolves and executes ESM imports during both dev (`vite`) and build (`vite build`). If `tools.ts` throws at module-load, both fail. No separate Vite plugin or pre-build script is required. This is the lightest-weight implementation that satisfies FOUND-07.

### Pattern 8: Vercel and Netlify SPA Fallback Config

**Why:** A direct browser load of `/tools/chatgpt` on a static host returns 404 unless the host is configured to serve `/index.html` for unknown paths. CONTEXT specifies this lands in Phase 1 so it gets exercised throughout development.

```jsonc
// vercel.json (project root)
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

```
# public/_redirects (Netlify) — copied to dist/ on build
/*   /index.html   200
```

Both files are tiny and harmless on the wrong host (Vercel ignores `_redirects`, Netlify ignores `vercel.json`). Ship both so the project is host-agnostic.

### Anti-Patterns to Avoid

- **`postcss.config.js` left over from a CRA/v3 template** — Tailwind v4 + `@tailwindcss/vite` removes the need; leftover file causes confusing build errors. Verify it does not exist after scaffolding.
- **Installing `tailwindcss-animate`** — deprecated; Tailwind v4 setups break with the old plugin. Use `tw-animate-css` (installed by shadcn CLI).
- **Storing the theme key as `theme` (default next-themes key)** — collides with any other app on the same origin. CONTEXT mandates `aitools:theme`.
- **Mounting `<Toaster />` inside `AppShell`** — AppShell is the route layout; nested route changes can cause it to re-render. Mount once in `App.tsx` instead.
- **Reading `localStorage` from a `useEffect`** — causes FOUC / hydration flicker. Always use lazy `useState(() => loadFromLocalStorage())` or Zustand's `persist` (which hydrates synchronously).
- **`tools[0]`, `tools.find(t => t.id === id)` with numeric id** — slug is the primary key per ARCHITECTURE.md and PITFALLS #1/#2. Always lookup by slug.
- **Component-local state for selected compare tools** — URL is the source of truth. Even in Phase 1 placeholders, the page must read params via `useParams`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme provider with system-preference detection | A custom `useState`/`useEffect` toggler | `next-themes` (locked by CONTEXT) | system pref + storage sync + cross-tab + `disableTransitionOnChange` are all subtle edge cases |
| Class-merging utility (`cn()`) | A `tw-classes` helper | `clsx` + `tailwind-merge` (installed by shadcn) | Conflict resolution for `bg-red-500 bg-blue-500` requires tailwind-merge's parser |
| FOUC-prevention | Defer to "Phase 4 polish" | Inline script in `index.html` (this phase) | Once features render with `useEffect`-driven theme, a flash is visible on every reload — much harder to retrofit |
| Logo collection | Hand-extracting SVGs from each tool's site | `simple-icons` package + brand kit fallback | 3400+ icons, CC0, type-safe, tree-shakable — covers ~80% of seed tools out of the box |
| Slug uniqueness check | An ad-hoc grep in CI | `__validateSlugsUnique()` at module-load | Module-load throw fires in both dev and build; CI grep is asynchronous to the dev experience |
| SPA fallback for direct URL loads | `useEffect` polyfills or hash-based routing | `vercel.json` rewrites + Netlify `_redirects` | Static host config is the only correct fix for direct-URL refresh |
| Multi-tab sync | A `setInterval(rehydrate, 1000)` poll | Native `storage` event + manual same-tab dispatch | Polling wastes battery; native event fires immediately on cross-tab writes |
| localStorage parse safety | Bare `JSON.parse(localStorage.getItem(x))` with `as User` | Zod schema + version envelope in `safeGet` | Type assertions don't validate; one corrupt write crashes the app on every read |

**Key insight:** This phase is a "buy, don't build" phase. Every line of custom code should compose libraries that already solve the problem. The few new abstractions (storage helper, slug validator, AppShell) exist purely to enforce conventions across the rest of the codebase.

## Common Pitfalls

### Pitfall 1: shadcn CLI prompts make subtle wrong defaults sticky

**What goes wrong:** First-time users accept defaults without thinking. The base color "Slate" gives a cooler grayscale than the warm Figma whites; "RSC: yes" silently breaks because Vite has no React Server Components.
**Why it happens:** CLI v4 has 5+ prompts; mistakes are fast to make and slow to find.
**How to avoid:** Document exact answers in the install command (above). Run `npx shadcn@latest init -t vite` with `--defaults` only after confirming the defaults match. Verify by reading `components.json` immediately after init.
**Warning signs:** `components.json` shows `rsc: true` (must be false), or `tailwind.baseColor: "slate"` (should be "neutral" or "stone" for Figma whites).

### Pitfall 2: next-themes localStorage key collides with persisted theme value shape

**What goes wrong:** next-themes writes the theme as a raw string like `"dark"` (without JSON quoting in some versions). The FOUC-prevention script does `JSON.parse` and crashes silently. Result: dark mode setting is ignored on first paint, light flash visible.
**Why it happens:** next-themes' storage shape has varied between major versions.
**How to avoid:** Use the defensive try-block in the FOUC script (Pattern 3 above). Verify after wiring: open DevTools → Application → localStorage → check the exact shape of `aitools:theme`.
**Warning signs:** Refreshing in dark mode shows a white flash; `localStorage.getItem('aitools:theme')` returns a non-quoted string in DevTools.

### Pitfall 3: `useParams` returns `undefined` for routes that didn't match the param

**What goes wrong:** `const { slug } = useParams<{slug: string}>()` typed as `string` lies — the real type is `string | undefined`. With `noUncheckedIndexedAccess`, the compiler catches array hazards but not param hazards.
**Why it happens:** React Router types params as `Partial<Record<string, string>>`.
**How to avoid:** Always treat param reads as nullable. In Phase 1 placeholders, render the slug as-is (gracefully handles undefined). In Phase 3 features, narrow with `if (!slug) return <NotFound />` before any `tools.find` call.
**Warning signs:** `tools.find(t => t.slug === slug)` where `slug` could be undefined — falsy === comparison, returns nothing, page silently 404s.

### Pitfall 4: Build-time slug check misses logo file presence

**What goes wrong:** Two tools have unique slugs but one references `@/assets/tool-logos/chatgptt.svg` (typo). The slug check passes; the build fails with a confusing module-not-found error halfway through `vite build`.
**Why it happens:** Vite's static asset import is a separate module-resolution concern from slug uniqueness.
**How to avoid:** Run `__validateLogosPresent(TOOLS)` at module load alongside the slug check (Pattern 7 above). Also: maintain `src/assets/tool-logos/README.md` listing every expected slug — easy to grep against `tools.ts` if a build fails.
**Warning signs:** `vite build` succeeds in dev (no module imported yet) but fails in production. Or: `tool.logo` is the literal string `"undefined"` because the asset was missing and TS didn't complain.

### Pitfall 5: Vercel/Netlify SPA fallback isn't tested until deploy day

**What goes wrong:** Dev works (`vite` proxies all paths to `index.html`). `vite preview` works (its dev server proxies too). The deployed Vercel build returns 404 for direct loads of `/tools/chatgpt`.
**Why it happens:** Static hosts default to filesystem routing; SPA fallback must be opted into.
**How to avoid:** Ship `vercel.json` and `public/_redirects` in this phase. Test by running a deploy preview (or `npx serve dist` with `--single` flag) and visiting `/tools/foo` directly.
**Warning signs:** Direct URL `/tools/chatgpt` works in `vite preview` but 404s on the deployed URL.

### Pitfall 6: Logo authorship time is underestimated

**What goes wrong:** ~50 tools × (find SVG → trace license → store under correct slug → import) is several hours of content work. If left to the end of Phase 1 it eats into Phase 2.
**Why it happens:** It feels like "asset gathering, not coding." It also feels parallel-able but actually requires careful attribution per tool.
**How to avoid:** Break logo authorship into its own task (or wave) early. Use `simple-icons` for the ~40 tools with broad recognition; reserve manual brand-kit work for the ~10 long-tail picks.
**Warning signs:** End of Phase 1 with 30/50 logos and "I'll finish them in Phase 2." Don't.

## Code Examples

### Example: ProtectedRoute stub (Phase 1 placeholder, real check lands Phase 2)

```typescript
// src/features/auth/components/ProtectedRoute.tsx
import { Outlet } from "react-router"

export function ProtectedRoute() {
  // Phase 1: always allow. Phase 2 replaces with real auth check.
  return <Outlet />
}
```

### Example: AppShell with single Toaster placement

```typescript
// src/components/layout/AppShell.tsx
import { Outlet } from "react-router"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
// Note: <Toaster /> is mounted once in App.tsx (sibling of RouterProvider),
// NOT here. AppShell can re-render across nested route transitions.
```

### Example: simple-icons usage for a tool logo

For tools covered by `simple-icons`, the recommended workflow is to copy the SVG into `src/assets/tool-logos/<slug>.svg` rather than importing at runtime (keeps `Tool` import shape uniform):

```bash
# Find the icon path
node -e "const i = require('simple-icons').siChatgpt; console.log(i.svg)" \
  > src/assets/tool-logos/chatgpt.svg
```

For tools not in simple-icons, source from each tool's official brand kit / press page. Document provenance in `src/assets/tool-logos/README.md`:

```markdown
# Tool Logo Provenance

| Slug | Source | License |
|------|--------|---------|
| chatgpt | simple-icons (siChatgpt) | CC0 |
| claude | simple-icons (siClaude) | CC0 |
| cursor | simple-icons (siCursor) | CC0 |
| midjourney | simple-icons (siMidjourney) | CC0 |
| ... | ... | ... |
| <long-tail-tool> | https://<tool>.com/press-kit | (see brand-kit terms) |
```

### Example: Sourcing strategy summary for ~50 tools

Recommended split (planner can adjust):

| Tier | Approach | Estimated count | Time per logo |
|------|----------|-----------------|---------------|
| Tier 1 — well-known leaders | `simple-icons` package, copy `.svg` to assets | ~35 | ~1 min |
| Tier 2 — covered by simple-icons but obscure | `simple-icons` (verify visual fidelity) | ~5 | ~2 min |
| Tier 3 — not in simple-icons | Brand kit / press page download | ~10 | ~5–10 min |

Total time budget: ~2–3 hours of focused asset work. Schedule into one or two atomic tasks during the phase, not as a "background" effort.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` JS config | `globals.css` `@theme` directive | Tailwind v4 (2025) | No JS config file; tokens in CSS |
| `postcss.config.js` + `autoprefixer` | `@tailwindcss/vite` plugin | Tailwind v4 + Vite (2025) | Delete `postcss.config.js` if scaffolded |
| `tailwindcss-animate` | `tw-animate-css` | shadcn CLI v4 (2026) | Different package, different import; shadcn installs the new one |
| Manual shadcn install (clone repo, copy files) | `npx shadcn@latest init -t vite` (CLI v4) | March 2026 | One-shot scaffolding; all configs generated |
| `react-router-dom` (separate package) | `react-router` (consolidated) | v7 (Dec 2024) | Import from `react-router`, not `react-router-dom` |
| `framer-motion` package | `motion` package (`motion/react`) | mid-2025 | Renamed; legacy package still publishes but is the old path |
| HSL CSS variables in shadcn theme | OKLCH in CLI v4 default | March 2026 | Better dark-mode contrast; either format works |
| Zod v4 with `@hookform/resolvers` | Zod v3.25+ | March 2026 (resolver overload bug) | Keep on v3.25+ until resolver re-pins |

**Deprecated / outdated:**
- `tailwindcss-animate` — replaced by `tw-animate-css`
- `react-router-dom` import path — use `react-router` (the dom package is a shim)
- `framer-motion` package name — use `motion`
- shadcn legacy `<Toast>` component — use `<Sonner>` via `npx shadcn add sonner`
- `postcss.config.js` for Tailwind — replaced by `@tailwindcss/vite` plugin

## Open Questions

1. **OKLCH vs HSL for brand tokens — which exact values match Figma?**
   - What we know: shadcn CLI v4 emits OKLCH; both formats are valid. The hex values `#10B981` and `#F97316` are locked.
   - What's unclear: the exact OKLCH approximation (the values in Pattern 2 are computed but unverified against Figma's color picker).
   - Recommendation: Planner should include a verification task that opens the dev server alongside Figma at 1440px and compares the primary button rendering. If off, run hex through `https://oklch.com` or `culori` for an exact translation. Alternative: keep HSL — it's a single `globals.css` swap and unambiguous from hex.

2. **Should `__validateLogosPresent` also check that imported SVG is non-empty (vs. just truthy URL)?**
   - What we know: Vite's `?url` import returns a URL string; an empty string is impossible if the file resolved. A 0-byte SVG resolves to a valid URL.
   - What's unclear: whether to additionally fetch the URL at build time and assert size > 0.
   - Recommendation: Skip — over-engineering. Visual review during seed authorship catches 0-byte SVGs.

3. **ESLint rule for no-direct-localStorage — plugin or grep?**
   - What we know: CONTEXT lists this as Claude's discretion. CI grep is faster to set up, ESLint plugin is more authoritative.
   - Recommendation: Start with a `lint:no-direct-localstorage` npm script using `grep -RInE "localStorage\.(set|get|remove|clear)Item" src/ --exclude-dir=src/lib` exiting non-zero on match. Add to `npm run lint` chain. Promote to a custom ESLint plugin in Phase 4 only if violations slip through.

4. **Should Phase 1 ship a real Header or a stub?**
   - What we know: Header is the AppShell child; brand tokens, theme toggle, and search bar stub are reasonable for Phase 1.
   - Recommendation: Stub-quality Header is fine — logo + nav links + theme toggle. Real search wiring is Phase 3. Document in plan as "Header stub: nav links go nowhere except `/` and `/categories`."

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.x (recommended — Vite-native, zero config in shadcn-scaffolded Vite projects) |
| Config file | `vitest.config.ts` (Wave 0 — does not exist after `shadcn init`) |
| Quick run command | `npx vitest run --reporter=verbose` (or `npx vitest --run` for CI shape) |
| Full suite command | `npx vitest run && npm run build && npm run typecheck` (full Phase 1 gate) |

**Why Vitest, not Jest:** Vite-native (no separate config), TS-native, identical config surface to `vite.config.ts`. Phase 1 is infrastructure-only — Vitest is sufficient.

**Why no Playwright/Cypress in Phase 1:** This phase has no user flows. Every requirement is verifiable via build-time check, unit test, or smoke render. Add Playwright in Phase 3 when real features land.

### Phase Requirements → Test Map

This phase is **infrastructure-only**, so the testing pyramid is heavily weighted toward build-time and unit checks, with a thin smoke layer. No e2e, no manual flows beyond visual verification.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Vite scaffolded, dev server boots, `@/` alias resolves | smoke (build) | `npm run build` exits 0 | Wave 0 |
| FOUND-01 | TypeScript strict + `noUncheckedIndexedAccess` enforced | typecheck | `npm run typecheck` (= `tsc --noEmit`) exits 0 | Wave 0 |
| FOUND-02 | All 18 routes registered and render placeholder | unit (router smoke) | `npx vitest run tests/router.test.tsx` | Wave 0 — `tests/router.test.tsx` |
| FOUND-02 | `/tools/:slug` placeholder reads slug from URL | unit | `npx vitest run tests/pages/ToolDetailPage.test.tsx -t "reads slug"` | Wave 0 |
| FOUND-02 | `/compare/:a/vs/:b` placeholder reads both params from URL | unit | `npx vitest run tests/pages/ComparePage.test.tsx -t "reads a and b"` | Wave 0 |
| FOUND-03 | AppShell renders Header, Outlet, Footer | unit | `npx vitest run tests/components/AppShell.test.tsx` | Wave 0 |
| FOUND-03 | Single `<Toaster />` mounted at root (App.tsx) | unit | `npx vitest run tests/App.test.tsx -t "single Toaster"` | Wave 0 |
| FOUND-04 | TypeScript interfaces compile (Tool requires slug, etc.) | typecheck | `npm run typecheck` exits 0; negative test in `tests/types.test-d.ts` | Wave 0 — `tests/types.test-d.ts` |
| FOUND-05 | Storage helper namespacing | unit | `npx vitest run tests/lib/storage.test.ts -t "storageKey"` | Wave 0 — `tests/lib/storage.test.ts` |
| FOUND-05 | Storage helper Zod-validated reads (schema mismatch → fallback) | unit | `npx vitest run tests/lib/storage.test.ts -t "schema mismatch"` | Wave 0 |
| FOUND-05 | Storage helper version mismatch → fallback | unit | `npx vitest run tests/lib/storage.test.ts -t "version mismatch"` | Wave 0 |
| FOUND-05 | Storage helper writes wrap envelope `{version, data}` | unit | `npx vitest run tests/lib/storage.test.ts -t "writes envelope"` | Wave 0 |
| FOUND-06 | `globals.css` contains `--primary` and `--accent` for `:root` and `.dark` | build-time grep | `grep -E "^\s*--primary:" src/index.css \| wc -l` returns ≥ 2 | manual one-liner (no test file needed) |
| FOUND-06 | Brand tokens compile through Tailwind v4 build | smoke (build) | `npm run build` exits 0 (PostCSS errors would surface here) | covered by FOUND-01 |
| FOUND-07 | Slug uniqueness throws on duplicates | unit | `npx vitest run tests/data/_validate.test.ts -t "duplicate slug"` | Wave 0 — `tests/data/_validate.test.ts` |
| FOUND-07 | Logo presence throws on missing | unit | `npx vitest run tests/data/_validate.test.ts -t "missing logo"` | Wave 0 |
| FOUND-07 | `vite build` fails when seed has duplicate slug (integration) | smoke (build) | scripted: temporarily duplicate a slug, expect non-zero `npm run build`, then revert | manual integration check (one-time, not in CI) |
| DATA-01 | ~50 tools loaded with all required fields | unit | `npx vitest run tests/data/tools.test.ts -t "shape"` | Wave 0 |
| DATA-02 | 10 categories with the exact 10 names | unit | `npx vitest run tests/data/categories.test.ts -t "exact set"` | Wave 0 |
| DATA-03 | Every tool has a non-empty logo URL | unit | `npx vitest run tests/data/tools.test.ts -t "logo"` (covered by `__validateLogosPresent`) | Wave 0 |
| UX-03 | Inline FOUC script present in `index.html` | grep | `grep -q "aitools:theme" index.html` exits 0 | manual one-liner |
| UX-03 | Theme persists across reload | manual smoke | open dev server, toggle dark, reload, verify class on `<html>` and no white flash | manual (no automated headless test in Phase 1) |
| UX-07 | No `localStorage.setItem`/`getItem`/`removeItem` outside `src/lib/storage.ts` | grep (CI) | `! grep -RInE "localStorage\.(set\|get\|remove\|clear)Item" src/ --exclude-dir=src/lib --exclude=src/lib/storage.ts` | npm script `lint:no-direct-localstorage` |
| UX-08 | `subscribeToKey` fires on cross-tab `storage` event | unit | `npx vitest run tests/lib/storage.test.ts -t "subscribeToKey cross-tab"` (uses synthetic StorageEvent) | Wave 0 |
| UX-08 | `safeSet` dispatches same-tab synthetic `storage` event | unit | `npx vitest run tests/lib/storage.test.ts -t "same-tab dispatch"` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run typecheck && npx vitest run --changed HEAD~1` (only tests touching files in the diff). Runs in <10s on this codebase size.
- **Per wave merge:** `npm run typecheck && npx vitest run && npm run lint:no-direct-localstorage && npm run build`. Full suite under 30s.
- **Phase gate (`/gsd:verify-work`):** Full suite green AND manual smoke checks passed (FOUC reload check, direct-URL load of `/tools/chatgpt` against `vite preview`, deploy-preview smoke against Vercel/Netlify).

### Wave 0 Gaps

This is a greenfield phase — no test infra exists yet. Wave 0 must establish:

- [ ] `vitest.config.ts` — extend `vite.config.ts`, configure jsdom environment for component tests
- [ ] `tests/setup.ts` — global setup (jsdom matchers, optional `@testing-library/jest-dom`)
- [ ] `package.json` scripts: `"test": "vitest"`, `"test:run": "vitest run"`, `"typecheck": "tsc --noEmit"`, `"lint:no-direct-localstorage": "! grep -RInE 'localStorage\\.(set|get|remove|clear)Item' src/ --exclude-dir=src/lib --exclude=src/lib/storage.ts"`
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/dom`
- [ ] `tests/router.test.tsx` — covers FOUND-02 (renders router with `MemoryRouter`, asserts placeholder present for each path)
- [ ] `tests/components/AppShell.test.tsx` — covers FOUND-03
- [ ] `tests/App.test.tsx` — covers FOUND-03 (Toaster mount)
- [ ] `tests/types.test-d.ts` — covers FOUND-04 (compile-time-only assertions; uses `expectTypeOf` from Vitest)
- [ ] `tests/lib/storage.test.ts` — covers FOUND-05, UX-08
- [ ] `tests/data/_validate.test.ts` — covers FOUND-07
- [ ] `tests/data/tools.test.ts` — covers DATA-01, DATA-03
- [ ] `tests/data/categories.test.ts` — covers DATA-02
- [ ] `tests/pages/ToolDetailPage.test.tsx` and `tests/pages/ComparePage.test.tsx` — covers FOUND-02 URL-as-source-of-truth invariant

**Testing pyramid for an infrastructure-only phase:**

```
        manual smoke (FOUC, direct URL)   ← 2 checks
       ─────────────────────────────────
       integration smoke (vite build)     ← 1 check
      ────────────────────────────────────
      unit + typecheck                     ← ~15 tests
   ──────────────────────────────────────────
   build-time invariants (slug, logo)     ← 2 throws
```

This is inverted from a normal pyramid because there's no user flow to e2e. Build-time invariants (the bottom layer) are the highest-leverage tests in this phase: they fire on every dev-server start AND every `vite build`, so they cannot be skipped.

## Sources

### Primary (HIGH confidence)
- [shadcn/ui — Vite installation](https://ui.shadcn.com/docs/installation/vite) — verified `pnpm dlx shadcn@latest init -t vite` flow, `vite.config.ts`, `tsconfig.json`, `src/index.css` snippets (April 2026)
- [shadcn/ui — Tailwind v4 migration](https://ui.shadcn.com/docs/tailwind-v4) — confirmed `@import "tailwindcss"`, `@custom-variant dark`, `@theme inline` blocks, OKLCH defaults
- [shadcn/ui — Dark Mode (Vite)](https://ui.shadcn.com/docs/dark-mode/vite) — confirmed shadcn ships its own ThemeProvider; CONTEXT chose next-themes alternative
- [next-themes README](https://github.com/pacocoursey/next-themes) — confirmed `attribute`, `storageKey`, `defaultTheme`, `enableSystem` props; FOUC pattern is auto-injected in Next.js but must be hand-authored in Vite
- [Zustand persist middleware](https://github.com/pmndrs/zustand) — `createJSONStorage`, `version`, `migrate` API surface (verified for Phase 2 forward-compat)
- [React Router v7 docs](https://reactrouter.com/start/declarative/installation) — confirmed `react-router` package import path, `createBrowserRouter` API
- [npm registry — verified versions for simple-icons (16.18.0), next-themes (0.4.6), zustand (5.0.12), zod v3 (3.25.76), @tailwindcss/vite (4.2.4), tw-animate-css (1.4.0), react-router (7.14.2), sonner (2.0.7), lucide-react (1.11.0)](https://www.npmjs.com) — direct registry queries 2026-04-26

### Secondary (MEDIUM confidence)
- [Project research: STACK.md, ARCHITECTURE.md, PITFALLS.md, SUMMARY.md](.planning/research/) — internal upstream research, all HIGH confidence per their own metadata; treated as MEDIUM here only because this phase research did not independently re-verify every claim
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js — Not A Number](https://notanumber.in/blog/fixing-react-dark-mode-flickering) — corroborates inline-script-in-index.html FOUC pattern
- [Cross-Tab State Synchronization in React Using Browser storage Event — Medium](https://medium.com/@vinaykumarbr07/cross-tab-state-synchronization-in-react-using-the-browser-storage-event-14b6f1a97ea6) — corroborates same-tab dispatch trick
- [Simple Icons GitHub](https://github.com/simple-icons/simple-icons) — 3400+ brand SVGs, CC0, npm v16.18.0

### Tertiary (LOW confidence — flagged for validation during planning)
- Exact OKLCH values for `#10B981` / `#F97316` — computed via approximation; planner should verify against Figma at first use (see Open Questions #1)
- next-themes raw localStorage shape (`"dark"` vs `"\"dark\""`) — defensive try-block in FOUC script handles both, but the exact shape varies across versions and was not directly verified for v0.4.6

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified against npm registry on 2026-04-26
- Architecture patterns: HIGH — copied from project-level ARCHITECTURE.md (HIGH there) plus phase-specific implementation snippets cross-referenced with shadcn official docs
- Tooling/config snippets: HIGH — verified against shadcn Vite install docs on 2026-04-26
- FOUC/theme: MEDIUM-HIGH — pattern is well-established but next-themes' exact storage shape is version-dependent; defensive script handles both
- Logo sourcing: HIGH — simple-icons 16.18.0 is verified to cover 3400+ brands; coverage of named tools (ChatGPT, Claude, etc.) high probability but spot-check during authorship
- Validation architecture: HIGH — Vitest is the canonical Vite-native test runner; pyramid composition matches the infrastructure-only phase shape
- Open questions: explicitly LOW where flagged

**Research date:** 2026-04-26
**Valid until:** 2026-05-26 (30 days for stable stack picks; sooner if zod v3 line, shadcn CLI, or simple-icons ship a major)
