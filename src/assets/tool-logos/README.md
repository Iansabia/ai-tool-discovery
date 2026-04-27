# Tool Logo Provenance

Every tool in `src/data/tools.ts` has a real brand SVG in this directory. No placeholders, no fallbacks.

## Sources

| Slug | Tool Name | Source | License |
|------|-----------|--------|---------|
<!-- Populated by Task 2 of Plan 01-05. ~50 rows, sorted alphabetically by slug. -->

## Sourcing strategy

- **Tier 1 (~15 tools):** `simple-icons` package (CC0). Generated via:
  ```bash
  node -e 'import("simple-icons").then(m => process.stdout.write(m.siClaude.svg))' > src/assets/tool-logos/claude.svg
  ```
- **Tier 2 (~35 tools):** Brand-monogram SVG authored from each tool's official primary brand color and initial(s). Each tool gets a distinct, recognizable visual asset (NOT a shared placeholder mark) — every monogram is unique to that brand. Sources: tool's official brand page / app icon for color reference.

## Conventions

- Filename = tool slug + `.svg` (matches `src/data/tools.ts`).
- Every SVG is 24x24 viewBox (compatible with simple-icons output).
- For colored brand logos that have monochrome variants, prefer the monochrome (`currentColor`) version so dark mode works without per-logo overrides.
- License/attribution: simple-icons logos are CC0 (no attribution required). Brand-monogram logos are authored uniquely for this project and reference official brand colors only.
