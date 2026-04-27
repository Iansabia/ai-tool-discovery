// src/data/categories.ts
// Phase 1 / Plan 01-05 — the 10 canonical categories. CategorySlug is the primary key
// (CategorySlug union enforces exhaustiveness in switch statements throughout the app).
import type { Category } from "@/types"

export const CATEGORIES: ReadonlyArray<Category> = [
  {
    slug: "writing",
    name: "Writing",
    description: "AI assistants for drafting, editing, and rewriting prose, copy, and content.",
    icon: "PenLine",
  },
  {
    slug: "coding",
    name: "Coding",
    description: "AI pair-programmers and code generation tools for developers.",
    icon: "Code",
  },
  {
    slug: "research",
    name: "Research",
    description: "Tools that summarize, search, and synthesize knowledge from large corpora.",
    icon: "Search",
  },
  {
    slug: "image",
    name: "Image",
    description: "AI image generation, editing, upscaling, and stock-image alternatives.",
    icon: "Image",
  },
  {
    slug: "audio",
    name: "Audio",
    description: "Voice synthesis, transcription, music generation, and audio editing.",
    icon: "Mic",
  },
  {
    slug: "video",
    name: "Video",
    description: "AI video generation, editing, captioning, and post-production.",
    icon: "Video",
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "Task assistants, scheduling, note-taking, and workflow automation.",
    icon: "Sparkles",
  },
  {
    slug: "design",
    name: "Design",
    description: "AI-augmented UI design, branding, and visual asset creation.",
    icon: "Palette",
  },
  {
    slug: "data",
    name: "Data & Analytics",
    description: "AI-powered analytics, data exploration, and visualization tools.",
    icon: "BarChart3",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "AI tools for SEO, ad copy, social posts, and campaign analysis.",
    icon: "Megaphone",
  },
] as const
