---
phase: 01-foundation
plan: 04
subsystem: routing-layout-theme
tags: [react-router, app-shell, next-themes, fouc, brand-tokens, oklch, url-as-source-of-truth, protected-route-stub]

requires:
  - phase: 01-foundation
    plan: 01
    provides: Vitest+jsdom test infrastructure (per-test localStorage mock)
  - phase: 01-foundation
    plan: 02
    provides: Vite+React+TS+Tailwind v4+shadcn radix-nova scaffold; lucide-react, next-themes, react-router, sonner installed
  - phase: 01-foundation
    plan: 03
    provides: subscribeToKey + storageKey helpers from src/lib/storage.ts
provides:
  - 18 v1 routes registered via createBrowserRouter under a single AppShell parent
  - AppShell layout (Header + Outlet + Footer) with proper landmark roles
  - Toaster mounted exactly once at App.tsx root (NOT in AppShell)
  - Brand color tokens — emerald primary, orange accent — defined in OKLCH for both :root and .dark
  - Inline FOUC-prevention script in index.html keyed on aitools:theme localStorage
  - ThemeProvider (next-themes) with locked storageKey "aitools:theme"
  - ThemeToggle button with multi-tab consistency via subscribeToKey
  - ProtectedRoute Phase 1 stub (always renders Outlet) — Phase 2 replaces
  - URL-as-source-of-truth structurally enforced at the placeholder layer
affects: [01-05, all-phase-2-onwards, all-phase-3-features]

tech-stack:
  added: []
  patterns:
    - "Single Toaster at App.tsx root, not in AppShell — survives nested route transitions"
    - "FOUC-prevention inline script in index.html runs before React mounts; reads aitools:theme from localStorage and applies dark class to <html>; defensively handles both raw-string and JSON-quoted next-themes shapes"
    - "next-themes uses raw key 'aitools:theme' (no scope suffix) — divergent from Phase 2 Zustand stores that use storageKey('foo') returning 'aitools:foo:global'. ThemeToggle subscribes to next-themes' literal key directly"
    - "All param-bearing pages read from URL via useParams (Tool, Compare, Compare-Picker, Category) or useSearchParams (Search) — URL-as-source-of-truth locked from day one"
    - "createMemoryRouter in tests, createBrowserRouter in production (the latter requires real document.location)"

key-files:
  created:
    - src/router.tsx
    - src/router.test.tsx
    - src/components/layout/AppShell.tsx
    - src/components/layout/AppShell.test.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/Footer.tsx
    - src/components/theme/ThemeProvider.tsx
    - src/components/theme/ThemeToggle.tsx
    - src/features/auth/components/ProtectedRoute.tsx
    - src/pages/LandingPage.tsx
    - src/pages/SignInPage.tsx
    - src/pages/SignUpPage.tsx
    - src/pages/ForgotPasswordPage.tsx
    - src/pages/OnboardingPage.tsx
    - src/pages/HomePage.tsx
    - src/pages/CategoriesPage.tsx
    - src/pages/CategoryDetailPage.tsx
    - src/pages/ToolDetailPage.tsx
    - src/pages/ToolDetailPage.test.tsx
    - src/pages/ComparePickerPage.tsx
    - src/pages/ComparePage.tsx
    - src/pages/ComparePage.test.tsx
    - src/pages/SearchPage.tsx
    - src/pages/FavoritesPage.tsx
    - src/pages/ProfilePage.tsx
    - src/pages/RankingsPage.tsx
    - src/pages/SubmitToolPage.tsx
    - src/pages/SubmitSuccessPage.tsx
    - src/pages/NotFoundPage.tsx
  modified:
    - src/index.css
    - src/App.tsx
    - index.html

key-decisions:
  - "next-themes storageKey is 'aitools:theme' (no scope suffix) — does NOT match the Phase 2 storageKey('foo') convention 'aitools:foo:global'. ThemeToggle subscribes to the literal key 'aitools:theme'. Phase 2 stores must NOT try to normalize this — next-themes is a third-party consumer with its own key shape."
  - "Toaster mounts at App.tsx root, NOT inside AppShell. AppShell can re-render on nested route transitions; Toaster must outlive every navigation so toast state isn't lost mid-flight."
  - "Inline FOUC script in index.html is the ONE place outside src/lib/storage.ts that touches localStorage directly. It runs before React mounts and cannot import ESM modules. Lint rule scans only src/ so this is structurally exempt."
  - "ProtectedRoute Phase 1 is a pass-through stub. Phase 2 will replace its body with the auth check + return-URL preservation."

patterns-established:
  - "All placeholder pages render data-testid='page-<name>' on the section root and data-testid='param-<key>' on each useParams output. Tests assert against these stable testids regardless of placeholder copy changes."
  - "Tests use createMemoryRouter; production code uses createBrowserRouter. Same route shape, different factory."
  - "Router file imports pages as default exports; layout/auth/theme components use named exports. Convention preserved across phase."

requirements-completed: ["FOUND-02", "FOUND-03", "FOUND-06", "UX-03", "UX-08"]

duration: 4 min
completed: 2026-04-27
---

# Phase 01 Plan 04: Router + AppShell + Theme Summary

**18 v1 routes registered via createBrowserRouter under a single AppShell (Header + Outlet + Footer) with a Phase 1 ProtectedRoute stub wrapping the 6 protected children, brand color tokens (emerald primary OKLCH 0.69 0.15 162, orange accent OKLCH 0.71 0.18 47) defined in src/index.css for both light and dark modes, FOUC-prevention inline script in index.html keyed on aitools:theme, next-themes ThemeProvider + ThemeToggle with cross-tab consistency via subscribeToKey, Toaster mounted exactly once at App.tsx root — and 13 new Vitest tests including the structural-fix test that renders three different /compare/a/vs/b URLs and proves each produces a different pair on screen.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-27T01:53:57Z
- **Completed:** 2026-04-27T01:57:52Z
- **Tasks:** 2
- **Files created:** 29 (router + 4 layout/theme components + 18 pages + 4 test files + 1 ProtectedRoute stub + 1 ThemeProvider + 1 ThemeToggle minus duplicates)
- **Files modified:** 3 (src/index.css, src/App.tsx, index.html)

## Accomplishments

- All 18 v1 routes registered via createBrowserRouter (`/`, `/signin`, `/signup`, `/forgot-password`, `/onboarding`, `/home`, `/categories`, `/categories/:slug`, `/tools/:slug`, `/compare/:a`, `/compare/:a/vs/:b`, `/search`, `/rankings`, `/favorites`, `/profile`, `/submit`, `/submit/success`, `*`)
- AppShell renders Header + `<Outlet />` + Footer with proper banner / main / contentinfo landmarks
- `<Toaster richColors position="top-right" visibleToasts={3} />` mounted at App.tsx root, NOT in AppShell
- Brand tokens defined in OKLCH for both `:root` and `.dark` blocks of `src/index.css`:
  - `:root` `--primary: oklch(0.69 0.15 162)` (emerald-500 #10B981)
  - `:root` `--accent: oklch(0.71 0.18 47)` (orange-500 #F97316)
  - `.dark` `--primary: oklch(0.74 0.14 162)` (slightly lighter for contrast on dark bg)
  - `.dark` `--accent: oklch(0.75 0.16 47)` (slightly lighter for contrast on dark bg)
  - Full shadcn semantic palette (background, card, popover, secondary, muted, destructive, border, input, ring, chart-{1..5}, sidebar-*) preserved from Plan 01-02 and updated to use brand-aware ring color
- FOUC-prevention inline script in `<head>` of `index.html` (runs before React mounts, applies dark class to `<html>` based on `aitools:theme` localStorage value; defensively handles raw-string and JSON-quoted shapes)
- ThemeProvider wraps next-themes with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `storageKey="aitools:theme"`, `disableTransitionOnChange`
- ThemeToggle: mounted-guarded light/dark/system cycle button with lucide-react icons; multi-tab consistency via `subscribeToKey("aitools:theme", ...)` (UX-08)
- ProtectedRoute Phase 1 stub at `src/features/auth/components/ProtectedRoute.tsx` (always renders Outlet)
- 18 placeholder pages with stable `data-testid` conventions; CategoryDetail, ToolDetail, ComparePicker, Compare read params via `useParams`; Search reads via `useSearchParams`
- 13 new tests across 4 files; the Compare structural-fix test iterates 3 different `/compare/a/vs/b` URLs and asserts each renders its own pair (claude/chatgpt, cursor/copilot, midjourney/dalle), proving the prototype's hardcoded-Claude-vs-ChatGPT bug class cannot recur
- Combined with prior plans: **58/58 tests passing**, `npm run typecheck` exits 0, `npm run build` exits 0 (1897 modules, 814ms), `npm run lint:no-direct-localstorage` exits 0
- `dist/index.html` confirmed to contain the FOUC inline script after build

## Final Route Table

| Path                     | Component             | Protected? | Reads URL params via              |
| ------------------------ | --------------------- | ---------- | --------------------------------- |
| `/`                      | LandingPage           | no         | —                                 |
| `/signin`                | SignInPage            | no         | —                                 |
| `/signup`                | SignUpPage            | no         | —                                 |
| `/forgot-password`       | ForgotPasswordPage    | no         | —                                 |
| `/categories`            | CategoriesPage        | no         | —                                 |
| `/categories/:slug`      | CategoryDetailPage    | no         | `useParams<{ slug: string }>()`   |
| `/tools/:slug`           | ToolDetailPage        | no         | `useParams<{ slug: string }>()`   |
| `/compare/:a`            | ComparePickerPage     | no         | `useParams<{ a: string }>()`      |
| `/compare/:a/vs/:b`      | ComparePage           | no         | `useParams<{ a; b: string }>()`   |
| `/search`                | SearchPage            | no         | `useSearchParams()` (`?q=`)       |
| `/rankings`              | RankingsPage          | no         | —                                 |
| `/onboarding`            | OnboardingPage        | yes (stub) | —                                 |
| `/home`                  | HomePage              | yes (stub) | —                                 |
| `/favorites`             | FavoritesPage         | yes (stub) | —                                 |
| `/profile`               | ProfilePage           | yes (stub) | —                                 |
| `/submit`                | SubmitToolPage        | yes (stub) | —                                 |
| `/submit/success`        | SubmitSuccessPage     | yes (stub) | —                                 |
| `*`                      | NotFoundPage          | no         | —                                 |

All 18 routes are nested under `<AppShell />` as the parent route element. The 6 protected children are nested under a sibling layout route whose element is `<ProtectedRoute />` (which is a pass-through Outlet in Phase 1).

## Toaster Placement Confirmation

```typescript
// src/App.tsx
export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" visibleToasts={3} />
    </ThemeProvider>
  )
}
```

`grep -E '^\s*<Toaster' src/components/layout/AppShell.tsx` returns no matches. The only mention of `Toaster` in AppShell.tsx is in a comment explaining where it lives. Verified by hand and by `acceptance_criteria` grep.

## OKLCH Brand Token Values

For Plan 04-related visual diffs and Phase 4 polish baselines:

| Token       | `:root` (light)                | `.dark` (dark)                  | sRGB equivalent      |
| ----------- | ------------------------------ | ------------------------------- | -------------------- |
| `--primary` | `oklch(0.69 0.15 162)`        | `oklch(0.74 0.14 162)`         | emerald-500 #10B981 |
| `--accent`  | `oklch(0.71 0.18 47)`         | `oklch(0.75 0.16 47)`          | orange-500 #F97316  |
| `--ring`    | `oklch(0.69 0.15 162)` (= primary) | `oklch(0.74 0.14 162)` (= primary) | matches primary     |

Lightness was lifted slightly in dark mode for both colors to maintain contrast against the dark background — consistent with shadcn's "shift palette toward foreground in dark" convention.

## FOUC Script (Final Form in `index.html`)

```html
<script>
  (function () {
    try {
      var key = "aitools:theme";
      var stored = localStorage.getItem(key);
      var theme = stored;
      // next-themes stores the raw string ("dark" | "light" | "system").
      // Defensively also handle a JSON-quoted form.
      try {
        var parsed = stored ? JSON.parse(stored) : null;
        if (typeof parsed === "string") theme = parsed;
      } catch (_) {}
      var prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark =
        theme === "dark" || ((!theme || theme === "system") && prefersDark);
      if (isDark) document.documentElement.classList.add("dark");
    } catch (_) {}
  })();
</script>
```

This block sits inside `<head>` BEFORE the `<script type="module" src="/src/main.tsx">` line. Verified to land in `dist/index.html` after `npm run build` (FOUC script must survive the build to actually prevent flash on first load — confirmed via grep).

## next-themes Key Convention vs. Phase 2 Stores

This is a divergence Phase 2 must NOT try to "normalize":

- **next-themes:** uses key `"aitools:theme"` literally (no scope suffix). The package picks its key from the `storageKey` prop and writes raw strings (`"light"`, `"dark"`, `"system"`).
- **Phase 2 Zustand stores:** will use `storageKey("favorites")`, `storageKey("upvotes")`, etc., which produce `"aitools:favorites:global"`, `"aitools:upvotes:global"`, etc. — full namespaced keys with the storage envelope `{version, data}` shape from Plan 01-03.

ThemeToggle's `useEffect` subscribes to the LITERAL key `"aitools:theme"` (not `storageKey("theme")`) precisely because next-themes doesn't follow our convention. This is documented inline in `src/components/theme/ThemeToggle.tsx`.

## Test Counts

| File                                              | describe blocks | it blocks | Status     |
| ------------------------------------------------- | --------------- | --------- | ---------- |
| `src/router.test.tsx`                             | 1               | 5         | passing    |
| `src/components/layout/AppShell.test.tsx`         | 1               | 2         | passing    |
| `src/pages/ToolDetailPage.test.tsx`               | 1               | 3         | passing    |
| `src/pages/ComparePage.test.tsx`                  | 1               | 3         | passing    |
| **Plan 01-04 total**                              | **4**           | **13**    | **13/13**  |

Full project: **58/58 tests** passing (5 from Plan 01-01 + 40 from Plan 01-03 + 13 from Plan 01-04).

## Task Commits

1. **Task 1: Wire brand tokens, FOUC script, ThemeProvider, ThemeToggle, App.tsx root** — `e996901` (feat)
2. **Task 2: Add router, AppShell, ProtectedRoute stub, 18 placeholder pages, 13 tests** — `cd11407` (feat)

_Plan metadata commit follows this summary._

## Decisions Made

- **Single Toaster at App.tsx root.** Rendering Toaster inside AppShell would cause it to be unmounted/remounted on every nested route transition (because AppShell is itself the parent route element). Mounting it as a sibling of RouterProvider keeps it alive through every navigation. RESEARCH Pattern 4.
- **ThemeToggle subscribes to raw `"aitools:theme"`, not `storageKey("theme")`.** next-themes uses the storageKey prop verbatim and does not append a scope suffix. Subscribing to `storageKey("theme")` (which yields `"aitools:theme:global"`) would never fire because next-themes never writes that key. This divergence is intentional and documented inline in ThemeToggle.tsx.
- **FOUC script defensively parses JSON-quoted shape.** While next-themes 0.4 writes raw strings, older versions and other libraries sometimes JSON.stringify the value. The script handles both shapes so a future migration or library swap doesn't break the no-flash guarantee.
- **Placeholder pages use stable `data-testid` attributes.** Tests assert on `page-<name>` and `param-<key>` testids rather than visible text. This means Phase 3 can rewrite the placeholder copy freely without breaking tests, and Phase 4 polish won't accidentally regress these structural assertions.
- **Tests use createMemoryRouter.** Production uses createBrowserRouter (which reads `document.location` and registers history listeners — overkill for unit tests). createMemoryRouter accepts the same route shape and lets tests specify `initialEntries`. Standard react-router 7 testing pattern.

## Deviations from Plan

None — plan executed exactly as written.

The plan's optional "Step 6 — build to verify no breakage yet" between Tasks 1 and 2 was skipped (the plan explicitly preferred running build only after Task 2 to avoid ceremony, since Task 1's commit refers to `@/router` which doesn't exist until Task 2). Build was run after Task 2 and exited 0 cleanly.

No auth gates encountered. No architectural decisions needed. No scope creep. File count, route count, test count, and dependency footprint match the plan's must_haves and acceptance_criteria exactly.

## Issues Encountered

None. All plan verification gates pass:

- `npm test -- --run` → 58/58 tests passing (cross-suite total)
- `npm run typecheck` → exits 0
- `npm run build` → exits 0; 1897 modules transformed in 814ms; dist/index.html contains the FOUC script
- `npm run lint:no-direct-localstorage` → exits 0 (no rogue localStorage usage outside src/lib/)
- All 18 placeholder pages exist
- AppShell.tsx contains no `<Toaster>` JSX (only a comment explaining where it lives)
- src/router.tsx contains literal `createBrowserRouter`, `/tools/:slug`, `/compare/:a/vs/:b`, `<ProtectedRoute />`
- index.html contains literal `aitools:theme`, `classList.add("dark")`, `prefers-color-scheme: dark`
- src/index.css contains `@import "tailwindcss"`, `--primary:` in `:root`, `.dark {` block, `--accent:`

## User Setup Required

None — all infrastructure is local. Note for manual smoke testing:
- Run `npm run dev`, visit http://localhost:5173, navigate to `/tools/chatgpt`, `/compare/claude/vs/chatgpt`, `/some-bogus-path` — each should render its placeholder.
- Click the theme toggle in the header, refresh — no flash should be visible (FOUC script applies dark class before React mounts).
- Open `/` in two tabs, toggle theme in one — the other should update within ~1 second (UX-08 multi-tab consistency).

## Next Phase Readiness

- **Ready for Plan 01-05 (seed data + brand logos).** Plan 05 should:
  - Author `src/data/tools.ts` with ~50 tools across 10 categories.
  - Import `__validateSlugsUnique` and `__validateLogosPresent` from `@/data/_validate` and call BOTH at module load (top-level, not inside a function) so they fire during `npm run dev` AND `npm run build`.
  - Author `src/data/categories.ts` with the 10 CategorySlug values matching `src/types/index.ts`.
  - Source real brand SVGs into `src/assets/tool-logos/<slug>.svg` per CONTEXT.md (no fallback marks; user explicitly required real logos).
  - Plan 05 does NOT touch the router, AppShell, or theme — those are now stable.
  - The placeholder pages render as soon as their route matches; once `tools.ts` exists with seed data, the smoke test "visit `/tools/chatgpt` and see the chatgpt slug" will keep working unchanged (Plan 06 in Phase 2 onward will swap the placeholder for a real Tool Detail UI that does a tools-array lookup by slug).

- **Ready for Phase 2 (Auth + Persistence Stores).** Phase 2 inherits:
  - A fully wired router with all 18 routes — Phase 2 only needs to replace ProtectedRoute's body with a real auth check.
  - A theme system that already persists, prevents FOUC, and propagates across tabs — Phase 2 doesn't touch theming.
  - A Toaster at App.tsx root, ready to receive `toast.*` calls from anywhere in the tree.
  - Phase 2 stores should use `storageKey("foo")` from `@/lib/storage` for their persisted keys; theme is the ONE exception (next-themes writes its raw key).

## Self-Check: PASSED

- File `src/router.tsx` exists: FOUND
- File `src/router.test.tsx` exists: FOUND
- File `src/components/layout/AppShell.tsx` exists: FOUND
- File `src/components/layout/AppShell.test.tsx` exists: FOUND
- File `src/components/layout/Header.tsx` exists: FOUND
- File `src/components/layout/Footer.tsx` exists: FOUND
- File `src/components/theme/ThemeProvider.tsx` exists: FOUND
- File `src/components/theme/ThemeToggle.tsx` exists: FOUND
- File `src/features/auth/components/ProtectedRoute.tsx` exists: FOUND
- 18 page files exist under `src/pages/`: FOUND (counted via `ls src/pages/*.tsx | grep -v test | wc -l` = 18)
- File `src/pages/ToolDetailPage.test.tsx` exists: FOUND
- File `src/pages/ComparePage.test.tsx` exists: FOUND
- File `src/index.css` modified with brand tokens: FOUND
- File `src/App.tsx` modified to wire ThemeProvider + RouterProvider + Toaster: FOUND
- File `index.html` modified with FOUC script: FOUND
- Commit `e996901` (Task 1): FOUND in git log
- Commit `cd11407` (Task 2): FOUND in git log
- `npm test -- --run` → 58/58 passing: PASS
- `npm run typecheck` exits 0: PASS
- `npm run build` exits 0; dist/index.html contains FOUC script: PASS
- `npm run lint:no-direct-localstorage` exits 0: PASS
- AppShell.tsx contains no `<Toaster` JSX (only in a comment): PASS

---
*Phase: 01-foundation*
*Completed: 2026-04-27*
