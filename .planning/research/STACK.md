# Stack Research

**Domain:** Static React SPA — AI tools discovery / compare / community-rankings (UI/UX final, localStorage-only)
**Researched:** 2026-04-26
**Confidence:** HIGH on all picks below. The base stack (Vite, React 18, TS, Tailwind, shadcn/ui) is fixed by the user — this doc fills in everything around it.

---

## TL;DR — The Specific Picks

| Need | Pick | Version (Apr 2026) | Confidence |
|---|---|---|---|
| Routing | `react-router` v7 (declarative SPA mode) | `^7.14` | HIGH |
| Form handling | `react-hook-form` + `@hookform/resolvers` | `^7.54` / `^5.2` | HIGH |
| Validation | `zod` v3 (NOT v4 — see below) | `^3.24` | HIGH |
| Global state | `zustand` w/ `persist` middleware | `^5.0` | HIGH |
| Theming / dark mode | `next-themes` (works fine in Vite) | `^0.4` | HIGH |
| Toasts | `sonner` (already shipped by shadcn) | `^1.7` | HIGH |
| Animations | `motion` (formerly `framer-motion`) | `^12` | HIGH |
| Icons | `lucide-react` (shadcn default) | `^0.46x`–`^0.50x` (current `1.8`) | HIGH |
| Search (50 tools) | `fuse.js` | `^7.1` | HIGH |
| Command palette (optional ⌘K) | `cmdk` via shadcn `<Command>` | shadcn-managed | HIGH |
| Class merging | `clsx` + `tailwind-merge` (auto-installed by shadcn) | shadcn-managed | HIGH |

**Skip these — shadcn already ships them:** Sonner (toast), Dialog, Dropdown, Popover, Select, Tabs, Avatar, Sheet, Command, Form (React Hook Form wrapper), Skeleton, Tooltip, Toggle, Switch, Slider, ScrollArea. **Don't double-add.**

---

## Recommended Stack

### Core Technologies (already chosen — listed for completeness)

| Technology | Version | Purpose | Why |
|---|---|---|---|
| Vite | `^6.x` | Dev server + build tool | Faster than CRA, native ESM, single static `dist/`. CRA is dead, Next.js overhead unjustified without a backend. |
| React | `18.3.x` | UI library | Required by user. React 19 is fine too but staying on 18 keeps the entire ecosystem (react-hook-form, motion, react-router v7) on the most-tested path. |
| TypeScript | `^5.6` | Type safety | Table stakes for a UI/UX final being graded on polish. |
| Tailwind CSS | `^4.x` (via `@tailwindcss/vite`) | Styling | Tailwind v4 is now the shadcn default. Note: v4 uses `@import "tailwindcss"` in CSS, not `@tailwind base/components/utilities`. PostCSS config is no longer needed. |
| shadcn/ui | latest CLI | Component primitives (Radix-backed) | Source-owned components match Figma's clean card aesthetic; CLI v4 (March 2026) scaffolds Vite templates with dark mode + tw-animate-css preinstalled. |
| `tw-animate-css` | shadcn-managed | Animation utility classes | Replaced `tailwindcss-animate` in 2025 — shadcn installs it automatically. **Do not** install `tailwindcss-animate` separately. |

### Supporting Libraries (the actual research)

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| `react-router` | `^7.14` | Client-side routing | All page navigation: `/`, `/signin`, `/onboarding/*`, `/categories/:slug`, `/tools/:slug`, `/compare/:a/:b`, `/rankings`, `/submit`, `/profile`, `/favorites`. Use **declarative mode** (no SSR/loaders) for a static deploy. |
| `react-hook-form` | `^7.54` | Form state + validation wiring | Sign in, sign up, forgot password, write review, submit a tool. Pairs with shadcn's `<Form>` component out of the box. |
| `@hookform/resolvers` | `^5.2` | Bridge react-hook-form ↔ zod | Required to use Zod schemas as form validators. |
| `zod` | `^3.24` (NOT v4) | Schema validation for forms + localStorage hydration | Validate form input, validate localStorage payloads on read (defensive — schemas drift over a 2-week project). See "What NOT to Use" for why v3 not v4. |
| `zustand` | `^5.0` | Global state + localStorage persistence | One store per concern: `useAuthStore` (current user), `useFavoritesStore`, `useVotesStore`, `useReviewsStore`, `useSubmissionsStore`. The `persist` middleware writes to localStorage automatically — this is the entire reason to pick Zustand for this project. |
| `next-themes` | `^0.4` | Light/dark mode toggle | Works in Vite despite the name. Hooks into Tailwind's `dark:` variant via the `class` strategy. Persists choice to localStorage. shadcn's official Vite dark-mode docs use it. |
| `sonner` | `^1.7` | Toast notifications | **Already shipped via `npx shadcn add sonner`.** Mount `<Toaster />` once at app root, then `toast.success("Favorited")` from anywhere. Don't add `react-hot-toast` — duplicate functionality. |
| `motion` | `^12` | Animations (page transitions, card hover, list reordering) | Polish moments: rankings list reorder on upvote, modal/sheet enter-exit, hero entrance. Import from `motion/react`. |
| `lucide-react` | current (~`1.8`, but follow shadcn's pin) | Icon set | Default for shadcn. Tree-shakable; only imported icons are bundled. ~1,600 icons covers everything in the Figma. |
| `fuse.js` | `^7.1` | Fuzzy search over the ~50-tool catalog | Index `name`, `description`, `category`, `tags` with weighted keys. 50 items is well below any perf concern; fuzzy matching tolerates typos which matters in a graded UX demo. |
| `cmdk` | shadcn-managed | ⌘K command palette (optional polish) | If time permits in week 2: shadcn's `<Command>` wraps `cmdk` for a portfolio-grade quick-search overlay. Already installed if you `npx shadcn add command`. |
| `clsx` + `tailwind-merge` | shadcn-managed | The `cn()` helper in `lib/utils.ts` | shadcn auto-installs both. Don't think about them — just use `cn(...)`. |

### Development Tools

| Tool | Purpose | Notes |
|---|---|---|
| `eslint` + `@typescript-eslint` | Linting | Vite's React-TS template ships a sane default. Don't over-configure. |
| `prettier` | Formatting | Optional but recommended for grader-facing code. Tailwind plugin (`prettier-plugin-tailwindcss`) auto-sorts class strings. |
| `@vitejs/plugin-react` | React fast-refresh | Comes with the Vite template. |
| `@tailwindcss/vite` | Tailwind v4 plugin | Replaces the old PostCSS pipeline. Add to `vite.config.ts` `plugins:`. |
| `vite-tsconfig-paths` (optional) | `@/*` import alias | Or configure aliases manually in `vite.config.ts` and `tsconfig.json` — shadcn requires `@/` to resolve. |

---

## Installation

```bash
# 1. Scaffold (shadcn CLI v4 does this for you in one shot)
npx shadcn@latest init
# Choose: Vite, TypeScript, Tailwind v4, base color = neutral or stone (matches Figma white background),
# CSS variables = yes, RSC = no, src dir = yes.

# 2. Routing, forms, validation, state, theme, search, animation
npm install react-router@^7.14 \
            react-hook-form@^7.54 @hookform/resolvers@^5.2 zod@^3.24 \
            zustand@^5.0 \
            next-themes@^0.4 \
            motion@^12 \
            fuse.js@^7.1

# 3. shadcn components you'll need (one-shot, components.json controls install path)
npx shadcn@latest add button card input label form dialog dropdown-menu \
                       avatar badge tabs sheet sonner skeleton tooltip \
                       command popover select separator switch textarea toggle

# Notes:
# - lucide-react, clsx, tailwind-merge, tw-animate-css, cmdk, sonner, react-hook-form
#   are pulled in transitively by shadcn add — DO NOT install them manually.
# - If shadcn pins react-hook-form and you also installed it above, that's fine,
#   npm will dedupe to the same major.
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|---|---|---|
| **react-router v7** | TanStack Router | TanStack is excellent (file-based, end-to-end typed routes) but the learning curve eats half a week. Stick with react-router for a 2-week timeline. |
| **react-router v7** | react-router v6 | v7 is a non-breaking upgrade from v6 if you stay in declarative mode. There's no reason to start a new project on v6 in 2026. |
| **react-router v7** | wouter / @tanstack/react-location | Wouter is tiny but lacks `useNavigate`/loader ergonomics you'll want for the compare flow. Not worth the cognitive switch. |
| **zustand** | Jotai | Jotai (atoms) shines when state is fine-grained and interconnected. This app has clear store boundaries (auth, favorites, votes, reviews) — Zustand is the obvious fit, plus `persist` middleware is built-in. Jotai needs a manual storage atom. |
| **zustand** | Redux Toolkit | Massive overkill for a localStorage app. Boilerplate eats time you don't have. |
| **zustand** | React Context only | Fine for theme/auth. But Context re-renders the world on every change — don't use it for `votes` (50 items × upvote/downvote state = re-render storm). Use Zustand for anything that updates frequently. |
| **fuse.js** | minisearch | minisearch is faster on huge corpora (10k+ docs). With ~50 tools you won't notice a difference; pick the library with 5.5M weekly downloads and clearer docs. |
| **fuse.js** | shadcn `<Command>` (cmdk) for search results page | `cmdk` is great for a **palette** (⌘K overlay), but not for a full results page with cards, filters, and pagination. Use Fuse.js for the `/search` route, optionally use cmdk for a ⌘K shortcut. |
| **motion** | react-spring | react-spring is more imperative and physics-rich; motion is more declarative and pairs better with React component lifecycles. Motion has 4× the weekly downloads. |
| **motion** | CSS transitions only | Fine for hover/focus states (use Tailwind's `transition-` utilities). But for reorderable lists (rankings) and AnimatePresence (modals/toasts already covered by sonner+shadcn), Motion is worth the ~30KB. |
| **next-themes** | Hand-rolled theme provider | Hand-rolling is ~30 lines but you'll trip on FOUC (flash of unstyled content) on first paint. next-themes solves it cleanly. |
| **zod v3** | zod v4 | See below — the v4 + `@hookform/resolvers` interop has TS overload issues as of March 2026. Not worth fighting on a 2-week project. |
| **react-hook-form** | Formik | Formik is in maintenance mode and has more re-renders. RHF + Zod is the modern standard. |
| **react-hook-form** | TanStack Form | Promising but young; less StackOverflow coverage if you hit a snag at 2am before the demo. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|---|---|---|
| **TanStack Query / SWR** | There is **no API**. All data is static seed JSON + localStorage. A query/cache layer adds complexity for zero benefit. If you ever add a backend, add it then. | Plain imports for seed data; Zustand for mutable state. |
| **Redux / Redux Toolkit** | 10× the boilerplate Zustand needs, no payoff for a localStorage app. | Zustand. |
| **react-router-dom** (the package name) | In v7 the `react-router-dom` package is deprecated — everything moved into the `react-router` package. Importing from `react-router-dom` still works as a shim but flags you as out of date. | `import { ... } from "react-router"` |
| **react-router v6** | Non-breaking upgrade to v7 exists; new projects in 2026 should start on v7. | `react-router@^7` |
| **Zod v4** | As of March 2026, `@hookform/resolvers@5.2.2`'s `zodResolver` has TypeScript overload-matching failures with Zod v4.3.x because the resolver was built against 4.0.x and the branded version mismatches. Runtime works, types break. Not what you need 3 days before a demo. | `zod@^3.24` (rock solid, fully supported by every resolver) |
| **react-hot-toast** (alongside sonner) | shadcn ships **sonner** as the official toast. Adding react-hot-toast = two toast systems mounted, conflicting z-indexes. | sonner only. |
| **`framer-motion`** (the old package name) | Renamed to `motion` in mid-2025. The `framer-motion` package still publishes but is the legacy path; new projects should install `motion`. | `motion` from `motion/react` |
| **`tailwindcss-animate`** | Deprecated by shadcn in favor of `tw-animate-css`. Tailwind v4 setups break with the old plugin. | `tw-animate-css` (shadcn installs it). |
| **Material UI / Chakra / Mantine** | The base stack is shadcn — mixing component systems doubles your bundle and clashes on theming tokens. | shadcn primitives only; build custom components on top. |
| **Yup** (for validation) | Older API, weaker TS inference than Zod. The whole RHF ecosystem has moved to Zod. | Zod v3. |
| **`react-icons`** | Multi-vendor icon aggregator; bundles every icon set's metadata. Fights with shadcn's lucide defaults. | `lucide-react` only. Add `@radix-ui/react-icons` only if a specific shadcn block requires it. |
| **`react-helmet`** | Unmaintained. For an SPA with no SSR you don't need it — set `<title>` via `document.title` in a `useEffect` if you want per-page titles. | `useEffect(() => { document.title = "..." }, [])` or `react-helmet-async` if you really want a component API. |
| **PostCSS config file** | Tailwind v4 + `@tailwindcss/vite` removes the need. Leftover `postcss.config.js` from old templates causes confusing build errors. | Delete `postcss.config.js`; configure Tailwind in `vite.config.ts`. |

---

## Stack Patterns by Variant

**If the demo runs offline (likely — graded in a classroom):**
- Don't add a service worker. Vite's `dist/` works fine via `python -m http.server` or `npx serve`. Service workers add cache-invalidation pain you don't want before a demo.

**If you want polished route transitions:**
- Wrap `<Outlet />` in `motion`'s `<AnimatePresence mode="wait">` keyed on `useLocation().pathname`. ~15 lines, big perceived-quality win for the grade.

**If localStorage gets corrupted during dev (you change a Zustand schema):**
- Bump the `version` field in the `persist` config and provide a `migrate` function — or just clear `localStorage` from devtools. Use Zod to validate the hydrated payload and discard if invalid (defensive pattern, also a talking point for the design-system-thinking part of the grade).

**If you want to avoid a flash of light theme on first load:**
- next-themes already handles this. Set `attribute="class"` and `defaultTheme="system"` on `<ThemeProvider>` and add a small inline `<script>` to `index.html` that reads the stored theme before React hydrates. shadcn's Vite docs show the exact snippet.

---

## Version Compatibility (the gotchas that will eat your week if you don't read this)

| Package A | Compatible With | Notes |
|---|---|---|
| `react@18.3.x` | `react-router@^7` | v7 explicitly supports React 18; declarative mode doesn't require React 19. ✅ |
| `react@18.3.x` | `motion@^12` | Full React 18 support. Motion v12 also supports React 19, but you're on 18. ✅ |
| `tailwindcss@^4` | `shadcn` CLI v4 (March 2026) | ✅ Default. Use `@tailwindcss/vite`, drop `postcss.config.js`, drop `tailwindcss-animate` for `tw-animate-css`. |
| `tailwindcss@^4` | `tailwindcss-animate` | ❌ Broken / deprecated path. Use `tw-animate-css`. |
| `@hookform/resolvers@^5.2` | `zod@^3.24` | ✅ Stable. The recommended pairing as of April 2026. |
| `@hookform/resolvers@^5.2` | `zod@^4.3` | ⚠️ Runtime works, but `zodResolver()` TS overload fails due to branded version mismatch (open issue #842). **Avoid.** |
| `react-router@^7` | Node `^20` | Required minimum. Vercel/Netlify default Node 20+ is fine. ✅ |
| `next-themes@^0.4` | Vite (not Next.js) | ✅ The name is misleading — it's framework-agnostic. shadcn's official Vite dark-mode guide uses it. |
| `sonner` | shadcn `<Toaster />` wrapper | ✅ Mount once at root. Don't import `Toast` from `@/components/ui/toast` — that's the deprecated path. |
| `cmdk` | shadcn `<Command>` | ✅ Auto-installed by `shadcn add command`. |

---

## Architecture Notes for the Implementer

A few stack-level decisions that will save you debugging time:

1. **Persistence layout in localStorage:** Use one Zustand store per concern, each with its own `persist` key (`ai-tools:auth`, `ai-tools:favorites`, `ai-tools:votes`, `ai-tools:reviews`, `ai-tools:submissions`). Versioning per-store means a schema change to one doesn't nuke the others.

2. **Seed data:** Keep the ~50 tools as a typed TS file (`src/data/tools.ts`), not JSON. You get IntelliSense, refactor safety, and Zod can `parse()` it at module load to catch typos. Build the Fuse index once at module load.

3. **Routing:** Use react-router v7's nested layout routes for the logged-in shell (`<AppLayout>` with sidebar + header) — children: `/`, `/categories`, `/categories/:slug`, `/tools/:slug`, etc. Auth-gating is a single `loader`-free `<RequireAuth>` wrapper that checks the Zustand auth store.

4. **Compare flow (the bug you're fixing):** The route shape is `/compare/:toolA/:toolB` so URL is the source of truth. Navigation: `navigate(\`/compare/${currentTool.slug}/${pickedTool.slug}\`)`. This is exactly what fixes the hardcoded-Claude bug from the usability test.

5. **Forms:** Use shadcn's `<Form>` + `<FormField>` components (RHF-aware wrappers) rather than wiring RHF by hand. Zod schema → `zodResolver(schema)` → `useForm({ resolver })` → done.

---

## Sources

- [React Router v7 docs — Installation](https://reactrouter.com/start/declarative/installation) — confirmed minimums (Node 20, React 18) and `react-router` package (HIGH)
- [React Router CHANGELOG](https://reactrouter.com/changelog) — confirmed 7.14.x is current April 2026 (HIGH)
- [shadcn/ui — Vite installation](https://ui.shadcn.com/docs/installation/vite) — Tailwind v4 + tw-animate-css setup (HIGH)
- [shadcn/ui — Tailwind v4 migration](https://ui.shadcn.com/docs/tailwind-v4) — confirmed v4 is default, `tailwindcss-animate` deprecated (HIGH)
- [shadcn/ui — Dark mode (Vite)](https://ui.shadcn.com/docs/dark-mode/vite) — next-themes is the recommended path even in Vite (HIGH)
- [shadcn/ui — Sonner](https://ui.shadcn.com/docs/components/radix/sonner) — confirmed sonner replaced the legacy `toast` component (HIGH)
- [shadcn/ui CLI v4 changelog (March 2026)](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — confirmed Vite scaffolding with dark mode (HIGH)
- [Motion (formerly Framer Motion)](https://motion.dev/docs/react) — confirmed package rename, `motion/react` import path, v12 current (HIGH)
- [@hookform/resolvers on npm](https://www.npmjs.com/package/@hookform/resolvers) — confirmed `^5.2.2` is current (HIGH)
- [Zod v4 release notes](https://zod.dev/v4) — confirmed v4 is stable but…
- [react-hook-form/resolvers issue #842](https://github.com/react-hook-form/resolvers/issues/842) — …has TS overload mismatch with Zod 4.3.x as of March 2026 → recommend Zod v3 (HIGH, this is a load-bearing decision)
- [Zustand persist middleware](https://github.com/pmndrs/zustand) — built-in localStorage persistence (HIGH)
- [Fuse.js docs](https://www.fusejs.io/) — confirmed v7.x current, suitable for client-side fuzzy over small datasets (HIGH)
- [lucide-react on npm](https://www.npmjs.com/package/lucide-react) — confirmed shadcn default; current major published April 2026 (HIGH)
- [State of React State Management 2026](https://www.pkgpulse.com/blog/state-of-react-state-management-2026) — Zustand remains top pick for small/medium apps with localStorage needs (MEDIUM, opinion piece, corroborates Zustand built-in persist advantage)
- [LogRocket — Best React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — Motion is the dominant pick (MEDIUM)

---
*Stack research for: AI tools discovery / compare web app, localStorage-only, 2-week UI/UX final*
*Researched: 2026-04-26*
