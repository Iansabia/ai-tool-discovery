---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 1.x (Vite-native test runner) |
| **Config file** | `vitest.config.ts` (Wave 0 installs) |
| **Quick run command** | `npm test -- --run` (single pass, no watch) |
| **Full suite command** | `npm run typecheck && npm test -- --run && npm run build` |
| **Estimated runtime** | ~30 seconds (typecheck ~5s, vitest ~10s, build ~15s) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run` (filtered to relevant suite where possible)
- **After every plan wave:** Run `npm run typecheck && npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green (typecheck + tests + production build)
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | INFRA | unit infra | `npm test -- --run tests/setup.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | FOUND-01 | smoke | `npm run dev -- --port 5173 & sleep 3 && curl -f http://localhost:5173 && kill %1` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | FOUND-01 | build | `npm run build && test -f dist/index.html` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | FOUND-04 | unit | `npm test -- --run src/types/index.test.ts` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 2 | FOUND-05, UX-07 | unit | `npm test -- --run src/lib/storage.test.ts` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 2 | FOUND-07 | unit | `npm test -- --run src/data/_validate.test.ts` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 3 | FOUND-02 | unit | `npm test -- --run src/router.test.tsx` | ❌ W0 | ⬜ pending |
| 1-04-02 | 04 | 3 | FOUND-02 | unit | `grep -E "/tools/:slug\|/compare/:a/vs/:b" src/router.tsx` | ❌ W0 | ⬜ pending |
| 1-04-03 | 04 | 3 | FOUND-03, UX-03 | unit | `npm test -- --run src/components/AppShell.test.tsx` | ❌ W0 | ⬜ pending |
| 1-04-04 | 04 | 3 | FOUND-06, UX-03 | grep | `grep -q "@theme inline" src/globals.css && grep -q ".dark {" src/globals.css` | ❌ W0 | ⬜ pending |
| 1-04-05 | 04 | 3 | UX-03 | grep | `grep -q "applyTheme" index.html` | ❌ W0 | ⬜ pending |
| 1-04-06 | 04 | 3 | UX-08 | unit | `npm test -- --run src/lib/storage.event.test.ts` | ❌ W0 | ⬜ pending |
| 1-05-01 | 05 | 4 | DATA-02 | unit | `npm test -- --run src/data/categories.test.ts` | ❌ W0 | ⬜ pending |
| 1-05-02 | 05 | 4 | DATA-01 | unit | `npm test -- --run src/data/tools.test.ts` (count >= 50, all unique slugs) | ❌ W0 | ⬜ pending |
| 1-05-03 | 05 | 4 | DATA-03 | grep | `node scripts/check-logos.js` (every tool slug has matching .svg) | ❌ W0 | ⬜ pending |
| 1-05-04 | 05 | 4 | FOUND-07 | build | `npm run build` (fails on duplicate slug or missing logo) | ❌ W0 | ⬜ pending |
| 1-05-05 | 05 | 4 | INFRA | smoke | `test -f vercel.json && test -f public/_redirects` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest config with jsdom env, path alias, setup file
- [ ] `tests/setup.ts` — vitest setup (mock localStorage, jsdom global setup)
- [ ] `package.json` — install vitest@1, @testing-library/react@16, @testing-library/jest-dom@6, jsdom@25, @vitest/coverage-v8@1
- [ ] `package.json` scripts — `test`, `typecheck` (`tsc --noEmit`), `lint:no-direct-localstorage` (grep wrapper)
- [ ] `tests/setup.test.ts` — sanity test that imports `@testing-library/react` and asserts `document` is defined

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| FOUC prevention on first paint | UX-03 | Visual check — no flash of light theme when system is dark | Open `vite preview` in a browser with system dark mode, hard refresh, watch for flash |
| Brand colors match Figma | FOUND-06 | Visual check — token hex values match design intent | Open AppShell in browser, eyedrop primary/accent, compare to `#10B981` and `#F97316` |
| Direct URL refresh works on deployed Vercel/Netlify | FOUND-02, UX-08 | Requires real deploy (not local) | Deploy to Vercel preview, visit `/tools/example-slug` directly, refresh — should not 404 |
| Multi-tab sync (storage event) | UX-08 | Requires two browser tabs | Open `vite preview` in two tabs, dispatch a `safeSet` from devtools in tab A, verify subscriber fires in tab B |
| Logos render at expected size | DATA-03 | Visual check — SVGs scale correctly | Render every logo in a contact-sheet test page, eyeball for clipping/distortion |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags (always `--run`)
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
