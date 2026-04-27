# Architecture Research

**Domain:** Frontend SPA — AI tools directory (Vite + React 18 + TS + Tailwind + shadcn/ui, localStorage-only persistence)
**Researched:** 2026-04-26
**Confidence:** HIGH (stack is well-established; patterns verified against current shadcn/ui, Zustand, and React Router docs)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Routing Layer (React Router v6)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Public      │  │  Auth        │  │  App         │  │  Util    │  │
│  │  /, /demo    │  │  /signin     │  │  /home       │  │  *       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  │
│         │                 │                 │                │        │
├─────────┴─────────────────┴─────────────────┴────────────────┴────────┤
│                         Page Layer (src/pages)                       │
│   Landing · SignIn · Onboarding · Home · Categories · ToolDetail     │
│   Compare · Search · Favorites · Profile · Submit · Rankings         │
├──────────────────────────────────────────────────────────────────────┤
│              Feature Layer (src/features/<domain>)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  auth    │  │ tools    │  │ compare  │  │ reviews  │  │ submit  │ │
│  │ (forms,  │  │ (cards,  │  │ (picker, │  │ (modal,  │  │ (form,  │ │
│  │  hooks)  │  │  filters)│  │  diff)   │  │  list)   │  │ queue)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
├───────┴─────────────┴─────────────┴─────────────┴─────────────┴──────┤
│                     Shared UI Layer (src/components)                 │
│       shadcn/ui primitives · Layout (Header, Footer) · Toaster       │
├──────────────────────────────────────────────────────────────────────┤
│                  State Layer (Zustand stores w/ persist)             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ authStore   │  │ favorites   │  │ upvoteStore │  │ reviewStore │  │
│  │ (session)   │  │ Store       │  │             │  │             │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │ submission  │  │ compareStore│  │ themeStore  │                   │
│  │ Store       │  │ (transient) │  │ (next-themes)│                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
├──────────────────────────────────────────────────────────────────────┤
│                       Data Layer (src/data)                          │
│   tools.ts (~50 entries) · categories.ts (~10) · seedReviews.ts      │
│   Static TS modules — imported directly, no fetch                    │
├──────────────────────────────────────────────────────────────────────┤
│                    Persistence Layer (localStorage)                  │
│   Namespaced keys: aitools:<domain>:<userId|global>                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Pages** | Route-level composition; read params, compose features | One file per route in `src/pages/` |
| **Features** | Domain logic (auth, tools, compare, reviews, submit) | Co-located components + hooks + types |
| **Stores** | App state + localStorage hydration | Zustand stores with `persist` middleware |
| **Data modules** | Seed tools/categories as typed TS exports | Static `.ts` arrays imported at build |
| **UI primitives** | Buttons, dialogs, inputs, toasts | shadcn/ui components in `src/components/ui` |
| **Layout** | Header (search, theme toggle, auth nav), Footer, page shell | Wrapper components rendered via `<Outlet />` |
| **Router** | URL → page; protected route guards | React Router v6 `createBrowserRouter` |
| **ThemeProvider** | Light/dark class on `<html>` + system preference | `next-themes` (works in plain Vite, not Next-only) |

## Recommended Project Structure

```
src/
├── main.tsx                    # ReactDOM.createRoot, mounts <App />
├── App.tsx                     # ThemeProvider + RouterProvider + Toaster
├── router.tsx                  # createBrowserRouter, route tree, ProtectedRoute
│
├── pages/                      # One file per route — pure composition, no logic
│   ├── LandingPage.tsx         # /
│   ├── SignInPage.tsx          # /signin
│   ├── SignUpPage.tsx          # /signup
│   ├── ForgotPasswordPage.tsx  # /forgot-password
│   ├── OnboardingPage.tsx      # /onboarding (step 1: interests, step 2: tools)
│   ├── HomePage.tsx            # /home (logged-in)
│   ├── CategoriesPage.tsx      # /categories
│   ├── CategoryDetailPage.tsx  # /categories/:slug
│   ├── ToolDetailPage.tsx      # /tools/:slug  ← fixes "everything is Claude" bug
│   ├── ComparePage.tsx         # /compare/:a/vs/:b  ← fixes hardcoded compare bug
│   ├── ComparePickerPage.tsx   # /compare/:a (pick second tool)
│   ├── SearchPage.tsx          # /search?q=...
│   ├── FavoritesPage.tsx       # /favorites (protected)
│   ├── ProfilePage.tsx         # /profile (protected)
│   ├── RankingsPage.tsx        # /rankings
│   ├── SubmitToolPage.tsx      # /submit (protected)
│   ├── SubmitSuccessPage.tsx   # /submit/success
│   └── NotFoundPage.tsx        # *
│
├── features/                   # Domain-grouped logic — the heart of the app
│   ├── auth/
│   │   ├── components/
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── store.ts            # authStore (Zustand + persist)
│   │   └── types.ts            # User, Session, Credentials
│   │
│   ├── tools/
│   │   ├── components/
│   │   │   ├── ToolCard.tsx
│   │   │   ├── ToolGrid.tsx
│   │   │   ├── ToolDetailHero.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   └── FavoriteButton.tsx
│   │   ├── hooks/
│   │   │   ├── useTool.ts      # by slug
│   │   │   ├── useTools.ts     # filtered list
│   │   │   └── useFavorites.ts
│   │   ├── store.ts            # favoritesStore
│   │   └── types.ts            # Tool, Category
│   │
│   ├── compare/
│   │   ├── components/
│   │   │   ├── CompareTable.tsx
│   │   │   ├── ToolPicker.tsx
│   │   │   └── CompareEmptyState.tsx
│   │   ├── hooks/
│   │   │   └── useCompare.ts
│   │   └── store.ts            # compareStore (in-memory, not persisted)
│   │
│   ├── reviews/
│   │   ├── components/
│   │   │   ├── ReviewModal.tsx
│   │   │   ├── ReviewList.tsx
│   │   │   └── StarRating.tsx
│   │   ├── hooks/
│   │   │   └── useReviews.ts
│   │   ├── store.ts            # reviewStore
│   │   └── types.ts
│   │
│   ├── rankings/
│   │   ├── components/
│   │   │   ├── RankingsList.tsx
│   │   │   └── UpvoteButton.tsx
│   │   ├── hooks/
│   │   │   └── useUpvotes.ts
│   │   └── store.ts            # upvoteStore
│   │
│   ├── search/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   └── hooks/
│   │       └── useSearch.ts    # client-side filter over tools[]
│   │
│   ├── submit/
│   │   ├── components/
│   │   │   ├── SubmitToolForm.tsx
│   │   │   └── PendingQueue.tsx
│   │   ├── store.ts            # submissionStore
│   │   └── types.ts            # Submission
│   │
│   └── onboarding/
│       ├── components/
│       │   ├── InterestsStep.tsx
│       │   └── ToolsStep.tsx
│       └── hooks/
│           └── useOnboarding.ts
│
├── components/                 # Cross-cutting shared UI (not feature-specific)
│   ├── ui/                     # shadcn/ui primitives (button, dialog, toast, …)
│   ├── layout/
│   │   ├── AppShell.tsx        # Header + <Outlet /> + Footer
│   │   ├── Header.tsx          # logo, search, theme toggle, auth nav
│   │   └── Footer.tsx
│   ├── theme/
│   │   ├── ThemeProvider.tsx   # next-themes wrapper
│   │   └── ThemeToggle.tsx
│   └── feedback/
│       ├── Toaster.tsx         # mounted once in <App />
│       └── EmptyState.tsx
│
├── data/                       # Static seed data — single source of truth
│   ├── tools.ts                # export const TOOLS: Tool[] = [...]
│   ├── categories.ts           # export const CATEGORIES: Category[] = [...]
│   ├── seedReviews.ts          # demo reviews so review page isn't empty
│   └── slugs.ts                # helper: slug → tool, tool → slug
│
├── lib/                        # Pure utility modules — no React
│   ├── storage.ts              # safeJSON parse, namespaced key helpers
│   ├── slug.ts                 # slugify, parseSlug
│   ├── cn.ts                   # clsx + tailwind-merge
│   ├── id.ts                   # crypto.randomUUID wrapper
│   └── format.ts               # date, number formatters
│
├── stores/                     # (Optional) cross-feature stores live here
│   └── (most stores live in features/<x>/store.ts)
│
├── types/                      # Shared types not owned by a feature
│   └── index.ts
│
├── styles/
│   └── globals.css             # Tailwind directives + CSS variables
│
└── assets/                     # Logos, icons, illustrations
```

### Structure Rationale

- **`pages/` is composition only** — every file is "import features, render layout." This keeps routing concerns separate from domain logic and makes the route map trivially scannable.
- **`features/<domain>/` co-locates components + hooks + store + types** — favorites code lives next to favorites UI. When a feature is deleted, one folder goes away.
- **`data/` is its own top-level folder, not `lib/data/`** — emphasizes that it's the seed corpus, not utility code. Single import path: `import { TOOLS } from '@/data/tools'`.
- **`components/` is for cross-cutting UI only** — Header is here (used everywhere) but ToolCard is in `features/tools` (domain-specific). Avoids a 200-file `components/` graveyard.
- **`lib/` is pure functions, no React** — easy to test, no hidden hook dependencies.
- **`stores/` exists but is mostly empty** — most stores belong inside their feature folder. The directory exists for the rare cross-feature store (none expected here).

## Route Map

| Path | Component | Protected? | Notes |
|------|-----------|-----------|-------|
| `/` | `LandingPage` | No | Hero, value pillars, demo CTA |
| `/signin` | `SignInPage` | No | Redirects to `/home` if already signed in |
| `/signup` | `SignUpPage` | No | After submit → `/onboarding` |
| `/forgot-password` | `ForgotPasswordPage` | No | Mock flow |
| `/onboarding` | `OnboardingPage` | Yes | Two-step; redirects to `/home` when done |
| `/home` | `HomePage` | Yes | Personalized recs + category shortcuts |
| `/categories` | `CategoriesPage` | No | Index of ~10 categories |
| `/categories/:slug` | `CategoryDetailPage` | No | Tools in that category |
| `/tools/:slug` | `ToolDetailPage` | No | **Each tool routes uniquely (fixes "everything is Claude")** |
| `/compare/:a` | `ComparePickerPage` | No | Pick second tool |
| `/compare/:a/vs/:b` | `ComparePage` | No | **Side-by-side (fixes hardcoded Claude-vs-ChatGPT)** |
| `/search` | `SearchPage` | No | `?q=` query param, empty state |
| `/favorites` | `FavoritesPage` | Yes | Saved tools per user |
| `/profile` | `ProfilePage` | Yes | User info |
| `/rankings` | `RankingsPage` | No | Upvote/downvote leaderboard |
| `/submit` | `SubmitToolPage` | Yes | Form |
| `/submit/success` | `SubmitSuccessPage` | Yes | Confirmation |
| `*` | `NotFoundPage` | No | 404 |

**Router file (`src/router.tsx`) sketch:**

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
// ...page imports

export const router = createBrowserRouter([
  {
    element: <AppShell />,           // Header + <Outlet /> + Footer + Toaster
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/categories/:slug', element: <CategoryDetailPage /> },
      { path: '/tools/:slug', element: <ToolDetailPage /> },
      { path: '/compare/:a', element: <ComparePickerPage /> },
      { path: '/compare/:a/vs/:b', element: <ComparePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/rankings', element: <RankingsPage /> },
      {
        element: <ProtectedRoute />,  // wraps an <Outlet />, redirects to /signin
        children: [
          { path: '/onboarding', element: <OnboardingPage /> },
          { path: '/home', element: <HomePage /> },
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/submit', element: <SubmitToolPage /> },
          { path: '/submit/success', element: <SubmitSuccessPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

## TypeScript Data Model

```typescript
// src/features/tools/types.ts
export type CategorySlug =
  | 'writing' | 'coding' | 'research' | 'image' | 'audio'
  | 'productivity' | 'video' | 'data' | 'design' | 'chat';

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;        // lucide-react icon name
  color: string;       // tailwind class for accent
  toolCount?: number;  // computed at runtime, optional in seed
}

export interface Tool {
  slug: string;             // URL-safe id, primary key — "claude", "chatgpt", "midjourney"
  name: string;
  tagline: string;          // one-line pitch
  description: string;      // longer paragraph for detail page
  category: CategorySlug;
  subcategories?: string[]; // optional cross-category tags
  url: string;              // external website
  logo: string;             // /assets/logos/<slug>.svg
  pricing: 'free' | 'freemium' | 'paid' | 'subscription';
  pricingDetails?: string;
  pros: string[];
  cons: string[];
  bestFor: string[];        // ["Long-form writing", "Code review"]
  features: string[];       // bullet list for detail page
  rating: number;           // 0–5, static seed
  reviewCount: number;      // static seed; live count merges with reviewStore
  upvotes: number;          // static seed; live merges with upvoteStore
  trending?: boolean;
  createdAt: string;        // ISO date
}
```

```typescript
// src/features/auth/types.ts
export interface User {
  id: string;               // uuid
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  passwordHash: string;     // mock — base64(email + password). NOT secure, demo only.
  interests: CategorySlug[];     // from onboarding step 1
  selectedTools: string[];       // tool slugs from onboarding step 2
  createdAt: string;
}

export interface Session {
  userId: string;
  token: string;            // mock random string
  issuedAt: string;
  expiresAt: string;        // 7 days
}
```

```typescript
// src/features/reviews/types.ts
export interface Review {
  id: string;               // uuid
  toolSlug: string;
  userId: string;
  username: string;         // denormalized so deleting user doesn't break display
  rating: number;           // 1–5
  title: string;
  body: string;
  createdAt: string;
}
```

```typescript
// src/features/rankings/types.ts
export type Vote = 1 | -1;
export interface UpvoteRecord {
  toolSlug: string;
  userId: string;
  vote: Vote;               // 1 = upvote, -1 = downvote
  votedAt: string;
}
```

```typescript
// src/features/submit/types.ts
export interface Submission {
  id: string;
  submitterId: string;
  name: string;
  url: string;
  category: CategorySlug;
  description: string;
  status: 'pending' | 'approved' | 'rejected';  // always 'pending' in this build
  submittedAt: string;
}
```

```typescript
// src/features/compare/types.ts
export interface ComparePair {
  a: string;                // tool slug
  b: string;
  // Stored only in URL + transient store; never persisted to localStorage
}
```

## State Management & localStorage Strategy

**Decision: Zustand with the `persist` middleware.** Verified against current Zustand docs ([persist middleware](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)).

**Why Zustand over alternatives:**
- React Context + custom `useLocalStorage` hook → re-renders the whole tree on every change, becomes painful at 6+ stores.
- Jotai `atomWithStorage` → great primitive, but Zustand's slice-per-domain pattern matches our feature folders cleanly.
- Redux Toolkit → ceremony overkill for an app with no async/server state.
- Zustand persists with one line, supports `partialize` to avoid leaking transient state, and works flawlessly in plain Vite (no SSR hydration headaches).

**One store per persistence boundary:**

| Store | Persisted? | localStorage key | Notes |
|-------|-----------|------------------|-------|
| `authStore` | Yes | `aitools:auth:session` | Current session + user record |
| `usersStore` | Yes | `aitools:auth:users` | Registry of all signed-up users (mock DB) |
| `favoritesStore` | Yes | `aitools:favorites:<userId>` | Per-user favorite slugs |
| `reviewStore` | Yes | `aitools:reviews:global` | All reviews across users (single shared list) |
| `upvoteStore` | Yes | `aitools:upvotes:<userId>` | Per-user vote records |
| `submissionStore` | Yes | `aitools:submissions:global` | Pending queue (visible to submitter) |
| `compareStore` | **No** | — | Source of truth is URL `/compare/:a/vs/:b`; store caches picker state only |
| `themeStore` | Yes | `aitools:theme` | Managed by `next-themes` (its own key) |

**Key naming convention:** `aitools:<domain>:<scope>` where scope is `global` or a `userId`. Single namespace prefix `aitools:` so we can wipe everything in one shot during dev. Per-user keys mean signing out of one mock account and into another doesn't leak data.

**Storage helper (`src/lib/storage.ts`):**

```typescript
const NAMESPACE = 'aitools';

export const storageKey = (domain: string, scope: string = 'global') =>
  `${NAMESPACE}:${domain}:${scope}`;

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed', e);  // QuotaExceeded on very full browsers
  }
}

export function clearNamespace(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${NAMESPACE}:`))
    .forEach((k) => localStorage.removeItem(k));
}
```

**Example store (`src/features/tools/store.ts`):**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];                       // tool slugs
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (slug) =>
        set((s) => ({
          favorites: s.favorites.includes(slug)
            ? s.favorites.filter((x) => x !== slug)
            : [...s.favorites, slug],
        })),
      isFavorite: (slug) => get().favorites.includes(slug),
      clear: () => set({ favorites: [] }),
    }),
    {
      name: 'aitools:favorites:current',     // user-scoped key set dynamically (see below)
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Per-user persistence trick:** Because Zustand's `persist` `name` is set at store-creation time, we cannot easily key on `userId`. Two clean options:

1. **Recommended:** Single global `favoritesStore` keyed by `{ [userId]: string[] }` — simpler, one store, one key. Selectors filter by current user.
2. Re-create the store on login via a factory (more code, easier wipe on logout).

Pick option 1. On logout we simply switch the active selector; on account deletion we delete the user's slot.

## Mock Auth Strategy

**Two stores collaborate:**

- `usersStore` → registry of every signed-up user (the mock "database"). Persisted to `aitools:auth:users`.
- `authStore` → who's currently signed in. Persisted to `aitools:auth:session`.

**Sign-up flow:**
1. Form submits → `usersStore.register({ email, username, password })` creates a `User` with a `passwordHash` (base64 of `email:password` — explicitly NOT real security, this is a UI demo).
2. `authStore.login(user.id)` writes a `Session` with `expiresAt = now + 7d`.
3. Redirect to `/onboarding`.

**Sign-in flow:**
1. `usersStore.findByEmail(email)` → verify hash → if ok, `authStore.login(user.id)`.
2. Redirect to `/home`.

**Sign-out flow:**
1. `authStore.logout()` clears the session key.
2. `usersStore` is untouched (so the user can sign back in).
3. Redirect to `/`.

**Protected route component:**

```typescript
// src/features/auth/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { session, currentUser } = useAuth();
  const location = useLocation();

  if (!session || !currentUser || isExpired(session)) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
```

**Edge case: localStorage cleared mid-session.** The auth store's `onRehydrateStorage` callback runs on every page load. If `session` exists but `usersStore` no longer contains a matching user (because the user wiped storage), we treat it as logged out:

```typescript
// In authStore
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'aitools:auth:session',
    onRehydrateStorage: () => (state) => {
      if (!state?.session) return;
      const user = useUsersStore.getState().findById(state.session.userId);
      if (!user || isExpired(state.session)) {
        state.session = null;
      }
    },
  }
);
```

`ProtectedRoute` does the same check on render, so a user mid-navigation when storage is cleared is bounced to `/signin` rather than crashing the app trying to render a `null` user. **Always guard `currentUser` reads** — never assume non-null inside protected pages.

**Edge case: storage events from other tabs.** Optionally listen to `window.addEventListener('storage', ...)` to react to sign-out in another tab. Nice-to-have, not required for v1.

## Theming Strategy

**Decision: `next-themes` (works with plain Vite — the package is misnamed).** Verified against [shadcn/ui Vite dark mode docs](https://ui.shadcn.com/docs/dark-mode/vite) — they recommend their own custom `ThemeProvider`, but `next-themes` is widely used in Vite shadcn projects and gives us system-preference detection for free.

**Setup:**

1. `tailwind.config.ts` → `darkMode: 'class'`
2. `globals.css` → CSS variables for both `:root` and `.dark` (shadcn's standard token setup).
3. Wrap `<App />`:

```typescript
<ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="aitools:theme">
  <RouterProvider router={router} />
  <Toaster />
</ThemeProvider>
```

4. `ThemeToggle` lives in the Header, uses `useTheme()` from `next-themes`.

**Toasts:** Use shadcn/ui's `Toaster` (sonner-based). Mounted **once** at the root (inside `ThemeProvider`, alongside `RouterProvider`) — never inside a page. Trigger from anywhere via `import { toast } from 'sonner'`.

## Architectural Patterns

### Pattern 1: URL as Source of Truth for Compare

**What:** The `/compare/:a/vs/:b` route encodes both selected tools in the URL. The `compareStore` exists only as a transient cache for the picker UI.

**When to use:** Whenever state must be shareable, bookmarkable, or survive refresh.

**Trade-offs:** Slightly more `useParams` plumbing, but completely eliminates the prototype's "hardcoded Claude vs ChatGPT" bug because the rendered comparison literally cannot diverge from the URL.

```typescript
// src/pages/ComparePage.tsx
const { a, b } = useParams<{ a: string; b: string }>();
const toolA = useTool(a!);
const toolB = useTool(b!);
if (!toolA || !toolB) return <NotFoundPage />;
return <CompareTable a={toolA} b={toolB} />;
```

### Pattern 2: Slug as Primary Key

**What:** Every tool is identified by a URL-safe slug (`"claude"`, `"chatgpt"`), not a numeric id. Routes, store keys, and seed data all use the slug.

**When to use:** Static catalog where the human-readable id is stable.

**Trade-offs:** Renames are costly, but a fixed seed corpus makes that a non-issue. Eliminates a class of "wrong tool detail page" bugs because `/tools/claude` literally renders `TOOLS.find(t => t.slug === 'claude')`.

### Pattern 3: Feature-Scoped Stores

**What:** Each domain (auth, favorites, reviews, upvotes, submissions) owns its own Zustand store, co-located with its components and hooks.

**When to use:** When stores have orthogonal lifecycles and persistence keys.

**Trade-offs:** A few cross-store reads (e.g., `reviewStore` denormalizes `username` from `authStore`); we accept this to avoid coupling stores at write time.

### Pattern 4: Static Data Modules, Not Fetch

**What:** `data/tools.ts` exports a typed array. Pages `import` it directly. No `fetch`, no JSON files, no async loaders.

**When to use:** Build-time-known catalogs under ~1k entries.

**Trade-offs:** All data ships in the JS bundle (~50 tools × small object ≈ trivial). If catalog grew past 500 entries, switch to a JSON file + dynamic `import()`.

### Pattern 5: Layout via Outlet, Not Prop Drilling

**What:** A single `<AppShell>` component renders Header + Footer + `<Toaster>` + `<Outlet />`. Every route renders inside it.

**When to use:** When 90%+ of routes share the same chrome.

**Trade-offs:** Routes that need a different layout (e.g., a marketing landing without the app header) wrap themselves or skip the shell. Cleaner than passing `showHeader` props everywhere.

## Data Flow

### Read flow (e.g., Tool Detail Page)

```
User navigates to /tools/claude
        ↓
React Router matches → ToolDetailPage
        ↓
useParams() → { slug: 'claude' }
        ↓
useTool('claude') → TOOLS.find(...) from data/tools.ts
        ↓                      ↓
   merge with        merge with reviewStore.byTool('claude')
   upvoteStore       and favoritesStore.isFavorite('claude')
        ↓
ToolDetailHero, Pros/Cons, ReviewList, FavoriteButton render
```

### Write flow (e.g., Favoriting a Tool)

```
User clicks <FavoriteButton slug="claude" />
        ↓
favoritesStore.toggle('claude')      // mutates state
        ↓
Zustand persist middleware           // serializes to localStorage
        ↓
toast('Added to favorites')          // sonner via shadcn/ui Toaster
        ↓
Subscribed components re-render with new isFavorite=true
```

### Auth flow

```
SignInForm submit
    ↓
useUsersStore.findByEmail(email).verify(password)
    ↓ (success)
useAuthStore.login(userId)           // writes session
    ↓
useNavigate('/home', { replace: true })
    ↓
ProtectedRoute checks session → renders <Outlet />
```

## Build Order Implications

**Foundation phase (must exist before any feature work):**

1. **Vite + TS + Tailwind + shadcn/ui scaffolding** — `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, path alias `@/` → `src/`.
2. **`src/lib/storage.ts`** — namespaced key helpers, safe JSON wrappers.
3. **`src/data/tools.ts` + `src/data/categories.ts`** — even with placeholder content; types must exist.
4. **TypeScript interfaces** — `Tool`, `Category`, `User`, `Session`, `Review`, `UpvoteRecord`, `Submission`. Every feature depends on these.
5. **Router skeleton** — all routes registered, even if pages render `<h1>TODO</h1>`. Lets the team work in parallel.
6. **`AppShell` + `Header` + `Footer` + `<Toaster>`** — the chrome that wraps everything.
7. **`ThemeProvider`** — set up early so we never refactor a "themeless" component later.
8. **`authStore` + `usersStore` + `ProtectedRoute`** — needed before any protected page (Home, Favorites, Profile, Submit) is real.

**Feature phases (any order, parallelizable):**

- Tools browsing (categories, tool detail) — depends on foundation only.
- Favorites — depends on auth + tools.
- Search — depends on tools data.
- Compare — depends on tools data and routing (URL-as-source-of-truth pattern).
- Rankings + upvotes — depends on auth + tools.
- Reviews — depends on auth + tools.
- Submit — depends on auth.
- Onboarding — depends on auth.

**Polish phase (last):**

- Dark mode visual pass (every component needs `dark:` review).
- Empty states everywhere.
- Toast wiring on every persisting action.
- Keyboard nav + visible focus rings.
- Responsive tablet pass.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k tools, ~50 users (this project) | Current architecture is appropriate. Static seed array + Zustand + localStorage. |
| 1k–10k tools | Move `tools.ts` → `tools.json` and dynamic `import()`. Add a search index (e.g., Fuse.js). Still no backend needed. |
| 10k+ tools / multi-user | Adopt a real backend (Supabase, PlanetScale). `useTool` becomes a query (TanStack Query). localStorage stores become server mirrors. |

### Scaling Priorities

1. **First bottleneck:** Bundle size from `tools.ts`. At ~50 entries it's ~10KB; at 5k it's 1MB. Switch to JSON + lazy load when noticeable.
2. **Second bottleneck:** localStorage quota (~5MB per origin). Reviews are the largest growth surface. If reviews per tool grow large, paginate in store and only persist a recency window.

## Anti-Patterns

### Anti-Pattern 1: One God Store

**What people do:** A single Zustand store holding auth, favorites, reviews, upvotes, theme, compare — everything.

**Why it's wrong:** Every change re-runs every selector. Persistence becomes all-or-nothing (you can't wipe favorites without wiping auth). Code review diffs touch every feature.

**Do this instead:** Feature-scoped stores in `features/<domain>/store.ts`. Cross-store reads via direct `useOtherStore.getState()` calls when truly needed.

### Anti-Pattern 2: Storing Compare State in localStorage

**What people do:** Persist the currently-being-compared pair so refreshing `/compare` brings it back.

**Why it's wrong:** Reintroduces the exact "hardcoded Claude vs ChatGPT" bug from the usability test — refreshing on someone else's compare URL would show *your* persisted pair, not the URL's pair. URL is the source of truth.

**Do this instead:** Read the pair from `useParams`. The `compareStore` is in-memory only and only caches the picker step.

### Anti-Pattern 3: Reading Tools via Fetch (Faking a Backend)

**What people do:** Wrap `import { TOOLS } from '@/data/tools'` in a fake `await fetch()` to "simulate" a real API.

**Why it's wrong:** Adds loading states, error states, and race conditions to a problem that doesn't have them. Slows perceived performance for no benefit.

**Do this instead:** Import directly. If you later add a backend, refactor `useTool` once and every consumer keeps working.

### Anti-Pattern 4: Putting User Data in `usersStore` AND `authStore`

**What people do:** Duplicate the User object in both stores so the active user is "fast" to read.

**Why it's wrong:** Now updating `displayName` requires writing to two places. Stale-data bugs guaranteed.

**Do this instead:** `authStore.session.userId` is the only pointer. The user record always comes from `usersStore.findById(session.userId)`. Selector hook `useCurrentUser()` does the join.

### Anti-Pattern 5: Toaster Inside Pages

**What people do:** Render `<Toaster />` inside the page that triggers the toast.

**Why it's wrong:** Unmounts when the user navigates away mid-toast. Toasts get clipped or cause double-mounts when two pages render briefly during a transition.

**Do this instead:** Mount `<Toaster />` exactly once in `App.tsx` (or `AppShell`). Trigger via the imperative `toast()` API from anywhere.

### Anti-Pattern 6: Forgetting Slug Uniqueness

**What people do:** Two tools end up with `slug: 'gpt'` and `slug: 'gpt-4'` is missed in seed data.

**Why it's wrong:** Reintroduces the "everything is Claude" bug. `/tools/gpt` matches the wrong record.

**Do this instead:** Add a build-time check: `data/tools.ts` exports a `__validateSlugsUnique()` that runs at module load and throws if duplicates exist.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| External tool websites | `<a href={tool.url} target="_blank" rel="noopener">` | No iframe, no API. |
| (No analytics, no auth providers, no DB) | — | localStorage-only by design. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pages ↔ Features | Direct component import + hooks | Pages don't reach into feature internals beyond the public hook/component. |
| Features ↔ Stores | Hook (e.g., `useFavorites`) wraps `useFavoritesStore` | Components never import stores directly — always go through the feature hook. |
| Stores ↔ localStorage | Zustand `persist` middleware | Never call `localStorage.setItem` directly outside of `lib/storage.ts`. |
| Router ↔ Auth | `<ProtectedRoute>` reads `authStore` | One central place for auth gating. |
| Compare ↔ URL | `useParams` reads `:a` and `:b` | URL is source of truth, store is cache only. |

## Sources

- [Zustand: Persisting store data (official docs)](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data) — verified persist + createJSONStorage API
- [Zustand GitHub repo](https://github.com/pmndrs/zustand) — current TS patterns
- [shadcn/ui Vite dark mode guide](https://ui.shadcn.com/docs/dark-mode/vite) — official Vite-specific theming setup
- [shadcn/ui dark mode (general)](https://ui.shadcn.com/docs/dark-mode) — Tailwind `darkMode: 'class'` config
- [React Router v7 vs v6 comparison (Medium)](https://medium.com/@ignatovich.dm/react-router-7-vs-6-whats-new-and-should-you-upgrade-93bba58576a8) — non-breaking upgrade path
- [React Router v7 guide (LogRocket)](https://blog.logrocket.com/react-router-v7-guide/) — current routing patterns
- [useParams API reference (React Router v7)](https://api.reactrouter.com/v7/functions/react_router.useParams.html) — typed param hook
- [Zustand TS persist discussion (#2027)](https://github.com/pmndrs/zustand/discussions/2027) — slicing + persist TS patterns
- [Implementing Light/Dark Mode in Vite shadcn (DEV)](https://dev.to/ashsajal/implementing-lightdark-mode-in-your-vite-app-with-shadcnui-1ae4) — confirmed Vite-compatible theme provider patterns

---
*Architecture research for: Vite + React + TS + Tailwind + shadcn/ui SPA with localStorage persistence*
*Researched: 2026-04-26*
