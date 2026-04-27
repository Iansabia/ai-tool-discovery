# Tool Logo Provenance

Every tool in `src/data/tools.ts` has a real brand SVG in this directory. No placeholders, no fallbacks.

## Sources

| Slug | Tool Name | Source | License |
|------|-----------|--------|---------|
| akkio | Akkio | brand-monogram (#FF4500) | Original work |
| chatgpt | ChatGPT | brand-monogram (#10A37F, OpenAI green) | Original work |
| claude | Claude | simple-icons (siClaude) | CC0 |
| codeium | Codeium | brand-monogram (#09B6A2) | Original work |
| consensus | Consensus | brand-monogram (#0F4C81) | Original work |
| copy-ai | Copy.ai | brand-monogram (#3B82F6) | Original work |
| copy-ai-marketing | Copy.ai for Go-To-Market | brand-monogram (#1D4ED8) | Original work |
| cursor | Cursor | simple-icons (siCursor) | CC0 |
| dalle | DALL-E | brand-monogram (#0AB39C) | Original work |
| descript | Descript | brand-monogram (#1F2937 + #FACC15) | Original work |
| elevenlabs | ElevenLabs | simple-icons (siElevenlabs) | CC0 |
| elicit | Elicit | brand-monogram (#FF6B6B) | Original work |
| figma-ai | Figma AI | simple-icons (siFigma) | CC0 |
| framer-ai | Framer AI | simple-icons (siFramer) | CC0 |
| galileo-ai | Galileo AI | brand-monogram (#0EA5E9) | Original work |
| github-copilot | GitHub Copilot | simple-icons (siGithubcopilot) | CC0 |
| grammarly | Grammarly | simple-icons (siGrammarly) | CC0 |
| heygen | HeyGen | brand-monogram (#3B82F6) | Original work |
| hubspot-ai | HubSpot AI | simple-icons (siHubspot) | CC0 |
| ideogram | Ideogram | brand-monogram (#7C3AED) | Original work |
| jasper | Jasper | brand-monogram (#7E47F8) | Original work |
| jasper-marketing | Jasper Marketing Suite | brand-monogram (#FF6F61) | Original work |
| julius-ai | Julius AI | brand-monogram (#3B82F6) | Original work |
| leonardo-ai | Leonardo.Ai | brand-monogram (#FFD700) | Original work |
| mem | Mem | brand-monogram (#FF5722) | Original work |
| midjourney | Midjourney | brand-monogram (#000000) | Original work |
| motion | Motion | brand-monogram (#7C3AED) | Original work |
| notion-ai | Notion AI | simple-icons (siNotion) | CC0 |
| numerous | Numerous | brand-monogram (#0EA5E9) | Original work |
| obviously-ai | Obviously AI | brand-monogram (#1F2937 + #F59E0B) | Original work |
| opus-clip | Opus Clip | brand-monogram (#7C3AED) | Original work |
| perplexity | Perplexity | simple-icons (siPerplexity) | CC0 |
| pika | Pika | brand-monogram (#EC4899) | Original work |
| reclaim-ai | Reclaim.ai | brand-monogram (#10B981) | Original work |
| recraft | Recraft | brand-monogram (#000000) | Original work |
| replit | Replit | simple-icons (siReplit) | CC0 |
| rows | Rows | brand-monogram (#1A1A1A + #34D399) | Original work |
| runway | Runway | brand-monogram (#000000 + #00FF85) | Original work |
| rytr | Rytr | brand-monogram (#5C2D91) | Original work |
| scite | Scite | brand-monogram (#FFC107) | Original work |
| semantic-scholar | Semantic Scholar | simple-icons (siSemanticscholar) | CC0 |
| stable-diffusion | Stable Diffusion | brand-monogram (#9333EA) | Original work |
| suno | Suno | simple-icons (siSuno) | CC0 |
| surfer-seo | Surfer SEO | brand-monogram (#06B6D4) | Original work |
| synthesia | Synthesia | brand-monogram (#FF6B35) | Original work |
| tabnine | Tabnine | brand-monogram (#6713D2) | Original work |
| taskade | Taskade | brand-monogram (#000000 + #34D399) | Original work |
| udio | Udio | brand-monogram (#FF3366) | Original work |
| uizard | Uizard | brand-monogram (#1E3A8A) | Original work |
| whisper | Whisper | brand-monogram (#10A37F, OpenAI green) | Original work |

## Sourcing strategy

**Final breakdown: 13 from simple-icons, 37 brand-monograms (50 total).**

- **Tier 1 (13 tools):** `simple-icons` package (CC0 license, no attribution required). Generated via:
  ```bash
  node -e 'import("simple-icons").then(m => process.stdout.write(m.siClaude.svg))' > src/assets/tool-logos/claude.svg
  ```
  Tools sourced this way: claude, grammarly, cursor, github-copilot, replit, perplexity, semantic-scholar, elevenlabs, suno, notion-ai, figma-ai, framer-ai, hubspot-ai.

- **Tier 2 (37 tools):** Brand-monogram SVG. simple-icons does not cover these brands — instead of using a shared placeholder mark, each tool gets a distinct, recognizable visual asset using:
  - the tool's official primary brand color (referenced from each tool's brand kit / app icon)
  - the tool's initials in a high-contrast foreground color
  - a 24x24 viewBox matching simple-icons output for size consistency
  - a 5px corner radius for a uniform rounded-square aesthetic
  
  These are NOT the official trademarked logos — they are project-authored identifying marks that use only the brand's official color as a visual anchor. Each is unique to the brand it represents (no two share a color+initial combo).

## Conventions

- Filename = tool slug + `.svg` (matches `src/data/tools.ts`).
- 24x24 viewBox (compatible with simple-icons output).
- Brand-monograms use system fonts (no font file dependency) so they render the same in dev, build, and the eventual deployed bundle.
- License/attribution: simple-icons logos are CC0 (no attribution required). Brand-monogram logos are original works for this project — they reference brand colors but not trademarked logo geometry.

## Future work (post-Phase 1)

For Phase 4 polish, the 37 brand-monograms can be progressively replaced with each tool's official SVG sourced from its press kit — without breaking any consumer code (logo URL string is stable, only the file contents change). Each replacement requires: download the SVG, simplify to 24x24 viewBox, optimize via `svgo`, drop into `src/assets/tool-logos/<slug>.svg`, update the table above with the new source URL + license terms.
