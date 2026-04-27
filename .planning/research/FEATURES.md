# Feature Research

**Domain:** AI tools discovery / compare / community-rankings web app (Product Hunt / There's An AI For That / Futurepedia analog, BU-student flavored)
**Researched:** 2026-04-26
**Confidence:** HIGH (well-established product category with clear convention, multiple direct competitors)

## Executive Summary

The "AI tools directory + compare + community" category is mature. There is a strong consensus stack of **table-stakes features** every credible competitor ships: categorized browsing, search, individual tool detail pages, side-by-side comparison, community signals (upvotes/reviews), submit-a-tool, favorites/bookmarks, and onboarding-personalized recommendations. The PROJECT.md Active list **covers 100% of these table stakes** — the user's requirement set is well-calibrated against industry norms.

The differentiation opportunity is **not in adding more features** but in execution quality (the Compare flow specifically — every TAAFT/Futurepedia review complaint is about shallow comparison) and in audience focus (BU/university students, which is currently underserved by general-purpose AI directories). Several "obvious" features should be **explicitly cut** because they require a backend, real-time infrastructure, or moderation staff this project does not and will not have.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| # | Feature | Why Expected | Complexity | PROJECT.md Coverage |
|---|---------|--------------|------------|---------------------|
| T1 | Authentication (sign up / sign in / forgot password) | Every personalized directory has accounts; gates favorites + submissions | M | Active: "Mock auth" |
| T2 | Browse by category | Primary discovery mode in every competitor (PH, TAAFT, Futurepedia all category-first) | S | Active: "All-categories index + per-category browsing" |
| T3 | Free-text search with results page + empty state | Second-most-used discovery surface; expected on every directory | S | Active: "Search with results page and empty state" |
| T4 | Per-tool detail page (one URL per tool) | Anchor of the entire directory; usability test failure root cause ("everything is Claude") | M | Active: "Unique tool detail pages" |
| T5 | Side-by-side comparison of 2 tools | Defining feature of the category; users come specifically to compare | M | Active: "Compare flow" |
| T6 | Community ranking via upvote/downvote | Social proof; PH-style ranking is the genre's signature | S | Active: "Rankings page with working upvote/downvote" |
| T7 | Written reviews on tools | Decision support — directories without reviews feel like ad pages | M | Active: "Write Review modal" |
| T8 | Favorites / bookmarks | Users build a shortlist while exploring; expected affordance | S | Active: "Favorites page" |
| T9 | Submit a tool (user-generated additions) | Community contribution loop; every directory has it | M | Active: "Submit a Tool form" + "Submit success screen" |
| T10 | User profile page | Identity surface for the account; minimal but expected | S | Active: "User profile page" |
| T11 | Onboarding to personalize first session | Differentiates blank-slate from "for you" home; reduces bounce on first visit | M | Active: "Two-step onboarding: pick interests, pick tools" |
| T12 | Personalized home / recommendations after sign-in | Pays off onboarding; what makes the account feel useful | M | Active: "Logged-in home with personalized recommendations" |
| T13 | Toast / inline confirmation for every persisting action | Direct fix for the usability test "buggy upvotes" finding; basic interaction feedback | S | Active: "Toast notifications for every persisting action" |
| T14 | Landing page that explains the product to non-logged-in visitors | First impression; required for grading rubric on a UI/UX final | M | Active: "Landing page with hero, value pillars, demo entry" |
| T15 | Reasonable seed catalog (≥30 tools, ≥6 categories) | Empty directory is a dead directory; users need enough variety to feel the product | M | Active: "~50 seed tools across ~10 categories" |
| T16 | Light + dark mode | 2026 baseline expectation; reviewers will check; trivial with Tailwind | S | Active: "Light + dark mode toggle" |
| T17 | Keyboard navigation + visible focus states | Accessibility table-stakes for a UI/UX-graded final | S | Constraints section: "Accessibility — Keyboard nav and visible focus" |
| T18 | Persistent state across reload (favorites, upvotes, reviews stay) | Without this, every interaction feels fake | S | Constraints: "Persistence: localStorage only" — implementation detail |

**Coverage check:** All 18 table-stakes items are covered by either the Active requirements list or the Constraints section. **No gap.**

### Differentiators (Competitive Advantage)

Features that set the product apart from generic AI directories. These align with the project's Core Value: "Help students find and choose AI tools faster."

| # | Feature | Value Proposition | Complexity | Should We Build? |
|---|---------|-------------------|------------|------------------|
| D1 | Compare flow that starts from a tool you're viewing (not a blank pair-picker) | Matches user mental model ("I'm on Claude → compare to what?"); fixes the test failure | M | YES — already in Active. Genuine differentiator vs Futurepedia's blank-state compare. |
| D2 | Two-step interest+tool onboarding, with toggleable selections | Personalization without a quiz; fixes the "preselected-only" bug from testing | M | YES — already in Active. Polished onboarding is rare in this category. |
| D3 | Student-flavored framing (BU primary, MIT/Harvard/Stanford/NYU trusted-by) | Audience focus that no general directory has | S | YES — Figma already does this; cheap to keep. |
| D4 | Curated category set tuned to student workflows (Writing, Coding, Research, Image, Audio, Productivity, +4) | Tighter than Futurepedia's 100+ categories — easier to navigate | S | YES — already in Active (~10 categories). |
| D5 | Side-by-side compare with visually-toned-down rows for shared values | Reduces cognitive load; users see only what differs (industry research finding) | M | RECOMMEND — minor polish on the Compare flow, big perceived-quality win for a UI/UX grade. |
| D6 | Upvote AND downvote (most directories only allow upvote) | Lets community correct hype; differentiates from PH's pure-positive model | S | YES — already in Active. |
| D7 | Submit-a-Tool routes to a visible "Pending Review" queue the user can see | Mirrors a real moderation workflow without a backend; demonstrates system-design thinking | S | YES — already in Active. |
| D8 | "Why this tool" reasoning on recommendations (transparent personalization) | University-research finding: students want to understand AI recommendation logic | S | RECOMMEND — small text like "Recommended because you picked Coding" on the home page. Cheap, very differentiating, addresses a real research insight. |
| D9 | Saved comparisons (compare A vs B again later) | Power-user feature; meaningful given comparison is the headline flow | S | OPTIONAL — only if time allows in week 2; depends on T8 (favorites infra). |
| D10 | Empty/loading/error states designed (not default Tailwind) | Genre-wide weakness in competitors; UI/UX rubric reward | S | RECOMMEND — empty state for search is in Active; extend to favorites-empty, no-reviews-yet, no-pending-tools. |

### Anti-Features (Deliberately Exclude)

Features that **seem obvious for an AI tools directory but should be explicitly cut** because of the no-backend constraint, the 2-week timeline, or because they actively hurt the experience.

| # | Anti-Feature | Why Tempting | Why Cut | Already Out-of-Scope in PROJECT.md? |
|---|--------------|--------------|---------|-------------------------------------|
| A1 | Real-time multi-user sync (live upvote counts ticking up) | Feels alive | Requires backend + websockets; impossible with localStorage | Yes ("Real-time / multi-device sync") |
| A2 | OAuth (Google / GitHub sign-in) | Lower signup friction | OAuth requires real callback domain + token storage; can't be mocked credibly | Yes ("OAuth — email/password mock only") |
| A3 | Real email for forgot-password | Completes the auth loop | No mail server; mock flow is sufficient and graders will understand | Yes ("Real email sending… flow exists but is mock") |
| A4 | Admin dashboard / moderation queue review UI | Realistic moderation story | No admin role; doubles screen count; out of scope for a UI/UX final | Yes ("Admin dashboard — no admin role") |
| A5 | Server-side spam/abuse filtering on submitted tools | Sounds responsible | Same — no server. The local "pending" queue tells the story without it. | Yes ("Server-side moderation") |
| A6 | Payments / pricing tiers / "Pro" features | Monetization story | Stripe needs a backend; not graded; pure scope inflation | Yes ("Payments / pricing tiers") |
| A7 | Native mobile app | Reach | 2-week timeline, single dev, web-only is fine for grading | Yes ("Mobile-native app — responsive web only") |
| A8 | AI chat / "ask the directory a question" feature | Trendy, on-brand for AI category | Requires LLM API key, billing, prompt engineering; massive scope add for a single feature | **NEW — recommend adding to Out of Scope** |
| A9 | Real-time collaborative comparison ("compare with a friend") | Social/viral hook | No backend, no websockets; impossible | **NEW — recommend adding to Out of Scope** |
| A10 | User-to-user messaging / DMs / follow graph | Community feature creep | Requires real persistence + spam controls; not core to "find a tool faster" | **NEW — recommend adding to Out of Scope** |
| A11 | Comment threads on individual reviews (replies, threading) | Mirrors PH | Reviews are sufficient social proof; threading explodes data model and screen complexity | **NEW — recommend adding to Out of Scope** |
| A12 | Gamification (badges, points, streaks, leveling up) | Engagement hook | Adds 3+ screens of profile cruft; distracts from the find-a-tool job; common UI/UX anti-pattern | **NEW — recommend adding to Out of Scope** |
| A13 | Live API integration with the AI tools themselves (try-in-page) | "Wow" demo | Each tool has different auth, terms, rate limits; combinatorially impossible | **NEW — recommend adding to Out of Scope** |
| A14 | Third-party review aggregation (G2, Capterra, Trustpilot scores) | Trust signals | Requires API keys, ToS issues, breaks the local-data story | **NEW — recommend adding to Out of Scope** |
| A15 | Newsletter signup / email digest of new tools | Standard directory monetization | No email infra; 1 more form to design with no payoff | **NEW — recommend adding to Out of Scope** |
| A16 | Affiliate links / "Try this tool" tracked outbound clicks | Common Futurepedia pattern | Plain external links are fine; tracking needs analytics infra | **NEW — recommend adding to Out of Scope** |
| A17 | Multiple tool comparison (3+, 4+ side-by-side) | Power feature | UX gets noisy fast; 2-up is the sweet spot per industry research; scope explosion | **NEW — recommend adding to Out of Scope** |
| A18 | Edit / delete own review after posting | Realistic | Adds CRUD complexity to localStorage layer for marginal value in a 2-week sprint | **NEW — recommend adding to Out of Scope** |
| A19 | Tool versioning / changelog / "updated 2 weeks ago" freshness | Authority signal | Requires real data ingestion or fake-but-consistent timestamps; high lie-effort, low payoff | **NEW — recommend adding to Out of Scope** |
| A20 | Pricing-tier filtering on tools (Free / Freemium / Paid) | Useful filter | Real value, but only if seed data includes accurate pricing — risk of stale/wrong info hurting credibility. Defer until seed data is locked. | OPTIONAL — only if seed data is reliable |

**Recommendation:** Add A8–A19 to the PROJECT.md "Out of Scope" section. Currently that section names categories of cuts (backend, OAuth, mobile) but doesn't enumerate specific features users / reviewers might ask "why didn't you add X?" Pre-empting those is good documentation hygiene for the grading rubric.

## Feature Dependencies

```
Auth (T1)
  └──enables──> Favorites (T8)
  └──enables──> Submit a Tool (T9)
  └──enables──> Write Review (T7)
  └──enables──> Upvote/Downvote (T6)
  └──enables──> User Profile (T10)
  └──enables──> Onboarding (T11)
                    └──enables──> Personalized Home (T12)

Tool Detail Page (T4)
  └──enables──> Compare Flow (T5)
  └──enables──> Write Review (T7)
  └──enables──> Favorites (T8)
  └──enables──> Upvote/Downvote (T6)

Categories (T2)
  └──enables──> Browse-by-category surfaces on Landing (T14)
  └──enables──> Onboarding interest picker (T11)

Search (T3)
  └──parallel-to──> Categories (T2)  // both are discovery surfaces

Seed Catalog (T15)
  └──prerequisite-for──> EVERYTHING above (no tools = no app)

Toast notifications (T13)
  └──cross-cuts──> T6, T7, T8, T9  // every persisting action triggers it

Light/Dark Mode (T16)
  └──cross-cuts──> all screens  // design-system level
```

### Dependency Notes

- **Seed catalog is the critical-path blocker.** No tool browsing, search, comparison, or rankings work meaningfully without ~50 real-feeling entries. Author this in week 1, alongside data model.
- **Auth gates 6 of 18 table stakes.** Mock auth must land before favorites, reviews, upvotes, submissions, profile, or onboarding can be tested end-to-end.
- **Tool detail page is the second hub.** Compare, review, favorite, and upvote all originate from it. If detail pages aren't real (the test bug), every dependent flow looks broken.
- **Toasts cross-cut everything.** Build a single toast component once and wire it into the persistence layer; do not reinvent per-action.
- **Categories and Search are parallel** — neither blocks the other; can be built in either order.

## MVP Definition

### Launch With (v1) — Week 1 Critical Path

The minimum to call the project "shippable." Aligns with PROJECT.md timeline ("Ship usable v1 in week 1").

- [ ] Seed data: 50 tools, 10 categories, with names/descriptions/logos/category tags (T15)
- [ ] Routing skeleton: landing, auth, home, category, tool-detail, compare, search, favorites, profile, rankings, submit, success (covers 22 Figma screens)
- [ ] Mock auth + localStorage user object (T1)
- [ ] All-categories index + per-category list (T2)
- [ ] Search with results + empty state (T3)
- [ ] Tool detail pages — every tool gets its own (T4) — **fixes test bug #1**
- [ ] Compare flow — origin tool + picker for second tool (T5) — **fixes test bug #2**
- [ ] Favorites with localStorage persistence (T8)
- [ ] Upvote/downvote with localStorage + toast (T6 + T13) — **fixes test bug #3**
- [ ] Write review modal with localStorage (T7)
- [ ] Submit tool form + pending queue + success screen (T9)
- [ ] Two-step onboarding (T11) → logged-in home (T12)
- [ ] Landing page (T14)
- [ ] User profile (T10)

### Add After v1 Lands (Week 2 Polish)

Features that are part of the requirements but lower critical-path risk.

- [ ] Light/dark mode wiring across all screens (T16) — Tailwind `dark:` variant pass
- [ ] Empty/loading/error states beyond search (favorites-empty, no-reviews, no-pending) (D10)
- [ ] Keyboard nav + focus state audit (T17)
- [ ] Toast polish: stacking, dismissal, motion (T13)
- [ ] Compare-flow visual polish: tone down rows where values match (D5)
- [ ] "Recommended because…" reasoning text on home (D8)
- [ ] Responsive breakpoints (tablet at minimum)

### Future Consideration (v2+) — Explicitly Not in Scope

These would be the natural next-mile features if the project continued past the course.

- [ ] Saved comparisons (D9) — only if persistence layer is well-organized at end of week 2
- [ ] Pricing-tier filter (A20) — only if seed data quality supports it
- [ ] Real backend with Supabase / Postgres (lifts every Out-of-Scope item)
- [ ] OAuth (A2)
- [ ] Real email for password reset (A3)
- [ ] Admin moderation UI (A4)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Tool detail pages (T4) | HIGH | MEDIUM | P1 |
| Compare flow (T5) | HIGH | MEDIUM | P1 |
| Upvote/downvote with feedback (T6) | HIGH | LOW | P1 |
| Mock auth (T1) | HIGH | MEDIUM | P1 |
| Favorites (T8) | HIGH | LOW | P1 |
| Categories browse (T2) | HIGH | LOW | P1 |
| Search (T3) | HIGH | LOW | P1 |
| Onboarding (T11) | HIGH | MEDIUM | P1 |
| Personalized home (T12) | HIGH | MEDIUM | P1 |
| Submit a tool (T9) | MEDIUM | MEDIUM | P1 |
| Write review (T7) | MEDIUM | MEDIUM | P1 |
| Toasts (T13) | HIGH | LOW | P1 |
| Landing page (T14) | HIGH | MEDIUM | P1 |
| Seed catalog (T15) | HIGH | MEDIUM | P1 |
| User profile (T10) | LOW | LOW | P1 |
| Dark mode (T16) | MEDIUM | LOW | P1 |
| Keyboard nav / focus (T17) | MEDIUM | LOW | P1 |
| Compare row toning (D5) | MEDIUM | LOW | P2 |
| "Why recommended" reasoning (D8) | MEDIUM | LOW | P2 |
| Empty states everywhere (D10) | MEDIUM | LOW | P2 |
| Saved comparisons (D9) | LOW | MEDIUM | P3 |
| Pricing filter (A20) | LOW | MEDIUM | P3 |

**Priority key:**
- **P1:** Must ship for v1 (week 1)
- **P2:** Should ship for v1 polish (week 2)
- **P3:** Defer; only build if week 2 has slack

## Competitor Feature Analysis

| Feature | Product Hunt | There's An AI For That | Futurepedia | Our Approach |
|---------|--------------|------------------------|-------------|--------------|
| Browse by category | Yes (broad tech) | Yes (AI-specific, 100+) | Yes (AI-specific, sortable) | Yes — 10 student-tuned categories |
| Search | Basic | Strong (primary surface) | Strong + filters | Search + empty state, no advanced filters |
| Tool detail pages | Yes | Yes | Yes | Yes — unique URL per tool |
| Side-by-side compare | No (gallery only) | Limited | Yes (often shallow) | **Yes — origin-tool-anchored, our differentiator** |
| Upvote | Yes (signature feature) | No (curation-based) | No | Yes |
| Downvote | No | No | No | **Yes — differentiator** |
| Reviews | Yes (comments) | No | Limited | Yes (modal-based) |
| Submit a tool | Yes (hunter model) | Yes (paid placement) | Yes (paid placement) | Yes — free, local pending queue |
| User accounts | Yes | Optional | Optional | Yes (mock) |
| Personalized home | Limited | Some | Limited | **Yes — onboarding-driven, differentiator** |
| Audience focus | Tech generalist | AI generalist | AI generalist | **Students/university — differentiator** |
| Multi-tool compare (3+) | N/A | N/A | Sometimes | No (deliberate cut, A17) |
| Affiliate / paid placement | No | Yes | Yes | No (deliberate cut, A16) |
| Newsletter | Yes | Yes | Yes | No (deliberate cut, A15) |
| Native chat / "ask the directory" | No | Some | No | No (deliberate cut, A8) |

## Coverage Verification: PROJECT.md Active List vs Table Stakes

Every Active item is justified, and every table-stakes item maps to an Active item:

| PROJECT.md Active item | Maps to Table Stakes # | Status |
|------------------------|------------------------|--------|
| Landing page with hero, value pillars | T14 | Covered |
| Mock auth (sign up / sign in / forgot) | T1 | Covered |
| Two-step onboarding | T11 | Covered |
| Logged-in home with recommendations | T12 | Covered |
| All-categories index + per-category | T2 | Covered |
| Search with results + empty state | T3 | Covered |
| Unique tool detail pages | T4 | Covered |
| Compare flow | T5 | Covered |
| Favorites page | T8 | Covered |
| User profile page | T10 | Covered |
| Write Review modal | T7 | Covered |
| Rankings with upvote/downvote | T6 | Covered |
| Submit a Tool form | T9 | Covered |
| Submit success screen | T9 (sub-screen) | Covered |
| Toast notifications | T13 | Covered |
| Light + dark mode | T16 | Covered |
| ~50 seed tools, ~10 categories | T15 | Covered |
| (Constraints) Persistence localStorage | T18 | Covered |
| (Constraints) Keyboard nav + focus | T17 | Covered |

**Result: 100% of table-stakes coverage.** No missing requirements.

## Recommendations to PROJECT.md Author

1. **Add explicit anti-features to Out of Scope.** The current Out of Scope section calls out architectural cuts (backend, OAuth, mobile) but reviewers may ask "why no AI chat? why no 3-way compare?" Pre-empting these strengthens the deliverable. Suggested additions: A8 (AI chat), A9 (real-time collab), A10 (DMs), A11 (review threading), A12 (gamification), A13 (live tool API integration), A14 (3rd-party review scores), A15 (newsletter), A16 (affiliate tracking), A17 (3+ compare), A18 (edit/delete own review), A19 (changelog/freshness).

2. **Consider promoting D5 ("tone down matching rows in compare") and D8 ("why recommended" reasoning) into Active.** Both are S-complexity, both materially improve perceived quality on a UI/UX final, both address findings from real industry/research sources.

3. **Lock seed data quality early.** A20 (pricing filter) is gated on whether the seed tools have accurate pricing tiers. Decide in week 1 whether to author pricing into the seed; if yes, the filter is cheap; if no, cut it cleanly.

4. **D9 (saved comparisons) is the natural week-2 stretch.** Only attempt if the localStorage persistence layer is well-factored by end of week 1.

## Sources

- [Best AI Tools Directory for 2026 — KULFIY](https://www.kulfiy.com/best-ai-tools-directory-for-2026-how-to-find-the-right-ai-tool-faster/) — directory feature expectations (categorization, filters, decision support)
- [The Best AI Tool Directories to Explore in 2026 — ArticleTed](https://www.articleted.com/article/1150026/371655/The-Best-AI-Tool-Directories-to-Explore-in-2026) — directory UX standards
- [Building a Side-by-Side Comparison Feature for a Multilingual AI Tools Directory — Medium](https://medium.com/@automateandtweak/building-a-side-by-side-comparison-feature-for-a-multilingual-ai-tools-directory-a007b0db4291) — comparison-feature design (toned-down matching rows insight, D5)
- [Best AI Tool Directories — tldv.io](https://tldv.io/blog/ai-tools-directories/) — competitor breakdown (Futurepedia, TAAFT pricing models)
- [10 Best Product Hunt Alternatives in 2026 — Poindeo](https://poindeo.com/blog/product-hunt-alternatives) — community-driven directory feature norms
- [Top 20 Software Directory and Review Sites in 2026 — SaaSHunt](https://saashunt.ai/blog/top-software-directory-and-review-sites/) — review/upvote pattern survey
- [Redefining College Discovery and Student Trust — Social Media Explorer](https://socialmediaexplorer.com/content-sections/redefining-college-discovery-and-student-trust/) — student audience differentiation, transparency-in-recommendations finding (D8)
- [How Students Use AI — Digital Education Council](https://www.digitaleducationcouncil.com/post/how-students-use-ai-the-evolving-relationship-between-ai-and-higher-education) — student adoption patterns, top categories (writing, coding, research)
- [Feature Creep — Designli](https://designli.co/blog/what-is-feature-creep-and-how-to-avoid-it) — anti-feature framing rationale

---
*Feature research for: AI tools directory + compare + community-rankings web app (BU/student-focused)*
*Researched: 2026-04-26*
