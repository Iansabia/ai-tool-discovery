// scripts/check-logos.js
// Phase 1 / Plan 01-05 — sanity that every slug in src/data/tools.ts has a real SVG file
// in src/assets/tool-logos/. Catches the "import points at a non-existent file" failure
// mode BEFORE vite build runs (which produces confusing module-not-found errors).
//
// Run via: `npm run check:logos` (added to package.json in this task).

import { readFileSync, existsSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")
const toolsTsPath = join(repoRoot, "src", "data", "tools.ts")
const logoDirPath = join(repoRoot, "src", "assets", "tool-logos")

if (!existsSync(toolsTsPath)) {
  console.error(`[check-logos] FAIL: ${toolsTsPath} not found`)
  process.exit(1)
}

const source = readFileSync(toolsTsPath, "utf-8")
// Match: slug: "the-slug" — extracts every slug literal in the file.
// This is intentionally simple — for richer parsing we'd need a TS AST. The seed file is
// small and grep-shaped, so a regex is sufficient.
const slugRegex = /slug:\s*"([a-z0-9-]+)"/g
const slugs = new Set()
let match
while ((match = slugRegex.exec(source)) !== null) {
  slugs.add(match[1])
}

if (slugs.size === 0) {
  console.error("[check-logos] FAIL: no slugs found in tools.ts")
  process.exit(1)
}

const logoFiles = new Set(
  existsSync(logoDirPath)
    ? readdirSync(logoDirPath).filter((f) => f.endsWith(".svg"))
    : [],
)

const missing = []
for (const slug of slugs) {
  if (!logoFiles.has(`${slug}.svg`)) {
    missing.push(slug)
  }
}

const orphaned = []
for (const file of logoFiles) {
  const slug = file.replace(/\.svg$/, "")
  if (!slugs.has(slug) && slug !== "README") {
    orphaned.push(file)
  }
}

if (missing.length > 0) {
  console.error("[check-logos] FAIL: tools without matching .svg files:")
  for (const s of missing) console.error(`  - ${s} (expected ${logoDirPath}/${s}.svg)`)
}
if (orphaned.length > 0) {
  console.warn("[check-logos] WARN: orphaned .svg files (no tool references them):")
  for (const f of orphaned) console.warn(`  - ${f}`)
}

if (missing.length > 0) {
  process.exit(1)
}

console.log(`[check-logos] OK: ${slugs.size} tools, ${slugs.size} matching .svg files, ${orphaned.length} orphans (warn-only)`)
