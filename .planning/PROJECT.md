# AI Tools — Discovery, Compare & Community Platform

## What This Is

A web app for discovering, comparing, and ranking AI tools — built for university students (BU-flavored) who need to find the right tool for a specific task. Users browse by category or search, compare tools side-by-side, upvote the ones they trust, and submit new tools to the directory. This is the React/TypeScript rebuild of an existing Figma high-fidelity prototype, refined based on findings from a 3-participant usability test.

## Core Value

Help students find and choose AI tools faster — every tool has its own real detail page, every comparison reflects the user's actual choice, and every action (favorite, upvote, submit) gives clear, immediate feedback.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page with hero, value pillars (Discover/Compare/Community), and demo entry point
- [ ] Mock auth: sign up, sign in, forgot password — persists user in localStorage
- [ ] Two-step onboarding: pick interests, pick tools — selections are toggleable (fixes preselected-only bug from testing)
- [ ] Logged-in home with personalized recommendations and category shortcuts
- [ ] All-categories index + per-category browsing pages
- [ ] Search with results page and empty state
- [ ] Unique tool detail pages — every tool in the directory routes to its own page (fixes "everything is Claude" bug)
- [ ] Compare flow — from any tool, pick a second tool and view side-by-side comparison (fixes hardcoded Claude-vs-ChatGPT bug)
- [ ] Favorites page — saved tools persist per user
- [ ] User profile page
- [ ] Write Review modal — reviews persist per tool
- [ ] Rankings page with working upvote/downvote (every button responds consistently)
- [ ] Submit a Tool form — adds to a local "pending review" queue
- [ ] Submit success screen
- [ ] Toast notifications for every persisting action (favorited, upvoted, submitted, reviewed)
- [ ] Light + dark mode toggle
- [ ] ~50 seed AI tools across ~10 categories (Writing, Coding, Research, Image, Audio, Productivity, plus 4 more)

### Out of Scope

- Real backend (no Supabase, no API server) — all persistence is localStorage
- Real email sending for forgot-password — flow exists but is mock
- Server-side moderation — submitted tools never leave the local "pending" queue
- Real-time / multi-device sync — single-browser experience
- Mobile-native app — responsive web only
- Admin dashboard — no admin role, no review/approve UI
- Payments / pricing tiers
- OAuth (Google, GitHub) — email/password mock only

## Context

- **Course context:** Final project for a UI/UX course. Graded on design polish, interaction quality, and how well the app addresses usability findings.
- **Existing prototype:** Figma file `HeEOcLehBJFHKorF48M6mD` — 22 hi-fi screens at 1440px, used Figma-as-reference (not 1:1 redline). Refine layout/motion in code where it improves on static.
- **Usability test (n=3):** Participants Jared Marcus, Jack Gewert, Jake Yu. Average ease rating ~3.5/5. Navigation, category browsing, and visual design all praised. All three failed Task 2 (Compare) due to hardcoded comparison. Buggy upvotes hurt confidence in the prototype's interactivity.
- **Audience:** University students (Boston University primarily, framing extends to MIT/Harvard/Stanford/NYU per Figma trusted-by row).
- **Visual identity:** Green primary, orange accent, white background, clean card-based UI, generous whitespace, modern sans-serif type.

## Constraints

- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui — chosen for fast dev loop, polished default components, and easy static deploy.
- **Persistence:** localStorage only — no backend, no DB, no API.
- **Timeline:** 2 weeks from 2026-04-26. Ship usable v1 in week 1, polish + dark mode + edge cases in week 2.
- **Deployment target:** Static site (Vercel or Netlify) — must build with `vite build` and serve from a single `dist/`.
- **Browser:** Modern desktop browsers (Chrome, Safari, Firefox latest). Responsive down to tablet; mobile is nice-to-have, not required.
- **Accessibility:** Keyboard nav and visible focus states on all interactive elements (table-stakes for a UI/UX final).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite over Next.js | No SSR needs, faster dev loop, simpler static deploy. Next.js overhead not justified without a backend. | — Pending |
| shadcn/ui over Material/Chakra | Closest visual match to Figma's clean card-based aesthetic. Source-owned components are easier to customize. | — Pending |
| localStorage-backed mock auth (not just frontend-only) | Lets reviewers experience the full signup → onboarding → personalized home flow without setting up a DB. | — Pending |
| Compare flow: fixed origin tool + picker for second | Matches user's mental model ("I'm on Claude, click Compare, pick what to compare against") and was the explicit test failure to fix. | — Pending |
| Submit-a-Tool routes to local "pending review" queue | More realistic than instant-add, mirrors a real moderation workflow without needing a backend. | — Pending |
| Both light and dark mode | User opted in; small additional cost using Tailwind's `dark:` variant; demonstrates design-system thinking for the grade. | — Pending |
| ~50 seed tools across ~10 categories | Enough variety to make Discover/Compare/Rankings feel like a real directory; small enough to author without crushing the timeline. | — Pending |

---
*Last updated: 2026-04-26 after initialization*
