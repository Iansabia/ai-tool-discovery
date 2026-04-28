# AI Tool Discovery Platform

> A directory + comparison + community-rankings web app that helps students find AI tools beyond the obvious few. **DS 280 (UI/UX) final project · Boston University · April 2026 · Ian Sabia.**

**Live demo:** [ai-tool-discovery.vercel.app](https://ai-tool-discovery.vercel.app)

Built in **React + TypeScript + Vite + Tailwind v4 + shadcn/ui** on top of a Figma high-fidelity prototype that was usability-tested with three BU students. The React rebuild fixes the issues those tests surfaced and adds the things a static prototype couldn't fake.

---

## What it does

- **Discover.** Browse 50 AI tools across 10 categories. Real descriptions, current pricing, current model versions (Claude Sonnet 4.x, GPT-5, Midjourney v7, Runway Gen-4, etc.). Tools belong to multiple categories — Claude shows up under Writing, Coding, Research, and Productivity.
- **Search.** Fuzzy search by use case (`"research paper"`, `"logo design"`, `"transcribe"`). Multi-purpose tools surface for narrow queries because every tool has a curated set of `searchKeywords`.
- **Compare.** Side-by-side comparison driven entirely by URL params (`/compare/:a/vs/:b`). Swap, change-either-side, save the comparison to your profile. Rows where both tools share a value are dimmed so the actual differences stand out.
- **Vote.** Rankings with working upvote / downvote buttons modeled as a `'none' | 'up' | 'down'` state machine. Trophy / Medal / Award icons mark the top three. List re-orders live on every vote.
- **Review.** Star-rated reviews per tool, persisted in localStorage.
- **Submit.** Submit a new tool to a pending-review queue visible on your profile.
- **Auth.** Mock email/password sign-up + sign-in (Web Crypto SHA-256 + per-user salt) plus a Continue-as-Guest mode that resets between sessions on shared computers.
- **Theming.** Light + dark mode with an inline FOUC-prevention script.

No backend — every state change persists through a namespaced, version-validated localStorage helper.

---

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
npm run test:run     # 278 vitest specs
npm run build        # vite build, type-check, slug + logo validation
```

Node 20+ recommended.

---

## Project structure

```
src/
├── components/
│   ├── layout/          # AppShell, Header, Footer, BackLink
│   ├── theme/           # ThemeProvider, ThemeToggle (next-themes)
│   └── ui/              # shadcn primitives (Button, Card, Form, Dialog, etc.)
├── data/
│   ├── tools.ts         # 50-tool seed catalog (slugs + categories + pricing)
│   ├── categories.ts    # 10 canonical categories with lucide icons
│   └── _validate.ts     # build-time slug-uniqueness + logo presence checks
├── features/
│   ├── auth/            # useAuthStore, useUsersStore, ProtectedRoute, forms
│   ├── tools/           # useFavoritesStore + ToolCard
│   ├── rankings/        # useUpvoteStore + VoteButton (state machine)
│   ├── reviews/         # useReviewStore + WriteReviewDialog
│   ├── submit/          # useSubmissionStore + SubmitToolForm
│   ├── compare/         # useSavedComparisonsStore
│   ├── search/          # fuse.js index over name/keywords/categories/etc.
│   ├── onboarding/      # toggleable interest + tool selection
│   └── profile/         # EditProfileForm
├── lib/
│   ├── storage.ts       # safeGet/safeSet/safeRemove with Zod validation
│   ├── crypto.ts        # SHA-256 password hashing (Web Crypto)
│   ├── withToast.ts     # action wrapper that emits sonner toasts
│   └── category-icon.tsx
├── pages/               # 18 routed pages
├── router.tsx           # createBrowserRouter
├── App.tsx
└── index.css            # tokens + glass-panel / glass-card / gradient-text utilities
```

---

## Stack

| Concern | Library | Why |
|---|---|---|
| Build | Vite 6 + React 18 + TypeScript 5.6 | Fastest dev loop, simplest static deploy |
| Styling | Tailwind v4 + tw-animate-css | First-class Tailwind v4 setup via `@tailwindcss/vite` |
| Components | shadcn/ui + lucide-react | Source-owned, easy to customize |
| State | Zustand 5 | One store per concern, manual hydration through the storage helper |
| Forms | react-hook-form 7 + Zod 3 + `@hookform/resolvers` | Inline validation, schema reuse |
| Routing | react-router 7 | URL is the source of truth for `/tools/:slug` and `/compare/:a/vs/:b` |
| Search | fuse.js 7 | Weighted, typo-tolerant fuzzy search across name + keywords + categories |
| Theme | next-themes | Class-based dark mode with inline FOUC script |
| Toasts | sonner | Single mounted at root |

---

## Usability findings → fixes

Three participants tested the high-fidelity Figma prototype. Findings, ranked by priority, and how they were addressed in the React build:

| # | Finding | Fix |
|---|---|---|
| 1 | Only one tool detail page existed (Claude). Every tool clicked routed there. | `/tools/:slug` reads the slug from the URL and renders unique content for every tool. |
| 2 | Compare page was hard-coded Claude vs ChatGPT. **All 3 participants failed Task 2** because of this. | Compare page renders entirely from `/compare/:a/vs/:b` URL params. The bug structurally cannot recur. |
| 3 | Upvote / downvote buttons fired inconsistently. | Single global vote store with a `'none' \| 'up' \| 'down'` state machine. Every click responds and emits a toast. |
| 4 | Onboarding chips were preselected with no way to deselect. | Every chip starts unpressed. Click toggles. Continue is gated until at least one is picked. |
| 5 | No confirmation feedback for actions. | Toast notifications on every persisting action via a centralized `withToast` wrapper. |

Plus accuracy work on the seed data: every tool has a current description, real pricing (`Free + $20/mo` not just "Freemium"), current model version, and 6–14 use-case keywords for search.

---

## Notes

- All persistence is localStorage. Pasting the link into a fresh browser will not show another user's data — every visitor starts blank.
- The 50 tool logos come from `simple-icons` plus brand-monogram fallbacks for the long tail.
- 278 vitest specs lock the URL-as-source-of-truth contract, the vote state machine (all 6 transitions), the search recall ("research paper" must surface ChatGPT, Claude, and Perplexity along with Elicit, Consensus, Semantic Scholar), and the architectural rule that onboarding components must not call `useUsersStore.updateUser` directly.

---

## Built with

- **Claude** — planning, brainstorming, drafting (research themes, persona, this README)
- **Claude Code** — code generation for the React rebuild
- **Figma / FigJam** — empathy maps, thematic analysis, persona, wireframes, hi-fi mockups, site maps, user flows, mood boards, usability test documentation
