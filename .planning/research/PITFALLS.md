# Pitfalls Research

**Domain:** Vite + React + TS + Tailwind + shadcn/ui app with localStorage persistence (no backend); UI/UX final project rebuild of a Figma prototype, 2-week deadline
**Researched:** 2026-04-26
**Confidence:** HIGH (all pitfalls below trace to verified sources or directly to the documented usability findings, the no-backend constraint, the 2-week timeline, or shadcn-specific behavior)

---

## Critical Pitfalls

### Pitfall 1: Hardcoded Compare — The Same Bug, Re-Implemented in React

**What goes wrong:**
The Figma prototype shipped a Compare flow that always showed Claude vs ChatGPT regardless of which tool the user clicked. All three usability-test participants failed Task 2 because of it. The React rebuild is highly likely to recreate this bug in a subtler form: a `CompareView` component that imports two specific tools, a route like `/compare` with no params, or a "Compare" button on tool cards that calls `navigate('/compare')` without passing the origin tool. A UI that *looks* dynamic (the picker renders, the layout looks right) can still resolve to the same two tools because the comparison data is sourced from a constant, not from the URL or store.

**Why it happens:**
- Compare is the most visually expensive screen, so devs build it first against fixed data ("I'll wire it up later")
- "Later" never comes — the screen looks done in the demo
- Comparison logic gets embedded in the component instead of being driven by route params or query state
- Seed data is keyed by index/order rather than slug, so swapping in a real tool still resolves to the same pair
- A `useState` for "selected tool" gets initialized to the same default every render

**How to avoid:**
- Compare must be a **URL-driven** route from day one: `/compare/:toolA/:toolB` or `/compare?a=claude&b=chatgpt`. The component reads tools from the URL via `useParams` / `useSearchParams` and looks them up in the seed dataset by **slug**, never by hardcoded reference.
- Build Compare second-to-last in the feature pass, AFTER the tool detail page is fully data-driven. If detail pages still hardcode, Compare will too.
- Write one assertion in dev: log a warning if `toolA.slug === toolB.slug` or if either tool is missing from the dataset. Crash early in dev if Compare is reached without both params.
- Demo test: from three different tool detail pages, click Compare and pick three different second tools. All nine combinations must show different content. If any two show identical layouts, you have the bug.
- The "Compare from origin" mental model from the Key Decisions table means the **first** tool comes from the route the user came from (e.g., `/tool/claude` → click Compare → land on `/compare/claude/_pick`). The second tool is a picker that updates the second URL segment on selection.

**Warning signs:**
- Compare component imports specific tools at the top of the file
- "Selected tool" state lives in component state instead of the URL
- Picker UI exists but selecting a different tool doesn't change the URL
- Seed data uses array indices (`tools[0]`, `tools[1]`) anywhere in compare logic
- The comparison fields are typed as a hardcoded shape rather than read from a `Tool` type

**Phase to address:**
**Foundation phase** — define the `Tool` type and slug-based lookup before any feature work. **Compare phase** — implement URL-driven routing as the first commit on the feature, before any visual styling. Add the slug-equality dev assertion in the same commit.

---

### Pitfall 2: Hardcoded Tool Detail — "Everything Is Claude"

**What goes wrong:**
The prototype routes every tool card to the same Claude detail page. The React equivalent: a `/tool/:slug` route exists, but the component renders content from a single hardcoded import or always shows the first tool in the seed array. Users click "ChatGPT" and see Claude's description, pricing, and reviews. This is the same class of bug as the Compare hardcoding, but it shows up earlier and is easier to ignore because the visual doesn't break — only the content is wrong.

**Why it happens:**
- Detail page gets prototyped against one tool to nail the layout
- The `useParams` slug never gets wired to the data lookup
- Seed data lacks unique slugs, so multiple tools collide on the same key
- The default fallback for "tool not found" silently renders the first tool instead of a 404

**How to avoid:**
- The detail page route is `/tool/:slug`. The component does `tools.find(t => t.slug === slug)` and renders **a NotFound page** (not a fallback tool) if the lookup fails.
- Author all ~50 seed tools with **unique, URL-safe slugs** in the very first data commit. Use a TypeScript discriminated union or a const-asserted array so the compiler enforces uniqueness candidates (or write a runtime check on app boot in dev).
- Demo test: click 10 random tool cards and verify the detail content (name, category, description, pricing) is unique to each.
- Use the slug, not the tool name, in `key` props and route params — names can collide (e.g., "Claude" the AI vs. a hypothetical "Claude" the design tool) and contain spaces.

**Warning signs:**
- Detail component file imports a specific tool fixture
- Seed data has no `slug` field (only `name` or `id`)
- The route is `/tool/:id` where `id` is a numeric index — fragile and not human-readable
- A "tool not found" state isn't designed or implemented

**Phase to address:**
**Foundation phase** — define the `Tool` type with a required `slug: string` field, write seed data with all unique slugs, and wire up the data-loading hook (`useTool(slug)`) BEFORE building the detail page UI. Detail page comes after data is real.

---

### Pitfall 3: Upvote/Downvote Buttons — Inconsistent Toggle State

**What goes wrong:**
The original prototype's vote buttons "didn't all work consistently." In React, this typically manifests as one or more of:
- Click upvote, count increments to N+1, click again, count goes to N+2 instead of toggling back to N
- Click upvote then downvote rapidly — count ends up wrong (race condition between two state updates)
- Upvote on the rankings page, navigate to tool detail, see the old count (separate state per route)
- Refresh the page, vote state reverts to defaults (not persisted)
- Vote on tab A, switch to tab B which already has the page open, see stale counts

The grader will test exactly this — they read the usability report, they will click vote 5 times in a row to see if it behaves.

**Why it happens:**
- Vote state is local component state instead of a single source of truth
- Increment/decrement logic uses `setCount(count + 1)` instead of `setCount(c => c + 1)` — closure captures stale value during rapid clicks
- "Already upvoted" is tracked in one place and "count" in another, allowing them to drift
- localStorage write happens in a `useEffect` that depends on count, creating a write-on-mount loop or missing the first write
- No single canonical "vote" action — buttons mutate state directly in onClick

**How to avoke:**
- Model votes as **a single state machine per (user, tool)**: `'none' | 'up' | 'down'`. Count is derived: `count = baseCount + (myVote === 'up' ? 1 : myVote === 'down' ? -1 : 0)`. There is no separate "did I vote" flag.
- Use a **functional state updater** for every vote action: `setVotes(prev => ({...prev, [toolSlug]: nextVote(prev[toolSlug], action)}))`. Never read state outside the updater.
- Keep votes in a **single global store** (Context + reducer, or Zustand), not per-component. The rankings page, tool detail, and any card that shows a count read from the same source.
- Persist votes through a **single write path** — a `useEffect` that subscribes to the votes store and writes the whole map to localStorage on change, OR a dedicated `voteReducer` middleware that persists on every action. Don't write from individual components.
- Hydrate from localStorage **once at app boot**, before the first render of any vote UI. Use a `<Bootstrap>` wrapper or a top-level `useState` lazy initializer: `useState(() => loadFromLocalStorage())`. This prevents the "0 → 47 flicker" on first paint.
- Test the toggle exhaustively: click up 3 times (should be: +1, 0, +1), click up then down (should be: +1, -1), click down twice (should be: -1, 0). Hand the rankings page to someone and ask them to break it.

**Warning signs:**
- `onClick={() => setCount(count + 1)}` anywhere in vote code
- Two separate `useState` calls for "count" and "hasVoted" on the same button
- Vote state defined inside a card component that gets unmounted/remounted on navigation (state resets)
- localStorage write happens inside the onClick handler instead of via a reducer/effect
- Different counts shown on rankings page vs. detail page for the same tool

**Phase to address:**
**Persistence-and-state phase** (early) — design the vote store, the persistence layer, and the hydration sequence BEFORE building the vote UI. The rankings page, tool detail vote button, and any card vote button must all consume the same store from day one. **Polish phase** — add subtle animation on count change so the toggle is visible, but only after the state machine is bulletproof.

---

### Pitfall 4: localStorage Hydration Flicker — UI Briefly Renders Logged-Out / Light Mode

**What goes wrong:**
The first render of the app shows the logged-out hero (or light mode background, or empty favorites) for ~200ms before flashing into the correct authenticated/dark/populated state. This is jarring and screams "fake." For a UI/UX final, it's the kind of polish failure graders notice immediately.

Two distinct flickers to worry about:
1. **Auth flicker:** App renders the marketing landing page, then suddenly the logged-in home page appears as `useEffect` reads the user from localStorage post-mount.
2. **Theme flicker (FOUC):** Body renders with light mode CSS, then the dark class gets applied a frame later, causing a white flash. This is the canonical `Flash Of Unstyled Content` problem. Vite SPAs are less affected than Next.js SSR, but the lag between the empty `index.html` and the first React paint still produces a visible flash if the dark class is set in a `useEffect`.

**Why it happens:**
- Dev reads from localStorage in `useEffect(() => {...}, [])` (runs after first paint) instead of in a lazy `useState` initializer (runs before first paint)
- Dark mode class gets applied by a React effect rather than by an inline script in `index.html`
- Auth state is `null` until the effect runs, so the router renders the unauthenticated branch first

**How to avoid:**
- **Theme:** Add a tiny inline script to `index.html` `<head>` that reads `localStorage.theme` and applies the `dark` class to `<html>` BEFORE the React bundle even loads. This is the standard fix used by `next-themes` and Josh Comeau's "Quest for the Perfect Dark Mode." For a Vite SPA without SSR, you still want this — the gap between `<html>` parsing and React mount is enough for a visible flash on slower machines.
  ```html
  <script>
    try {
      const t = localStorage.getItem('theme');
      if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch {}
  </script>
  ```
- **Auth + favorites + votes:** Use lazy `useState` initializers, not `useEffect`. `const [user, setUser] = useState(() => loadUser())`. This runs synchronously on the first render so the first paint already reflects the persisted state.
- **Initial render guard:** If you must use an effect, render a brief `<Bootstrap />` skeleton that matches the layout (not a spinner — a skeleton or a neutral background that won't visibly transition).
- For Vite + shadcn, skip `next-themes` (it's Next.js-flavored). Implement the inline-script + class-on-html approach manually; it's ~10 lines.

**Warning signs:**
- White flash visible on every page reload
- Logged-in users see the marketing hero for a frame on refresh
- DevTools shows `<html>` without `dark` class for the first paint, then with it on the second
- `useEffect` reads from localStorage and calls `setState` for state that's needed on the first render

**Phase to address:**
**Foundation phase** — set up the theme inline script and the lazy localStorage hydration utility BEFORE shipping any persistent state. Easy to retrofit but easy to forget. **Polish phase** — verify on a throttled CPU (Chrome DevTools Performance tab, 4x slowdown) that no flash is visible.

---

### Pitfall 5: Multi-Tab Inconsistency — Vote in Tab A, Tab B Shows Old Count

**What goes wrong:**
User has the app open in two tabs (a normal demo behavior — graders often open the deployed URL alongside the GitHub repo). They upvote on Tab A. Tab B still shows the old count and the old "not voted" UI state. If they vote again on Tab B, they overwrite Tab A's write because both tabs hydrated from the same starting point.

The PROJECT.md explicitly puts "Real-time / multi-device sync" out of scope, but **same-browser multi-tab consistency** is a different beast — it's free if you implement it correctly, embarrassing if you don't.

**Why it happens:**
- The `storage` event is the only cross-tab signal in vanilla web APIs, and it has a critical gotcha: **it fires on OTHER tabs, not the tab that called `setItem`**. Devs who write a naive listener and test by toggling in one tab see nothing happen and assume it's broken.
- React state is a snapshot in memory. localStorage changes don't automatically re-render React.
- `useState` + `useEffect` hydration runs once at mount, not when storage changes externally.

**How to avoid:**
- Subscribe to the `window` `storage` event and re-hydrate the relevant store when the watched key changes. This is one effect at the store level, not per component.
- Better: use `useSyncExternalStore` (built into React 18) with a localStorage subscriber. This is the official, race-condition-safe primitive for external stores.
- Acceptable simplification for this project's scale: write a `useLocalStorage` hook that reads on mount, writes on change, and listens to `storage` events. There's a well-maintained library `use-local-storage-state` that does all this if you want to skip the boilerplate, but rolling your own ~30-line hook is a defensible call given the timeline.
- For the demo, you don't need to actively show "Tab B updates live" — just don't have Tab B silently overwrite Tab A's data. Re-reading from localStorage on focus (`window.addEventListener('focus', rehydrate)`) is a cheap fallback that covers the demo case.

**Warning signs:**
- Demoing with two tabs open and seeing different counts on the same tool
- "Last write wins" bug where switching tabs and clicking eats the other tab's data
- No `storage` event listener anywhere in the codebase

**Phase to address:**
**Persistence phase** — bake `storage` event handling into the localStorage utility from day one. Cheap to add at the start, painful to retrofit because every consumer needs updating.

---

### Pitfall 6: shadcn/ui Treated as a Black Box (Dark Mode + Theming Mistakes)

**What goes wrong:**
The team adopts shadcn/ui expecting it to be a Material-UI-style component library: install, import, get a polished result. Instead they hit one or more of:
- **Hardcoded color overrides:** Devs write `className="bg-green-500 text-white"` everywhere instead of using semantic tokens (`bg-primary text-primary-foreground`). Result: dark mode toggle breaks specific components because the green is the same in both themes — no contrast in dark mode, or wrong brand color in light mode.
- **Manual `dark:` variants on every component:** `bg-white dark:bg-gray-900 text-black dark:text-white` — works, but it's verbose, easy to miss, and defeats shadcn's CSS-variable system. shadcn redefines the same tokens (`--background`, `--foreground`, `--primary`) in `:root` and `.dark`; you only set the variable values once and components automatically respond.
- **Forking too early:** Devs run `npx shadcn add button` then immediately edit `button.tsx` to add a custom variant. By week 2 they have a forked Button that diverges from the shadcn pattern, and updating shadcn or pulling a new component (like Sonner) requires reconciling.
- **Importing a non-existent component:** shadcn isn't a npm package — components are copied into your repo via the CLI. New devs `npm install shadcn` and get confused.
- **Skipping the install steps:** shadcn requires a `tailwind.config.js` with the right theme extension, a `globals.css` with the CSS variables, and a `components.json` config. Skip any of these and `<Button>` looks unstyled or throws on the import path.

**How to avoid:**
- **Define brand tokens in `globals.css`, not in components.** The PROJECT.md specifies "green primary, orange accent." Set `--primary: <green-hsl>` and `--accent: <orange-hsl>` in `:root` and adjusted values in `.dark`. Then use `bg-primary`, `text-accent` everywhere. NEVER write `bg-green-500` in app code.
- **Customize shadcn components in their generated file**, but treat that as a one-time fork per component. Document any fork in a comment at the top: `// Customized: added "ghost" variant for nav links — 2026-04-27`.
- **Use the Vite-flavored shadcn install path**, not the Next.js one. They differ. Follow `https://ui.shadcn.com/docs/installation/vite` exactly.
- **Use the Sonner component for toasts**, not the deprecated `Toast` component. shadcn's docs explicitly mark the old one deprecated. The PROJECT.md calls for toasts on every persisting action — Sonner is the right choice.
- **Add components incrementally as needed** (`npx shadcn add toast`, `npx shadcn add dialog`). Don't bulk-install all 40+ components on day one — bloats the repo and makes it harder to know what's actually used.

**Warning signs:**
- Any `bg-green-*`, `text-green-*`, `bg-orange-*` literal in component files
- More than ~5 `dark:` modifiers per component
- Generated shadcn files have been heavily edited beyond adding variants
- Theming "mostly works" in light mode but has weird color ghosts in dark mode (telltale sign of a hardcoded color leaking through)

**Phase to address:**
**Foundation phase** — set up `globals.css` with the green/orange tokens in both `:root` and `.dark` BEFORE building any UI. **Every feature phase** — code review every PR for raw color literals; lint with `eslint-plugin-tailwindcss` no-custom-classname rule if time permits.

---

### Pitfall 7: Onboarding Toggle Bug — Selections Look Toggleable But Aren't

**What goes wrong:**
The original prototype had pre-selected onboarding options that couldn't be deselected. The React fix is to make selections toggleable, but a common implementation mistake recreates a similar bug:
- Clicking a chip adds it to a Set/array, but clicking again doesn't remove it (because `arr.push()` was used instead of toggle logic, or because the state contains references that don't equality-check)
- The "Continue" button is enabled even when 0 selections are made (or disabled even when selections exist, because the state is updating but not in a way React sees)
- Selections persist across the two onboarding steps but don't actually save to the user's profile in localStorage at the end (the wizard state is local component state, never written out)
- Pre-selections appear (defaults seeded for "starter" interests) but the user can't tell they're pre-selected vs. their own choices

**Why it happens:**
- Mutating state instead of replacing it (`selections.push(item)` vs. `setSelections([...selections, item])`)
- Using object identity instead of value identity for chip selections (selections are objects, comparing with `===` instead of by `id`/`slug`)
- Forgetting to actually write the wizard result to the user record in localStorage on "Finish"

**How to avoid:**
- Store selections as `Set<string>` of slugs, never as arrays of objects. Toggle: `set.has(slug) ? set.delete(slug) : set.add(slug)`, then `setSelections(new Set(set))` to trigger re-render.
- Pre-selected items should be visually distinct (e.g., a subtle "suggested" badge) so users know what's defaulted vs. chosen.
- The "Continue" / "Finish" button must be **disabled when selection count < N** (require at least 1 interest, at least 1 tool — don't let users skip without choosing).
- Write to localStorage **once on Finish**, with the full user record including `interests`, `selectedTools`, `onboardedAt`. Verify by inspecting localStorage in DevTools after completing the flow.
- Test: pick 3, deselect 3, verify count is 0 and Continue is disabled. Pick 5, navigate back, verify selections persist. Refresh mid-flow — decide if state should persist (probably not for onboarding; it's a one-shot).

**Warning signs:**
- Chips have a "selected" visual but no way to deselect
- The Continue button is always enabled regardless of selection count
- localStorage shows no `interests` or `selectedTools` fields after the user finishes onboarding
- Pre-selected and user-selected chips look identical with no affordance to distinguish

**Phase to address:**
**Auth + onboarding phase** — implement onboarding wizard with Set-based selection state and the persist-on-finish step in one go. **QA phase** — explicit checklist item: "deselect every default and verify it actually deselects."

---

### Pitfall 8: Missing Toast Confirmations — Actions Feel Silent

**What goes wrong:**
The usability test surfaced "missing toast confirmations" as a finding. The PROJECT.md requires toasts for every persisting action (favorited, upvoted, submitted, reviewed). The mistake is one of:
- Some actions toast, others don't — inconsistency is worse than no toasts because users learn to expect feedback and then don't get it
- Toasts fire but disappear too fast (default Sonner duration is 4s; for "Tool submitted for review," you want longer because users want to read it)
- Multiple toasts pile up when the user clicks rapidly — three "Favorited!" stacks on one another for one click each, looks broken
- Toast position covers important UI (e.g., bottom-right toast covers the "Compare" button on tool cards)
- Error states (favorite failed, e.g., quota exceeded) are silent

**How to avoid:**
- Centralize all persistence actions through a single `useAction` or store-action layer that **always** emits a toast on success/failure. No component fires a toast directly; the action does.
- Use `toast.promise()` for async-feeling actions (even if synchronous, wrap in a fake delay for "Submitting...") to give the polish-tier feedback. Use `visibleToasts: 3` in Sonner config to cap stacking.
- Set duration per type: short (2s) for Favorite/Vote, longer (5s) for Submit/Review.
- Position toasts at top-right or bottom-center where they don't cover primary actions on cards.
- localStorage can throw `QuotaExceededError` (rare but possible at ~5MB). Wrap writes in try/catch and toast a user-friendly error.
- Demo test: do every persisting action and verify a toast fires consistently. Click Favorite 5 times rapidly — should see at most 3 visible toasts.

**Warning signs:**
- Some actions silent, others noisy
- Toast position covers important content
- No try/catch around localStorage writes
- Toast text is generic ("Success!") instead of specific ("Added Cursor to favorites")

**Phase to address:**
**Persistence phase** — set up Sonner Toaster in root layout and define the action wrapper before building any feature that persists. **Every feature phase** — wire toasts in the same commit as the action.

---

### Pitfall 9: localStorage Schema Drift — Old Data Crashes the App After Updates

**What goes wrong:**
Day 3 you ship favorites with shape `{ slug: string, addedAt: number }`. Day 7 you decide favorites need a `category` field for filtering. You change the type, deploy, and your own browser (which still has the old data) crashes because `favorites.map(f => f.category.toUpperCase())` blows up — `category` is undefined for old records. The grader who tested on day 4 and again on day 12 sees a blank page on the second visit.

**Why it happens:**
- Naive `JSON.parse(localStorage.getItem('key'))` with no validation
- Data shape evolves during the 2-week build, but no migration step
- TypeScript types lie — `as User` doesn't validate at runtime, it only tells the compiler "trust me"
- One corrupt write (or a manually edited DevTools value, which graders sometimes do) crashes the entire app on next read

**How to avoid:**
- Wrap every read in a parser that validates shape and falls back to defaults on mismatch:
  ```ts
  function loadFavorites(): Favorite[] {
    try {
      const raw = localStorage.getItem('favorites');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(f => typeof f?.slug === 'string');
    } catch { return []; }
  }
  ```
- Version your storage: every write includes `{ version: 1, data: ... }`. Reads check the version and run a migration (or reset) if it's older. Bump the version when you change shape.
- Provide a "Reset app" button in dev mode (or an Easter-egg key combo) that wipes localStorage and reseeds. Saves debugging time on data-shape bugs.
- Use Zod or a tiny hand-written validator for parsing critical state (user, votes, favorites). Type assertions don't validate.

**Warning signs:**
- `JSON.parse(localStorage.getItem(x))` with no try/catch
- Type assertions (`as User`) on parsed JSON
- App crashes after pulling new code, fixed by clearing localStorage
- No version field anywhere in stored data

**Phase to address:**
**Foundation phase** — write the validated load/save utility before any feature persists. **Every feature phase** — bump version + add migration when changing a shape.

---

### Pitfall 10: Two-Week Timeline Trap — Polish Before Correctness

**What goes wrong:**
Week 1 gets eaten by tweaking spacing, perfecting hero animations, and tuning shadcn variants. Week 2 starts and the Compare flow still doesn't work, votes don't persist, and there are 8 features unbuilt. The team ships a beautiful landing page bolted to a broken core. This is THE most common failure mode for student final projects with a deadline.

The PROJECT.md is explicit about this: "Ship usable v1 in week 1, polish + dark mode + edge cases in week 2." Violating this order means dark mode and edge cases never happen.

**Why it happens:**
- shadcn/ui makes the default look good immediately — devs get dopamine from polish before the core works
- The Figma reference is hi-fi at 1440px — easy to fall into pixel-pushing instead of feature-shipping
- "I'll just tweak this margin" eats hours
- The most-visible features (landing page) get over-invested in; the highest-leverage features (Compare, Votes) get rushed at the end
- Dark mode looks like a "later" task but is hard to retrofit if tokens weren't set up correctly from day one

**How to avoid:**
- **Week 1 ships breadth, not depth.** Every required feature has a working, ugly implementation by end of week 1. Compare picks two tools and shows their data in a 2-column div. Rankings shows a list with working votes. That's it.
- **Defer landing-page hero animation to week 2.** It's the most reusable polish work, but it's the lowest-leverage for grading; everything else fails closed (no Compare = grader gives 0 on that section), but a static hero is fine.
- **Set hard "no-polish" rule for week 1**: no animation work, no spacing tweaks beyond what shadcn defaults give you, no custom typography beyond the design system tokens. Use the `text-2xl font-semibold` defaults and move on.
- **Daily git commits** with feature names in commit messages. Graders look at git log to verify incremental work — a single "final commit" looks bad and matches the "everything at the end" anti-pattern.
- **Cut features, not corners.** If running out of time, drop "forgot password" and "submit-a-tool success animation" before dropping "Compare correctness" or "vote persistence." The PROJECT.md "Out of Scope" section is your friend — extend it if needed.
- **Demo dry-run by end of day 10.** Click through every feature against the rubric. Anything broken in dry-run is week 2 priority; anything working stays as-is.

**Warning signs:**
- End of day 4 and only the landing page + auth are built
- More commits about styling than about features
- Open browser tabs full of "best CSS animation library 2026" instead of feature work
- Team finds itself debating font weight while Compare doesn't work
- Spent more than 2 hours on any single visual detail in week 1

**Phase to address:**
**Roadmap phase** (the planning phase that consumes this research) — encode "feature breadth before any polish" as the explicit week-1 success criterion. Phase ordering: foundation → persistence/state → all required features (ugly) → polish + dark mode + edge cases. Compare is in phase 3, not phase 5.

---

### Pitfall 11: Accessibility — The Easy Points You'll Lose

**What goes wrong:**
UI/UX finals weight accessibility heavily because it's measurable. The grader runs Tab through your app and watches what happens. Common failures, in order of how often they bite student projects:
- **Focus rings stripped.** A common Tailwind reset removes the browser's default outline; if shadcn's `focus-visible:ring-*` isn't preserved on every interactive element, keyboard users see nothing when tabbing.
- **Modals trap nothing.** Open the Write Review modal with the keyboard, hit Tab, focus escapes to the page underneath. Worse: Esc doesn't close it. Worse still: focus doesn't return to the trigger button on close.
- **Click-only interactions.** Tool cards have an `onClick` but no `<a>` or `<button>` semantics — the whole card isn't reachable by keyboard. Vote buttons are `<div>`s with an onClick.
- **Missing aria-labels on icon buttons.** Heart icon for favorite, arrow icons for vote — screen readers say "button" with no context. Sighted graders notice when they hover and the title attribute is missing.
- **Color-only state.** Upvoted = green, downvoted = red, neutral = gray. No icon difference, no aria-pressed. Colorblind users can't tell.
- **Forms without labels.** `<input placeholder="Email">` without an associated `<label>` — placeholder disappears on focus, screen reader says "edit text."
- **Headings out of order.** Three `<h1>`s on the landing page, no `<h2>`s, then `<h4>` inside cards. Document outline is incoherent.

**How to avoid:**
- **Use shadcn's `<Button>` for every clickable thing.** It has focus-visible, hover, disabled states baked in. Don't substitute `<div onClick>`.
- **Use shadcn's `<Dialog>` for modals.** It uses Radix under the hood, which traps focus, restores focus, and handles Esc automatically. Don't roll your own modal.
- **`aria-label` on every icon-only button.** `<Button aria-label="Upvote Cursor"><ArrowUp /></Button>`. Use `aria-pressed={vote === 'up'}` for toggle buttons.
- **`aria-live="polite"` region for vote counts** so screen readers announce updates (or rely on Sonner's built-in aria-live for toasts and skip count announcements).
- **Tool cards: wrap the whole thing in an `<a>`** (or use a button + arrow inside, not the whole card). React Router's `<Link>` is the right primitive.
- **Run axe DevTools in week 2.** It's a Chrome extension, free, finds 80% of violations in 5 seconds. Fix all "critical" and "serious" issues; "moderate" ones are bonus.
- **Tab through the whole app once in week 2.** Verify every interactive element has a visible focus ring AND that the tab order makes sense (don't jump from header to footer to middle).
- **Heading hierarchy:** Landing has one `<h1>` (the hero headline). Tool detail has one `<h1>` (the tool name). Sections inside use `<h2>`/`<h3>`. Never skip levels.

**Warning signs:**
- `outline: none` anywhere in CSS without a `:focus-visible` replacement
- Tabbing through the app and the focus ring disappears or doesn't move visibly
- Modals don't close on Esc
- Icon-only buttons without `aria-label`
- axe DevTools shows >0 critical violations

**Phase to address:**
**Foundation phase** — verify shadcn defaults are intact (focus-visible classes preserved, Dialog/Button used everywhere). **Polish phase (week 2)** — full keyboard pass + axe DevTools sweep. Budget half a day for accessibility cleanup; it's cheap to fix late if shadcn was used correctly throughout.

---

### Pitfall 12: Demo-Day Bugs — Empty States, Edge Cases, and "It Worked Yesterday"

**What goes wrong:**
The grader visits the deployed URL with a fresh browser (no localStorage). What they see:
- A search results page that says "0 results" with no friendly empty state
- A favorites page that's just a blank white area because the user has no favorites yet
- A submitted-a-tool flow that throws because "pending review" state was undefined
- A profile page that shows "undefined" where the username should be (because the mock user record didn't have a `username` field)
- The compare page reachable at `/compare` (no params) showing a blank screen instead of redirecting or prompting

These are all "demoed fine on my machine because I had data" bugs. They're catastrophic in a fresh-browser demo because they're the FIRST thing the grader sees.

**Why it happens:**
- All testing happened with seeded/personal data
- No empty-state designs in the Figma prototype, so they don't exist in code
- Routes accessible without prerequisites (e.g., `/compare` without origin tool) aren't guarded

**How to avoid:**
- **Test in a brand-new private browsing window before every commit to main.** Or use a "Reset" button in dev that clears localStorage.
- **Every list has an empty state.** Search ("No tools match — try a different keyword"), Favorites ("You haven't favorited any tools yet — browse to find some"), Reviews ("Be the first to review this tool"), Pending submissions ("Nothing pending — submit a tool to see it here").
- **Every route validates its prerequisites.** `/compare/:a/:b` redirects to home if either tool doesn't exist. `/profile` redirects to login if no user. `/onboarding` skips if user has already onboarded.
- **Seed a "demo user" account for the grader.** Either auto-fill credentials on the login page ("Try it: demo@bu.edu / demo") or include a one-click "Skip auth, use demo account" button. Saves the grader 30 seconds and prevents auth-flow bugs from blocking the rest of the eval.
- **Friday-of-week-2 checklist:** open in incognito, visit every route via direct URL (not just by clicking through), verify no blank screens or undefined values.

**Warning signs:**
- "Works on my machine" but blank in a fresh browser
- `undefined` visible anywhere in the rendered UI
- Direct-URL navigation breaks routes that work when clicked through

**Phase to address:**
**Every feature phase** — implement empty states in the same commit as the feature. **Pre-demo phase (last 2 days)** — full incognito-window walkthrough, fix all undefined/blank-screen bugs.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline color hex codes instead of CSS variables | 30 seconds saved | Dark mode breaks, Figma green can't be tweaked centrally | Never on this project — dark mode is a requirement |
| `useState` + `useEffect` for localStorage instead of `useSyncExternalStore` | Familiar pattern, less to learn | Multi-tab inconsistency, hydration flicker | Acceptable IF a `useLocalStorage` hook centralizes the pattern; never inline in components |
| `as User` type assertions on JSON.parse | Skips writing a validator | First schema change crashes app on cached data | Never — a 5-line validator is cheap insurance |
| Component-local vote state | Faster to ship one card | Inconsistent counts across pages, no persistence | Never — the global vote store is a day-1 requirement |
| Skipping empty states ("we'll add later") | Each feature ships faster | Demo blanks on grader's fresh browser, looks broken | Never — empty state is part of the feature, not a polish item |
| Hardcoded fixture for one tool while building detail layout | Lets you nail visuals before wiring data | Becomes Pitfall 2 if not removed before merging | Acceptable for a single dev session; must be replaced before commit |
| Skipping the inline theme script in `index.html` | One less file to touch | FOUC visible on every reload | Never — it's 10 lines and prevents the most-visible polish bug |
| Manual `dark:` variants on every component | Works without thinking about tokens | Breaks shadcn's design-system pattern, hard to retheme | Acceptable for one-off custom components; never on shadcn primitives |
| `npm install shadcn` (instead of CLI add) | "Just install it" | Components don't exist; wastes time debugging | Never — shadcn isn't an npm package |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn/ui CLI | Following the Next.js install guide for a Vite project | Follow `https://ui.shadcn.com/docs/installation/vite` exactly; the configs differ |
| shadcn Toast | Importing from `@/components/ui/toast` (deprecated) | Use Sonner: `import { toast } from "sonner"`; render `<Toaster />` in root |
| Tailwind dark mode | Setting `darkMode: 'media'` (system preference only) | Set `darkMode: 'class'` and toggle the `dark` class on `<html>` for a user-controllable toggle |
| React Router | Using state in component instead of URL for shareable views | `useSearchParams` / route params for Compare, search, filters |
| localStorage | Calling `setItem` and expecting same-tab `storage` event | `storage` event fires only on OTHER tabs; manually re-render in current tab via the action that wrote |
| Vite env vars | Using `process.env.X` from CRA muscle memory | `import.meta.env.VITE_X` (must have `VITE_` prefix) |
| React 18 strict mode | Effects fire twice in dev; devs assume bug and silence warnings | It's intentional — fix the effect to be idempotent (relevant for vote writes) |
| Sonner | Calling `toast()` before rendering `<Toaster />` | Mount `<Toaster />` in `App.tsx` root; never conditionally |

## Performance Traps

This project's scale is bounded: ~50 tools, single user, single browser. Most performance traps don't apply at this scale. The relevant ones:

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering all 50 tool cards on every vote | Visible lag clicking upvote on rankings page | Memoize cards with `React.memo`; vote count as a separate child component | Noticeable at ~50 tools if cards are heavy (images, multiple effects) |
| `JSON.parse` of huge localStorage on every read | Sluggish app boot | Hydrate once at boot via lazy useState; don't re-parse on every render | Becomes visible at >100KB stored; unlikely with this scale but plausible if many reviews |
| Synchronous localStorage writes blocking the UI | Click → 100ms freeze | Debounce writes for high-frequency actions (e.g., onboarding selection); batch via reducer | At >10 writes/second, which shouldn't happen in normal use |
| Loading all 50 seed tools as a single import | Long first-paint, larger bundle | Acceptable at 50; if it grows past 200, split into per-category JSON files | Bundle penalty is negligible at 50 tools (~20KB JSON max) |
| Unkeyed list rendering | Inconsistent UI on filter/search updates | `key={tool.slug}` on every list item | Causes vote-count desync if keyed by index |

## Security Mistakes

The "no backend, all localStorage" constraint changes the threat model — this isn't a real product, but the grader will still notice obvious issues.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing the password in localStorage as plaintext for the mock auth | Looks unprofessional even though it's mock | Hash before storing (one line with `bcryptjs` browser build), or store a placeholder like `"hashed:<userid>"` and pretend |
| Trusting localStorage user data for "authorization" checks | A user can edit DevTools and become "admin" | This is a mock app — fine for the demo, but document that real auth would move this server-side |
| XSS via user-submitted tool names / reviews | Input like `<script>alert(1)</script>` rendered as HTML | React auto-escapes by default; never use `dangerouslySetInnerHTML` on user input. Use a markdown lib only if needed for review formatting. |
| Including real API keys in seed data tool descriptions | Accidentally committing `sk-...` if you copy from real tools | Review seed data; use generic descriptions only |
| No Content Security Policy on the deployed site | Low risk for a demo, but the grader running Lighthouse will see the missing CSP | Add basic CSP header in `vercel.json` / `_headers` for Netlify |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Submitting a tool with no confirmation that it went somewhere | User clicks submit, screen does nothing visible — repeat-clicks, double-submits | Toast on success + redirect to success screen + show pending tool in their profile |
| Compare page entered with no tool selected | Confused blank state | Empty state: "Pick two tools to compare" with category browser inline; OR redirect to home |
| Search with no results showing nothing | "Is the search broken?" | Empty state with "No tools match X — try [related categories]" |
| Vote count updates without animation | Users don't notice their click registered | Subtle count-flip animation (Framer Motion or CSS transition); already polish-tier so save for week 2 |
| Onboarding can be skipped, breaking personalization | Logged-in home is empty for users who skipped | Either require onboarding (block until done) or render a "Complete your profile" prompt on home |
| Forgot-password "submitted" state is identical to error state | User can't tell if their email request succeeded | Mock-success the entire flow with a message: "If an account exists, you'll receive a reset link" — same wording as real apps, fits the mock |
| Favorites button on tool cards has no visible state difference between favorited and not | User can't tell what they've already saved | Filled heart vs. outlined heart; `aria-pressed` for screen readers |
| Dark mode toggle persists nowhere | Toggle to dark, refresh, back to light — looks like a broken toggle | Save to localStorage immediately on toggle; load via the inline script |
| Long tool names overflow cards | Layout breaks at "ChatGPT-4 Turbo Vision Preview" | Truncate with ellipsis + tooltip on hover; test seed data for the longest name |
| No active state on nav links | User on Rankings page sees nothing different in nav | shadcn provides this via `aria-current="page"` styling; verify it's wired in `<NavLink>` |

## "Looks Done But Isn't" Checklist

- [ ] **Compare flow:** Visually polished but always shows the same two tools — verify by clicking Compare from 3 different origin tools, picking 3 different second tools (9 combinations, all unique)
- [ ] **Tool detail pages:** Layout looks complete but content is identical across tools — verify by viewing 5 random tools and confirming names, descriptions, categories all differ
- [ ] **Upvote/downvote:** Buttons animate but state doesn't toggle correctly on rapid clicks — verify by clicking up 3 times in a row (count: +1, 0, +1) and up→down (count: +1, -1)
- [ ] **localStorage persistence:** State persists in dev but disappears in production build — verify by running `vite build && vite preview` and checking that auth/favorites/votes survive a refresh
- [ ] **Dark mode toggle:** Toggle exists but doesn't persist on refresh, or causes FOUC — verify by toggling, refreshing, and watching for white flash
- [ ] **Toasts:** Some actions toast, others don't — verify every persisting action (favorite, unfavorite, vote, unvote, submit, review) shows a toast
- [ ] **Empty states:** Designed for "happy path" only — verify Search with 0 results, Favorites with 0 saved, Reviews with 0 written, Pending submissions with 0 entries, Onboarding with 0 selections
- [ ] **Keyboard navigation:** Mouse works perfectly but Tab does nothing — verify Tab through entire app, every interactive element has a visible focus ring
- [ ] **Modal accessibility:** Write Review modal opens but Esc doesn't close, focus escapes — verify with keyboard only
- [ ] **Onboarding deselection:** Selecting works but deselecting silently fails — verify by selecting all options, then deselecting all, count returns to 0
- [ ] **Forgot password flow:** Form submits but there's no confirmation screen — verify the success message is identical and reassuring whether the email "exists" or not
- [ ] **Submit-a-tool:** Form submits but the tool doesn't appear anywhere afterward — verify it shows in profile or a "pending" view
- [ ] **Mobile-tablet responsive:** "Looks fine" at 1440px, breaks at 768px — verify at 1440 / 1024 / 768 breakpoints (mobile is nice-to-have per PROJECT.md)
- [ ] **Direct URL access:** Clicking through works, deep-linking breaks — verify every route by typing it into address bar in a fresh tab
- [ ] **Fresh browser demo:** Works in your browser with all the data; blank in incognito — verify in a private window with no localStorage
- [ ] **Build & deploy:** `vite build` succeeds locally but the deployed Vercel/Netlify build is broken — verify the deployed URL works end-to-end before submitting

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hardcoded compare discovered late | MEDIUM | Refactor to URL-driven routing in 2 hours; verify all entry points pass both slugs |
| Vote state inconsistencies | MEDIUM | Centralize all vote logic in one reducer; rip out per-component state; one push, ~3 hours |
| FOUC / hydration flicker | LOW | Add inline script in `index.html`; convert localStorage `useEffect` reads to lazy `useState`; ~30 minutes |
| Dark mode token mistakes | MEDIUM | Find/replace raw color classes (`bg-green-500` → `bg-primary`); update `globals.css` tokens; ~2 hours for a project this size |
| Missing empty states | LOW per state | One component per empty state, ~15 min each; do all in a week-2 sweep |
| Accessibility violations | MEDIUM | axe DevTools sweep + tab-pass; fix focus rings, aria-labels, modal focus traps; budget 4 hours in week 2 |
| localStorage schema crash on fresh code pull | LOW if caught | Add the validator wrapper; bump version; clear stale data on mismatch; ~30 min |
| Scope blown out, week 2 overflowing | HIGH | Cut features explicitly: write a "shipped vs. cut" list, move "cut" items to Out of Scope in PROJECT.md, focus remaining time on the must-haves |
| Deploy broken on Vercel | LOW-MEDIUM | Usually a build path or env var issue; check Vercel logs, ensure `VITE_*` vars are set, verify `dist/` is the publish dir |
| Onboarding can't be skipped, blocks demo | LOW | Add a "demo skip" button visible in dev mode that bypasses onboarding for grader convenience |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| #1 Hardcoded Compare | Foundation (define types/slug) + Compare-feature phase | 9-combination click-test: 3 origin tools × 3 second tools, all unique |
| #2 Hardcoded Tool Detail | Foundation (seed data with unique slugs) + Detail-page phase | Click 10 random tools, verify all content differs |
| #3 Vote toggle state | Persistence/state-store phase (before vote UI) | Rapid-click test: up×3 → +1, 0, +1; up→down → +1, -1 |
| #4 Hydration flicker | Foundation (theme inline script + lazy hydration) | Hard-refresh on throttled CPU, no white flash visible |
| #5 Multi-tab inconsistency | Persistence phase (storage event listener) | Open two tabs, vote on Tab A, focus Tab B, count updates |
| #6 shadcn theming mistakes | Foundation (CSS variables in globals.css) + every feature phase | Grep for `bg-green-` / `text-orange-` literals — should be zero in app code |
| #7 Onboarding toggle bug | Auth + onboarding phase | Select all → deselect all → count is 0 and Continue is disabled |
| #8 Missing toasts | Persistence phase (Sonner setup) + every feature phase | Walkthrough every persisting action, verify toast fires |
| #9 localStorage schema drift | Foundation (validated load/save utility) | Manually corrupt a value in DevTools, app falls back gracefully |
| #10 Polish before correctness | Roadmap phase (this doc) — encode "breadth before polish" ordering | End of week 1: every required feature has an ugly working version |
| #11 Accessibility | Foundation (use shadcn Button/Dialog) + Polish phase (axe sweep) | axe DevTools shows 0 critical violations; full keyboard pass works |
| #12 Empty states / fresh-browser bugs | Every feature phase (empty state in same commit) + Pre-demo phase | Incognito-window walkthrough: every route via direct URL, no blanks |

---

## Sources

- [Fixing Dark Mode Flickering (FOUC) in React and Next.js — Not A Number](https://notanumber.in/blog/fixing-react-dark-mode-flickering)
- [Implement Dark/Light mode: How to fix the flicker of incorrect theme? — DEV Community](https://dev.to/tusharshahi/react-nextjs-dark-mode-theme-switcher-how-i-fixed-my-flicker-problem-5b54)
- [The Quest for the Perfect Dark Mode — Josh W. Comeau](https://www.joshwcomeau.com/react/dark-mode/)
- [Theming — shadcn/ui](https://ui.shadcn.com/docs/theming)
- [Dark Mode (Vite) — shadcn/ui](https://ui.shadcn.com/docs/dark-mode/vite)
- [The Ultimate shadcn/ui Handbook (2026 Edition) — shadcnspace](https://shadcnspace.com/blog/shadcn-ui-handbook)
- [How semantic colors work in shadcn/ui — shadcndesign](https://www.shadcndesign.com/blog/how-semantic-colors-work-in-shadcn-ui)
- [Sonner — shadcn/ui](https://ui.shadcn.com/docs/components/radix/sonner)
- [Sync Local Storage state across tabs in React using useSyncExternalStore — DEV Community](https://dev.to/oakhtar147/sync-local-storage-state-across-tabs-in-react-using-usesyncexternalstore-57ak)
- [Cross-Tab State Synchronization in React Using the Browser storage Event — Medium](https://medium.com/@vinaykumarbr07/cross-tab-state-synchronization-in-react-using-the-browser-storage-event-14b6f1a97ea6)
- [use-local-storage-state — astoilkov / GitHub](https://github.com/astoilkov/use-local-storage-state)
- [Concurrent Optimistic Updates in React Query — TkDodo](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
- [use-optimistic-reducer — GitHub](https://github.com/aboudicheng/use-optimistic-reducer)
- [Accessibility — React (legacy docs)](https://legacy.reactjs.org/docs/accessibility.html)
- [Common Accessibility Issues with Modals (and How to Fix Them) — OpenReplay](https://blog.openreplay.com/common-accessibility-issues-modals-fix/)
- [How to Build Accessible Modals with Focus Traps (2026) — UXPin](https://www.uxpin.com/studio/blog/how-to-build-accessible-modals-with-focus-traps/)
- [Why URL state matters: A guide to useSearchParams in React — LogRocket](https://blog.logrocket.com/url-state-usesearchparams/)
- [State Management — React Router](https://reactrouter.com/explanation/state-management)
- [What is Feature Creep and How to Avoid It? — Designli](https://designli.co/blog/what-is-feature-creep-and-how-to-avoid-it)
- [MVP Roadmap Guide 2026 — Presta](https://wearepresta.com/the-complete-mvp-roadmap-guide-for-2026/)
- [Final Project Grading — CS4530, Northeastern](https://neu-se.github.io/CS4530-Spring-2024/assignments/project-grading)
- [The 5D Rubric — User Experience Office, Princeton](https://ux.princeton.edu/5d-rubric)
- [UX Design and Critique Rubric — RIT](https://www.se.rit.edu/~swen-444/activities/UX%20Design%20and%20Critique%20Rubric.pdf)
- Project context: `.planning/PROJECT.md` — usability findings (n=3), green/orange visual identity, 2-week timeline, no-backend constraint

---
*Pitfalls research for: Vite + React + TS + Tailwind + shadcn/ui app with localStorage persistence; UI/UX final*
*Researched: 2026-04-26*
