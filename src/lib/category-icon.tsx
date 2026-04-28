// src/lib/category-icon.tsx
// Phase 4 / polish — resolves a category slug to its lucide icon component.
// Categories declare a string `icon` field (e.g. "PenLine"); this module is
// the single source for converting that string into a JSX element.

import {
  PenLine,
  Code,
  Search,
  Image as ImageIcon,
  Mic,
  Video,
  Sparkles,
  Palette,
  BarChart3,
  Megaphone,
  type LucideIcon,
} from "lucide-react"
import type { CategorySlug } from "@/types"

const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  writing: PenLine,
  coding: Code,
  research: Search,
  image: ImageIcon,
  audio: Mic,
  video: Video,
  productivity: Sparkles,
  design: Palette,
  data: BarChart3,
  marketing: Megaphone,
}

export function getCategoryIcon(slug: CategorySlug): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Sparkles
}

interface Props {
  slug: CategorySlug
  className?: string
  size?: number
}

export function CategoryIcon({ slug, className, size }: Props) {
  const Icon = getCategoryIcon(slug)
  return <Icon className={className} size={size} aria-hidden="true" />
}
