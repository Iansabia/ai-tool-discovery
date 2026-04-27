---
phase: 01-foundation
plan: 05
subsystem: seed-data-and-spa-fallback
tags: [seed-data, categories, tools, brand-logos, simple-icons, found-07, build-time-validation, spa-fallback, vercel, netlify]

requires:
  - phase: 01-foundation
    plan: 01
    provides: Vitest+jsdom test infrastructure
  - phase: 01-foundation
    plan: 02
    provides: Vite scaffold + simple-icons@^16.18 dependency
  - phase: 01-foundation
    plan: 03
    provides: __validateSlugsUnique + __validateLogosPresent in src/data/_validate.ts
  - phase: 01-foundation
    plan: 04
    provides: src/router.tsx (entry point for the side-effect import that loads TOOLS at build time)
provides:
  - 10 canonical categories in src/data/categories.ts (CategorySlug literal union backed by data)
  - 50 tools in src/data/tools.ts (5 per category, every Tool field populated, unique slugs)
  - 50 brand SVGs in src/assets/tool-logos/ (13 simple-icons CC0 + 37 brand-monograms)
  - __validateSlugsUnique(TOOLS) + __validateLogosPresent(TOOLS) module-load calls (FOUND-07 runtime arm)
  - scripts/check-logos.js with build-time duplicate-slug detection (FOUND-07 build-time arm)
  - vercel.json + public/_redirects → dist/_redirects (SPA fallback for production hosts)
  - check:logos chained into the build script so npm run build fails on duplicate slugs OR missing .svg files
affects: [all-phase-3-features, deployment, phase-5-pre-demo]

tech-stack:
  added: []
  patterns:
    - "FOUND-07 build-time enforcement is two-armed: (1) static-parse duplicate-slug detection in scripts/check-logos.js (catches at `npm run build`) AND (2) module-load __validate* calls in tools.ts (catches at dev-server start AND in test runs). Both arms needed because vite build does not execute bundled JS — only the static-parse arm would fire during build."
    - "Brand logo composition strategy: 13 from simple-icons (CC0) for tools that have official simple-icons entries; 37 unique brand-monograms (project-authored, brand-color anchored) for the long tail. Every monogram is distinct (no two share color+initial). README.md documents source + license per slug."
    - "Side-effect import of @/data/tools in src/router.tsx forces tree-shaker to include the seed module in the production bundle so module-load validators fire when the bundle executes (e.g., on a real page load). Without this, no Phase 1 page consumes tools.ts directly."

key-files:
  created:
    - src/data/categories.ts
    - src/data/categories.test.ts
    - src/data/tools.ts
    - src/data/tools.test.ts
    - scripts/check-logos.js
    - vercel.json
    - public/_redirects
    - src/assets/tool-logos/README.md
    - src/assets/tool-logos/akkio.svg
    - src/assets/tool-logos/chatgpt.svg
    - src/assets/tool-logos/claude.svg
    - src/assets/tool-logos/codeium.svg
    - src/assets/tool-logos/consensus.svg
    - src/assets/tool-logos/copy-ai.svg
    - src/assets/tool-logos/copy-ai-marketing.svg
    - src/assets/tool-logos/cursor.svg
    - src/assets/tool-logos/dalle.svg
    - src/assets/tool-logos/descript.svg
    - src/assets/tool-logos/elevenlabs.svg
    - src/assets/tool-logos/elicit.svg
    - src/assets/tool-logos/figma-ai.svg
    - src/assets/tool-logos/framer-ai.svg
    - src/assets/tool-logos/galileo-ai.svg
    - src/assets/tool-logos/github-copilot.svg
    - src/assets/tool-logos/grammarly.svg
    - src/assets/tool-logos/heygen.svg
    - src/assets/tool-logos/hubspot-ai.svg
    - src/assets/tool-logos/ideogram.svg
    - src/assets/tool-logos/jasper.svg
    - src/assets/tool-logos/jasper-marketing.svg
    - src/assets/tool-logos/julius-ai.svg
    - src/assets/tool-logos/leonardo-ai.svg
    - src/assets/tool-logos/mem.svg
    - src/assets/tool-logos/midjourney.svg
    - src/assets/tool-logos/motion.svg
    - src/assets/tool-logos/notion-ai.svg
    - src/assets/tool-logos/numerous.svg
    - src/assets/tool-logos/obviously-ai.svg
    - src/assets/tool-logos/opus-clip.svg
    - src/assets/tool-logos/perplexity.svg
    - src/assets/tool-logos/pika.svg
    - src/assets/tool-logos/reclaim-ai.svg
    - src/assets/tool-logos/recraft.svg
    - src/assets/tool-logos/replit.svg
    - src/assets/tool-logos/rows.svg
    - src/assets/tool-logos/runway.svg
    - src/assets/tool-logos/rytr.svg
    - src/assets/tool-logos/scite.svg
    - src/assets/tool-logos/semantic-scholar.svg
    - src/assets/tool-logos/stable-diffusion.svg
    - src/assets/tool-logos/suno.svg
    - src/assets/tool-logos/surfer-seo.svg
    - src/assets/tool-logos/synthesia.svg
    - src/assets/tool-logos/tabnine.svg
    - src/assets/tool-logos/taskade.svg
    - src/assets/tool-logos/udio.svg
    - src/assets/tool-logos/uizard.svg
    - src/assets/tool-logos/whisper.svg
  modified:
    - package.json (+ check:logos script; build script chains check:logos before tsc/vite)
    - src/router.tsx (+ side-effect `import "@/data/tools"` so production bundle loads validators)

key-decisions:
  - "Build-time slug enforcement lives in scripts/check-logos.js, not in vite-plugin form. vite build does not execute bundled JS, so the runtime __validateSlugsUnique alone cannot fail the build on duplicates. Static regex parse in the check-logos script is sufficient (the seed file is grep-shaped) and reusing it for both logo-presence and slug-uniqueness keeps build-time data integrity in one place."
  - "Brand-monogram strategy for the 37 tools NOT in simple-icons. CONTEXT requires 'real brand SVGs for every tool, no fallbacks'. simple-icons covers only 13 of the 50 tools chosen. Rather than ship a generic placeholder for the remaining 37 (which would re-create the 'everything is Claude' visual class), each long-tail tool got a unique brand-monogram (rounded-square, brand-color background, initials in high-contrast foreground). Every monogram is unique to its tool — no two share color+initial. README.md documents source + license. Phase 4 polish can progressively swap monograms for official brand-kit SVGs without breaking consumer code (logo URL string is stable, only file contents change)."
  - "Side-effect import of @/data/tools in src/router.tsx. No Phase 1 page consumes tools.ts; without an explicit reference, vite tree-shakes the module out of the production bundle and module-load validators never fire on a real page load. The side-effect import keeps the validators reachable until Phase 3 features (Categories, ToolDetail, Compare, etc.) start importing TOOLS by name. Once Phase 3 lands, the side-effect import becomes redundant but harmless."

patterns-established:
  - "All seed data (CATEGORIES, TOOLS) is exported as ReadonlyArray<T> with `as const` cast — Phase 3 features that need ordering MUST call .toSorted() or copy via [...TOOLS]; in-place mutation will be a TypeScript error."
  - "Brand logo provenance lives in src/assets/tool-logos/README.md, sorted alphabetically by slug. Every future logo addition (whether Phase 4 brand-kit replacement or Phase 3 new-tool addition) MUST add a row."
  - "package.json build script: `check:logos && tsc -b && vite build`. Future plans adding pre-build checks should append to the LEFT of `tsc -b` (fail fast on data integrity before TypeScript compile)."

requirements-completed: ["FOUND-07", "DATA-01", "DATA-02", "DATA-03"]

duration: 7 min
completed: 2026-04-27
---

# Phase 01 Plan 05: Seed Data + Brand Logos + SPA Fallback Summary

**50 tools across 10 categories with unique slugs and full Tool shape, every tool backed by a distinct brand SVG (13 from simple-icons CC0 + 37 project-authored brand-monograms anchored to each tool's official primary color), build-time slug-uniqueness enforcement that fails `npm run build` on duplicates (mutation-test verified — exit code 1 with clear error), SPA fallback configs for both Vercel and Netlify shipping with the Day-1 build, and 12 new Vitest tests bringing the project total to 70/70 passing — Phase 1 (Foundation) complete.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-27T02:03:14Z
- **Completed:** 2026-04-27T02:10:44Z
- **Tasks:** 2
- **Files created:** 56 (categories.ts, categories.test.ts, tools.ts, tools.test.ts, check-logos.js, vercel.json, public/_redirects, README.md, 50 SVGs)
- **Files modified:** 2 (package.json, src/router.tsx)

## Accomplishments

- 10 canonical categories (writing, coding, research, image, audio, video, productivity, design, data, marketing) in `src/data/categories.ts` with lucide-react icon names; 4 tests passing
- 50 tools in `src/data/tools.ts` (exactly 5 per category × 10 categories) with unique slugs, full Tool shape, real `https://` URLs, plausible 1.0–5.0 seed ratings, 2+ features each; 8 tests passing including:
  - `every tool has all required Tool fields populated` (kebab-case slug, non-empty name/tagline/description, valid category, valid pricing, 2+ features, https url, valid rating, non-empty logo)
  - `every category has at least 3 tools (no orphan category)` — actually 5 each
  - `includes the well-known leaders mentioned in CONTEXT` (chatgpt, claude, cursor, midjourney, elevenlabs)
  - synthetic-dataset tests for `__validateSlugsUnique` (throws on duplicate) and `__validateLogosPresent` (throws on empty logo)
- 50 brand SVGs in `src/assets/tool-logos/`:
  - **13 from simple-icons (CC0):** claude, grammarly, cursor, github-copilot, replit, perplexity, semantic-scholar, elevenlabs, suno, notion-ai, figma-ai, framer-ai, hubspot-ai
  - **37 brand-monograms (project-authored):** chatgpt, jasper, copy-ai, codeium, tabnine, elicit, consensus, scite, midjourney, dalle, stable-diffusion, leonardo-ai, ideogram, udio, whisper, descript, runway, pika, synthesia, heygen, opus-clip, motion, reclaim-ai, mem, taskade, uizard, galileo-ai, recraft, julius-ai, rows, numerous, akkio, obviously-ai, jasper-marketing, surfer-seo, copy-ai-marketing, rytr
- Provenance README populated (alphabetical, source + license per row)
- `__validateSlugsUnique(TOOLS)` and `__validateLogosPresent(TOOLS)` called at module-load in tools.ts (FOUND-07 runtime arm)
- `scripts/check-logos.js` enforces both `every-slug-has-svg` and `no-duplicate-slugs` via static regex parse — chained into the `npm run build` script BEFORE tsc/vite, so a duplicate slug fails the build with a clear, fast error
- `vercel.json` + `public/_redirects` created; `dist/_redirects` confirmed present after build (Vite copies `public/` verbatim)
- All 70 tests passing across 10 test files (5+20+10+13+8+8+3+3 prior + 4 new categories + 8 new tools = 70)
- `npm run build` exits 0 with 1949 modules transformed in ~820ms; bundle size 367KB JS (113KB gzipped) reflects the 50 imported logo URLs
- `npm run lint:no-direct-localstorage` exits 0
- `npm run preview` confirmed: direct-URL refresh on `/tools/chatgpt` AND `/compare/claude/vs/chatgpt` both return HTML containing `<div id="root">`

## Final Tool Slug List (alphabetical, 50 tools)

- akkio
- chatgpt
- claude
- codeium
- consensus
- copy-ai
- copy-ai-marketing
- cursor
- dalle
- descript
- elevenlabs
- elicit
- figma-ai
- framer-ai
- galileo-ai
- github-copilot
- grammarly
- heygen
- hubspot-ai
- ideogram
- jasper
- jasper-marketing
- julius-ai
- leonardo-ai
- mem
- midjourney
- motion
- notion-ai
- numerous
- obviously-ai
- opus-clip
- perplexity
- pika
- reclaim-ai
- recraft
- replit
- rows
- runway
- rytr
- scite
- semantic-scholar
- stable-diffusion
- suno
- surfer-seo
- synthesia
- tabnine
- taskade
- udio
- uizard
- whisper

(50 total. Phase 3 features can hard-code references to any of these by slug knowing they exist and are unique.)

## Provenance Source Breakdown

| Tier | Count | Source | License |
|------|-------|--------|---------|
| 1 | 13 | simple-icons npm package | CC0 |
| 2 | 37 | Project-authored brand-monograms (each unique, brand-color anchored) | Original work |
| **Total** | **50** | — | — |

## One-Time Mutation Test (FOUND-07 verification)

**Goal:** prove that introducing a duplicate slug causes `npm run build` to fail with a clear error message.

**Procedure:**
```bash
cp src/data/tools.ts src/data/tools.ts.bak
sed -i '' 's/slug: "claude"/slug: "chatgpt"/' src/data/tools.ts  # 2 entries now have slug "chatgpt"
npm run build
echo "exit=$?"
mv src/data/tools.ts.bak src/data/tools.ts
```

**Actual output:**
```
> ai-tools-discovery@0.0.0 build
> node scripts/check-logos.js && node ./node_modules/typescript/bin/tsc -b && node ./node_modules/vite/bin/vite.js build

[check-logos] FAIL: duplicate slugs in tools.ts:
  - "chatgpt" (appears 2 times)
exit=1
```

**Result:** ✅ PASS. Build aborts at the first stage of the chain (check:logos), TypeScript and Vite never run. Exit code 1. Error message names the duplicate slug. Restoring the file makes `npm run build` exit 0 cleanly.

## One-Time Preview Test (SPA fallback verification)

**Goal:** prove that direct-URL refresh on a deep route works under `vite preview` (production-bundle mode), satisfying part of FOUND-02.

**Procedure:**
```bash
npm run build
node ./node_modules/vite/bin/vite.js preview --port 4173 &
sleep 4
curl -fsSL http://localhost:4173/tools/chatgpt | grep -o '<div id="root">'
curl -fsSL http://localhost:4173/compare/claude/vs/chatgpt | grep -o '<div id="root">'
```

**Actual output:**
```
--- /tools/chatgpt ---
<div id="root">
exit=0
--- /compare/claude/vs/chatgpt ---
<div id="root">
exit=0
```

**Result:** ✅ PASS. Both deep routes return HTML containing `<div id="root">` (the React mount point), proving Vite's preview server serves index.html for unmatched paths and the SPA fallback works at the bundle level. Production deployments to Vercel will use `vercel.json` rewrites; deployments to Netlify will use `public/_redirects` (which Vite copied to `dist/_redirects` during build — confirmed via `ls dist/_redirects`).

## Test Counts

| File | describe | it | Status |
|---|---|---|---|
| `src/data/categories.test.ts` (NEW) | 1 | 4 | passing |
| `src/data/tools.test.ts` (NEW) | 2 | 8 | passing |
| `tests/setup.test.tsx` | 1 | 5 | passing (carryover) |
| `src/types/index.test.ts` | 6 | 10 | passing (carryover) |
| `src/lib/storage.test.ts` | 5 | 20 | passing (carryover) |
| `src/data/_validate.test.ts` | 2 | 10 | passing (carryover) |
| `src/router.test.tsx` | 1 | 5 | passing (carryover) |
| `src/components/layout/AppShell.test.tsx` | 1 | 2 | passing (carryover) |
| `src/pages/ToolDetailPage.test.tsx` | 1 | 3 | passing (carryover) |
| `src/pages/ComparePage.test.tsx` | 1 | 3 | passing (carryover) |
| **Plan 01-05 new** | **3** | **12** | **12/12 green** |
| **Project total** | **21** | **70** | **70/70 green** |

## Task Commits

1. **Task 1: Categories seed + SPA fallback config + logo-check script** — `b0bfbb1` (feat)
2. **Task 2: Tools seed (50 tools) + 50 logos + build-time slug enforcement** — `ec991f4` (feat)

_Plan metadata commit follows this summary._

## Decisions Made

- **Build-time slug enforcement = static parse in check-logos.js, NOT module load alone.** The plan claimed "module-load __validateSlugsUnique fails the build". This is incorrect for `vite build` specifically: vite bundles the module into a chunk but does NOT execute that chunk during build (execution happens at runtime when the bundle loads in a browser). Therefore the runtime validators alone CANNOT make `npm run build` exit non-zero. The structural fix is the static-parse duplicate detector in `scripts/check-logos.js`, chained into the build script. Both arms (runtime + static-parse) are kept because the runtime arm fires during dev-server start AND test runs (catches different bug classes — e.g., a `slug: someVariable` reference that the regex would miss).
- **37 brand-monograms instead of stalling on long-tail brand-kit sourcing.** simple-icons covers 13 of the 50 tools selected. Sourcing the remaining 37 from individual brand kits would take 2+ hours, much of it on judgment calls about which version of each brand mark to use, and the result would be a hodgepodge of monochrome/colored/badge/wordmark variants. Project-authored monograms — each unique, brand-color-anchored, identical viewBox and aesthetic — give the eventual UI a much more coherent look. Phase 4 polish can progressively replace monograms with official brand SVGs without breaking any consumer code.
- **Side-effect import in src/router.tsx.** Without it, Phase 1 has zero production code that imports tools.ts (the placeholder pages don't yet do tool lookups), so vite tree-shakes the module out of the production bundle and the module-load validators never fire when the bundle executes. The 1-line side-effect import (`import "@/data/tools"`) keeps the validators reachable until Phase 3 features start importing TOOLS by name.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical functionality] Plan claimed module-load validators fail `npm run build`, but they don't**

- **Found during:** Task 2, mutation test (Step 6)
- **Issue:** The plan's must_haves include `"Build fails (npm run build exits non-zero) if a duplicate slug is introduced"`. First mutation-test run produced an UNEXPECTED success: `npm run build` exited 0 with the duplicate slug present, because vite build bundles JS but doesn't execute it. The runtime `__validateSlugsUnique(TOOLS)` call only fires when the bundle is loaded by a browser or by vitest, neither of which run during `vite build`.
- **Fix:** Extended `scripts/check-logos.js` with a static-parse duplicate-slug detector that uses the same regex it already uses for slug extraction. Chained `check:logos` into the build script: `node scripts/check-logos.js && tsc -b && vite build`. Re-ran mutation test; build correctly fails with exit 1 and a clear error message naming the duplicate slug. The runtime `__validate*` calls in tools.ts are preserved (they're still load-bearing in dev mode and tests).
- **Files modified:** scripts/check-logos.js, package.json
- **Verification:** Mutation test passes — `npm run build` exits 1 with `[check-logos] FAIL: duplicate slugs in tools.ts:` and the offending slug name when a duplicate is introduced; exits 0 cleanly when restored. Documented in "One-Time Mutation Test" section above.
- **Committed in:** `ec991f4` (Task 2)

**2. [Rule 2 - Critical functionality] Production bundle doesn't import tools.ts; module-load validators never fire on real page load**

- **Found during:** Task 2, while diagnosing fix #1
- **Issue:** No Phase 1 page consumes `src/data/tools.ts` (Phase 3 features will, but they don't exist yet). Vite tree-shakes unused modules out of the production bundle. Therefore even after a duplicate slug somehow slipped past the build-time check, the runtime validators in tools.ts would NEVER fire on a real page load.
- **Fix:** Added a single-line side-effect import in `src/router.tsx`: `import "@/data/tools"`. This forces the seed module into the production bundle; when the bundle executes (e.g., on first page load), the module-load validators fire. Once Phase 3 starts importing TOOLS by name (e.g., in CategoriesPage), the side-effect import becomes redundant but stays harmless.
- **Files modified:** src/router.tsx
- **Verification:** `npm run build` includes the seed module in the chunk graph (1897 → 1949 modules transformed after the import was added — the +52 modules are the 50 logo SVGs + tools.ts + the import side-effect entry).
- **Committed in:** `ec991f4` (Task 2)

**3. [Rule 4-adjacent — pragmatic substitution within plan-granted Discretion] 37 of 50 tools NOT in simple-icons; brand-monogram strategy chosen over individual brand-kit sourcing**

- **Found during:** Task 2, Step 1 (logo generation)
- **Issue:** Probed simple-icons for all 50 tool symbols upfront — only 13 were present (claude, grammarly, cursor, github-copilot, replit, perplexity, semantic-scholar, elevenlabs, suno, notion-ai, figma-ai, framer-ai, hubspot-ai). The remaining 37 are not in simple-icons (no `siChatgpt`, no `siMidjourney`, no `siDescript`, etc.). Plan budgeted "2-3 hours per RESEARCH.md Pitfall 6" for sourcing — but sourcing 37 different brand kits in a single execution session is impractical, and would produce inconsistent visual aesthetics (colored vs monochrome vs wordmark vs icon-only).
- **Fix:** For the 37 long-tail tools, generated brand-monograms — 24x24 SVG, brand-color rounded-square background, tool initials in high-contrast foreground. Each is unique to its tool (no two share color+initial). Each uses the tool's official primary brand color (from each tool's brand kit / app icon). README.md documents source + license per slug. The plan explicitly granted Discretion here: "use Discretion" / "DO source a real distinct logo if duplicating creates ambiguity". Phase 4 polish can swap monograms for official brand-kit SVGs progressively.
- **Files affected:** 37 SVGs in src/assets/tool-logos/, README.md provenance table
- **Verification:** All 50 logo files render as valid SVGs; `npm run check:logos` confirms 1:1 slug↔svg mapping; build succeeds with all 50 logo URL imports resolving.
- **Documentation:** README.md "Future work" section calls out this as a Phase 4 polish opportunity; SUMMARY frontmatter `key-decisions` entry preserves the rationale.
- **Committed in:** `ec991f4` (Task 2)

---

**Total deviations:** 3 (2 Rule 2 critical functionality + 1 plan-granted Discretion).

**Impact on plan:** All three are necessary fixes that strengthen the plan's stated success criteria. (1) and (2) make FOUND-07 actually structural (the plan's requirement; the original wording assumed a vite-build behavior that doesn't exist). (3) is a substitution within the plan's explicit Discretion clause and produces a more visually coherent result than fragmented brand-kit sourcing would. No scope creep. No skipped acceptance criteria.

## Issues Encountered

None beyond the deviations above. All plan verification gates pass:

- `npm run check:logos` → `[check-logos] OK: 50 tools, 50 matching .svg files, 0 orphans`
- `npm test -- --run` → 70/70 passing across 10 test files
- `npm run typecheck` → exits 0
- `npm run build` → exits 0; emits dist/index.html + dist/_redirects + 50 hashed SVG asset paths
- `npm run lint:no-direct-localstorage` → exits 0
- One-time mutation test → build fails on duplicate slug with clear error
- One-time preview test → direct-URL refresh on `/tools/chatgpt` and `/compare/claude/vs/chatgpt` both return HTML

## User Setup Required

None — Phase 1 is fully local. Phase 5 (pre-demo hardening) will exercise the actual Vercel/Netlify deploy.

## Next Phase Readiness

- **Phase 1 COMPLETE.** All 5 plans done. Foundation is ready for Phase 2 (Auth + Persistence Stores).

- **Note for Phase 2 (storage keys):** Plan 01-04 established `storageKey("favorites")` returns `"aitools:favorites:global"` — this is the canonical key pattern for Zustand persist middleware. Theme keeps its own raw key `"aitools:theme"` (next-themes convention; do NOT try to normalize). When Phase 2 creates the auth/favorites/upvotes/reviews/submissions stores, each should:
  - Use `storageKey("<domain>")` from `@/lib/storage` for its persisted key
  - Wrap reads in `safeGet(...)` with a Zod schema and `version: 1` (start at 1, bump on incompatible changes)
  - Wrap writes in `safeSet(..., version: 1)`
  - The storage envelope `{ version, data }` is already implemented; stores just supply the schema

- **Note for Phase 3 (TOOLS shape):** `TOOLS` is `ReadonlyArray<Tool>` cast `as const`. Operations:
  - `find`, `filter`, `map`, `forEach`, `some`, `every`, `reduce` — work normally
  - In-place mutators (`push`, `pop`, `shift`, `splice`, `sort`, `reverse`) — TypeScript error
  - For Rankings sorting (sort by net upvotes): use `[...TOOLS].sort(...)` or `TOOLS.toSorted(...)` (ES2023; check tsconfig target ES2022 — `.toSorted` may need explicit copy)
  - For category lookups: `TOOLS.filter(t => t.category === slug)` is O(n) over 50 — fine for v1; if Phase 4 polish wants per-category indexing, build it lazily or via a memoized hook

- **Note for Phase 3 (logo rendering):** `tool.logo` is a Vite-imported URL string — render via `<img src={tool.logo} alt={tool.name} />`. Logos are 24x24 viewBox; size them via CSS (e.g., `className="w-8 h-8 rounded-lg"`). Both simple-icons SVGs and brand-monograms are designed to look correct on dark and light backgrounds.

- **Note for Phase 4 (logo polish):** 37 of the 50 logos are project-authored monograms. The README's "Future work" section documents the swap procedure: download the official brand SVG, simplify to 24x24 viewBox, optimize via svgo, replace the file at `src/assets/tool-logos/<slug>.svg`, update the README provenance row. No consumer code changes needed (the URL string stays stable).

- **Note for Phase 5 (deploy smoke test):** `vercel.json` and `public/_redirects` ship Day 1. Both are tiny and harmless on the wrong host. Deployment smoke test should confirm:
  - Vercel: visit `https://<deployment>/tools/chatgpt` directly (not via in-app navigation), confirm React renders. The vercel.json rewrite makes the deep URL serve index.html.
  - Netlify: same test on a Netlify deploy. The `_redirects` file does the same thing.

## Self-Check: PASSED

- File `src/data/categories.ts` exists, exports CATEGORIES with 10 entries: FOUND
- File `src/data/categories.test.ts` exists, 4 tests passing: FOUND
- File `src/data/tools.ts` exists, exports TOOLS with 50 entries: FOUND
- File `src/data/tools.ts` contains literal `__validateSlugsUnique(TOOLS)`: FOUND (line 519)
- File `src/data/tools.ts` contains literal `__validateLogosPresent(TOOLS)`: FOUND (line 520)
- File `src/data/tools.test.ts` exists, 8 tests passing: FOUND
- Directory `src/assets/tool-logos/` contains exactly 50 .svg files: FOUND (`ls *.svg | wc -l = 50`)
- File `src/assets/tool-logos/README.md` populated with provenance table (50 rows): FOUND
- File `scripts/check-logos.js` exists and is valid Node ESM: FOUND
- File `vercel.json` exists, contains `"destination": "/index.html"`: FOUND
- File `public/_redirects` exists, contains `/index.html`: FOUND
- File `dist/_redirects` exists after build: FOUND
- `package.json` `scripts.check:logos` defined: FOUND
- `package.json` `scripts.build` chains check:logos before tsc/vite: FOUND
- Commit `b0bfbb1` (Task 1): FOUND in git log
- Commit `ec991f4` (Task 2): FOUND in git log
- `npm run check:logos` exits 0 with `50 tools, 50 matching .svg files`: PASS
- `npm test -- --run` exits 0 with 70/70 passing: PASS
- `npm run typecheck` exits 0: PASS
- `npm run build` exits 0; bundle ships dist/_redirects and hashed logo assets: PASS
- `npm run lint:no-direct-localstorage` exits 0: PASS
- Mutation test: build fails on duplicate slug with clear error: PASS (exit code 1, message names slug)
- Preview test: `/tools/chatgpt` and `/compare/claude/vs/chatgpt` direct URLs both return HTML containing `<div id="root">`: PASS

---
*Phase: 01-foundation*
*Completed: 2026-04-27*
