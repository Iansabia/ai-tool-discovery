// src/data/tools.ts
// Phase 1 / Plan 01-05 — the seed catalog. Every tool has a unique slug, real SVG logo,
// and full Tool shape. __validateSlugsUnique + __validateLogosPresent fire at module load
// (works in both `vite` and `vite build`), failing the build on data integrity violations.
import type { Tool } from "@/types"
import { __validateLogosPresent, __validateSlugsUnique } from "./_validate"

// Logo imports — each `?url` import resolves to a static asset string at build time.
// File presence is asserted by __validateLogosPresent at module load.
import chatgptLogo from "@/assets/tool-logos/chatgpt.svg"
import claudeLogo from "@/assets/tool-logos/claude.svg"
import jasperLogo from "@/assets/tool-logos/jasper.svg"
import copyAiLogo from "@/assets/tool-logos/copy-ai.svg"
import grammarlyLogo from "@/assets/tool-logos/grammarly.svg"
import cursorLogo from "@/assets/tool-logos/cursor.svg"
import githubCopilotLogo from "@/assets/tool-logos/github-copilot.svg"
import codeiumLogo from "@/assets/tool-logos/codeium.svg"
import tabnineLogo from "@/assets/tool-logos/tabnine.svg"
import replitLogo from "@/assets/tool-logos/replit.svg"
import perplexityLogo from "@/assets/tool-logos/perplexity.svg"
import elicitLogo from "@/assets/tool-logos/elicit.svg"
import consensusLogo from "@/assets/tool-logos/consensus.svg"
import semanticScholarLogo from "@/assets/tool-logos/semantic-scholar.svg"
import sciteLogo from "@/assets/tool-logos/scite.svg"
import midjourneyLogo from "@/assets/tool-logos/midjourney.svg"
import dalleLogo from "@/assets/tool-logos/dalle.svg"
import stableDiffusionLogo from "@/assets/tool-logos/stable-diffusion.svg"
import leonardoAiLogo from "@/assets/tool-logos/leonardo-ai.svg"
import ideogramLogo from "@/assets/tool-logos/ideogram.svg"
import elevenlabsLogo from "@/assets/tool-logos/elevenlabs.svg"
import sunoLogo from "@/assets/tool-logos/suno.svg"
import udioLogo from "@/assets/tool-logos/udio.svg"
import whisperLogo from "@/assets/tool-logos/whisper.svg"
import descriptLogo from "@/assets/tool-logos/descript.svg"
import runwayLogo from "@/assets/tool-logos/runway.svg"
import pikaLogo from "@/assets/tool-logos/pika.svg"
import synthesiaLogo from "@/assets/tool-logos/synthesia.svg"
import heygenLogo from "@/assets/tool-logos/heygen.svg"
import opusClipLogo from "@/assets/tool-logos/opus-clip.svg"
import notionAiLogo from "@/assets/tool-logos/notion-ai.svg"
import motionLogo from "@/assets/tool-logos/motion.svg"
import reclaimAiLogo from "@/assets/tool-logos/reclaim-ai.svg"
import memLogo from "@/assets/tool-logos/mem.svg"
import taskadeLogo from "@/assets/tool-logos/taskade.svg"
import figmaAiLogo from "@/assets/tool-logos/figma-ai.svg"
import framerAiLogo from "@/assets/tool-logos/framer-ai.svg"
import uizardLogo from "@/assets/tool-logos/uizard.svg"
import galileoAiLogo from "@/assets/tool-logos/galileo-ai.svg"
import recraftLogo from "@/assets/tool-logos/recraft.svg"
import juliusAiLogo from "@/assets/tool-logos/julius-ai.svg"
import rowsLogo from "@/assets/tool-logos/rows.svg"
import numerousLogo from "@/assets/tool-logos/numerous.svg"
import akkioLogo from "@/assets/tool-logos/akkio.svg"
import obviouslyAiLogo from "@/assets/tool-logos/obviously-ai.svg"
import jasperMarketingLogo from "@/assets/tool-logos/jasper-marketing.svg"
import hubspotAiLogo from "@/assets/tool-logos/hubspot-ai.svg"
import surferSeoLogo from "@/assets/tool-logos/surfer-seo.svg"
import copyAiMarketingLogo from "@/assets/tool-logos/copy-ai-marketing.svg"
import rytrLogo from "@/assets/tool-logos/rytr.svg"

export const TOOLS: ReadonlyArray<Tool> = [
  // -------- WRITING --------
  {
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "Conversational AI assistant from OpenAI.",
    description:
      "OpenAI's flagship chat product — long-form conversation, code generation, image input/output, and a deep ecosystem of integrations.",
    category: "writing",
    pricing: "Freemium",
    features: ["Long-form chat", "Code generation", "Image input", "Custom GPTs"],
    url: "https://chat.openai.com",
    rating: 4.7,
    logo: chatgptLogo,
  },
  {
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic's AI assistant focused on safety and long context.",
    description:
      "Claude excels at long-form writing, careful reasoning, and 200K-token context windows for analyzing big documents.",
    category: "writing",
    pricing: "Freemium",
    features: ["200K context window", "Artifact rendering", "Code execution"],
    url: "https://claude.ai",
    rating: 4.6,
    logo: claudeLogo,
  },
  {
    slug: "jasper",
    name: "Jasper",
    tagline: "AI marketing copywriter built for brand voice.",
    description:
      "Jasper specializes in brand-consistent marketing copy with templates for blogs, ads, and social posts.",
    category: "writing",
    pricing: "Paid",
    features: ["Brand voice templates", "SEO mode", "Team collaboration"],
    url: "https://jasper.ai",
    rating: 4.2,
    logo: jasperLogo,
  },
  {
    slug: "copy-ai",
    name: "Copy.ai",
    tagline: "AI-powered copywriting for sales and marketing teams.",
    description:
      "Generates blog posts, product descriptions, email sequences, and social copy from short briefs.",
    category: "writing",
    pricing: "Freemium",
    features: ["90+ templates", "Workflow automations", "Multi-language"],
    url: "https://copy.ai",
    rating: 4.1,
    logo: copyAiLogo,
  },
  {
    slug: "grammarly",
    name: "Grammarly",
    tagline: "AI writing assistant for grammar, clarity, and tone.",
    description:
      "Real-time grammar and tone suggestions across browsers, docs, and emails — now with generative drafting and rewriting.",
    category: "writing",
    pricing: "Freemium",
    features: ["Grammar check", "Tone detection", "Generative rewrite"],
    url: "https://grammarly.com",
    rating: 4.5,
    logo: grammarlyLogo,
  },

  // -------- CODING --------
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "AI-first code editor built on VS Code.",
    description:
      "Cursor is an AI-native fork of VS Code with deep code understanding, multi-file edits, and natural-language refactors.",
    category: "coding",
    pricing: "Freemium",
    features: ["Multi-file edits", "Codebase chat", "Inline AI"],
    url: "https://cursor.sh",
    rating: 4.8,
    logo: cursorLogo,
  },
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "Your AI pair programmer from GitHub and OpenAI.",
    description:
      "Inline code suggestions, chat, and pull-request assistance powered by OpenAI models — works in VS Code, JetBrains, and Neovim.",
    category: "coding",
    pricing: "Paid",
    features: ["Inline completions", "Chat in IDE", "PR review"],
    url: "https://github.com/features/copilot",
    rating: 4.5,
    logo: githubCopilotLogo,
  },
  {
    slug: "codeium",
    name: "Codeium",
    tagline: "Free AI code completion and chat for every IDE.",
    description:
      "Codeium offers free unlimited autocomplete, chat, and search across 70+ languages and 40+ editors.",
    category: "coding",
    pricing: "Freemium",
    features: ["Unlimited free tier", "70+ languages", "Chat and search"],
    url: "https://codeium.com",
    rating: 4.4,
    logo: codeiumLogo,
  },
  {
    slug: "tabnine",
    name: "Tabnine",
    tagline: "Privacy-first AI code completion.",
    description:
      "On-device and self-hosted AI code completion with strict data isolation — built for enterprise compliance.",
    category: "coding",
    pricing: "Freemium",
    features: ["Local model option", "Enterprise on-prem", "Code completion"],
    url: "https://tabnine.com",
    rating: 4.2,
    logo: tabnineLogo,
  },
  {
    slug: "replit",
    name: "Replit",
    tagline: "Browser IDE with built-in AI agent and hosting.",
    description:
      "Replit combines a cloud IDE, deployment, and an AI agent (Replit Ghostwriter / Agent) that builds full apps from prompts.",
    category: "coding",
    pricing: "Freemium",
    features: ["Cloud IDE", "AI agent builds apps", "One-click deploy"],
    url: "https://replit.com",
    rating: 4.3,
    logo: replitLogo,
  },

  // -------- RESEARCH --------
  {
    slug: "perplexity",
    name: "Perplexity",
    tagline: "Answer engine with citations.",
    description:
      "Perplexity delivers cited, web-sourced answers with follow-up questions — a chat interface backed by real-time search.",
    category: "research",
    pricing: "Freemium",
    features: ["Cited answers", "Follow-up threads", "Pro search modes"],
    url: "https://perplexity.ai",
    rating: 4.6,
    logo: perplexityLogo,
  },
  {
    slug: "elicit",
    name: "Elicit",
    tagline: "AI research assistant for academic literature.",
    description:
      "Search 125M+ academic papers, extract findings, and summarize across studies — built for systematic reviews.",
    category: "research",
    pricing: "Freemium",
    features: ["Paper search", "Auto-extraction", "Systematic review tools"],
    url: "https://elicit.com",
    rating: 4.4,
    logo: elicitLogo,
  },
  {
    slug: "consensus",
    name: "Consensus",
    tagline: "Search engine that finds research consensus on a topic.",
    description:
      "Ask a yes/no research question and Consensus surfaces what scientific papers actually conclude — with effect direction tags.",
    category: "research",
    pricing: "Freemium",
    features: ["Consensus meter", "Cited findings", "200M+ papers"],
    url: "https://consensus.app",
    rating: 4.3,
    logo: consensusLogo,
  },
  {
    slug: "semantic-scholar",
    name: "Semantic Scholar",
    tagline: "Free AI-powered research paper search by Allen AI.",
    description:
      "Semantic Scholar indexes 200M+ papers with TLDR summaries, citation graphs, and AI-powered relevance ranking.",
    category: "research",
    pricing: "Free",
    features: ["TLDR summaries", "Citation graph", "Free API"],
    url: "https://semanticscholar.org",
    rating: 4.5,
    logo: semanticScholarLogo,
  },
  {
    slug: "scite",
    name: "Scite",
    tagline: "See how a paper has been cited — supporting, contrasting, mentioning.",
    description:
      "Smart Citations classify each citation as supporting, contrasting, or mentioning so you can quickly assess paper credibility.",
    category: "research",
    pricing: "Paid",
    features: ["Smart Citations", "Citation context", "Browser extension"],
    url: "https://scite.ai",
    rating: 4.2,
    logo: sciteLogo,
  },

  // -------- IMAGE --------
  {
    slug: "midjourney",
    name: "Midjourney",
    tagline: "Best-in-class AI image generation.",
    description:
      "Midjourney produces highly stylized, painterly images with industry-leading aesthetic quality — accessed via Discord and web.",
    category: "image",
    pricing: "Paid",
    features: ["Photoreal + stylized", "v6 model", "Web app"],
    url: "https://midjourney.com",
    rating: 4.7,
    logo: midjourneyLogo,
  },
  {
    slug: "dalle",
    name: "DALL-E",
    tagline: "OpenAI's image generation model — built into ChatGPT.",
    description:
      "DALL-E 3 generates detailed images from natural-language prompts and is integrated into ChatGPT for conversational editing.",
    category: "image",
    pricing: "Paid",
    features: ["DALL-E 3", "ChatGPT integration", "Inpainting"],
    url: "https://openai.com/dall-e-3",
    rating: 4.4,
    logo: dalleLogo,
  },
  {
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    tagline: "Open-source image generation from Stability AI.",
    description:
      "Run SDXL, SD3, and community fine-tunes locally or via API — the open-source backbone of half the AI art ecosystem.",
    category: "image",
    pricing: "Free",
    features: ["Open-source weights", "Local inference", "Huge community"],
    url: "https://stability.ai",
    rating: 4.5,
    logo: stableDiffusionLogo,
  },
  {
    slug: "leonardo-ai",
    name: "Leonardo.Ai",
    tagline: "Image generation for game art, concept art, and assets.",
    description:
      "Leonardo specializes in game-ready assets, character concepts, and stylized illustration with model fine-tunes.",
    category: "image",
    pricing: "Freemium",
    features: ["Game asset models", "Realtime canvas", "Custom training"],
    url: "https://leonardo.ai",
    rating: 4.3,
    logo: leonardoAiLogo,
  },
  {
    slug: "ideogram",
    name: "Ideogram",
    tagline: "AI image generation that handles text inside images.",
    description:
      "Ideogram excels at images containing legible text — logos, posters, memes, and typography — where most generators fail.",
    category: "image",
    pricing: "Freemium",
    features: ["Text-in-image", "Magic Prompt", "v2 model"],
    url: "https://ideogram.ai",
    rating: 4.4,
    logo: ideogramLogo,
  },

  // -------- AUDIO --------
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    tagline: "State-of-the-art AI voice synthesis and cloning.",
    description:
      "Realistic text-to-speech, instant voice cloning, and multilingual dubbing — the leading consumer-grade voice AI.",
    category: "audio",
    pricing: "Freemium",
    features: ["Voice cloning", "29 languages", "Studio editor"],
    url: "https://elevenlabs.io",
    rating: 4.7,
    logo: elevenlabsLogo,
  },
  {
    slug: "suno",
    name: "Suno",
    tagline: "Generate full songs with vocals from a text prompt.",
    description:
      "Suno produces 4-minute songs with lyrics, instrumentation, and AI-generated vocals — no music background required.",
    category: "audio",
    pricing: "Freemium",
    features: ["Full songs with vocals", "Custom lyrics", "Genre control"],
    url: "https://suno.com",
    rating: 4.5,
    logo: sunoLogo,
  },
  {
    slug: "udio",
    name: "Udio",
    tagline: "AI music generation with fine-grained style control.",
    description:
      "Udio competes with Suno on full-song generation and is favored for cleaner vocals and finer style adherence.",
    category: "audio",
    pricing: "Freemium",
    features: ["Style anchoring", "Extension and inpainting", "Stem download"],
    url: "https://udio.com",
    rating: 4.4,
    logo: udioLogo,
  },
  {
    slug: "whisper",
    name: "Whisper",
    tagline: "OpenAI's open-source speech-to-text model.",
    description:
      "Whisper transcribes audio in 99 languages with state-of-the-art accuracy — open-source weights and a hosted API.",
    category: "audio",
    pricing: "Free",
    features: ["99 languages", "Open-source", "Word-level timestamps"],
    url: "https://openai.com/research/whisper",
    rating: 4.6,
    logo: whisperLogo,
  },
  {
    slug: "descript",
    name: "Descript",
    tagline: "Edit audio and video like a Google Doc.",
    description:
      "Transcribe, edit by deleting words from a script, clone your voice, and produce podcasts — all in one app.",
    category: "audio",
    pricing: "Freemium",
    features: ["Transcript-based editing", "Overdub voice cloning", "Studio Sound"],
    url: "https://descript.com",
    rating: 4.5,
    logo: descriptLogo,
  },

  // -------- VIDEO --------
  {
    slug: "runway",
    name: "Runway",
    tagline: "Generative video with Gen-3 — the industry leader.",
    description:
      "Runway's Gen-3 produces cinematic AI video from text or image prompts — used in TV, film, and indie productions.",
    category: "video",
    pricing: "Freemium",
    features: ["Gen-3 Alpha", "Text-to-video", "Motion brush"],
    url: "https://runwayml.com",
    rating: 4.5,
    logo: runwayLogo,
  },
  {
    slug: "pika",
    name: "Pika",
    tagline: "Fast, fun AI video generation.",
    description:
      "Pika focuses on short, expressive clips with effects libraries — great for social-media-ready video without a learning curve.",
    category: "video",
    pricing: "Freemium",
    features: ["Pika Effects", "Lip-sync", "Image-to-video"],
    url: "https://pika.art",
    rating: 4.3,
    logo: pikaLogo,
  },
  {
    slug: "synthesia",
    name: "Synthesia",
    tagline: "AI avatars for corporate training and explainer videos.",
    description:
      "Type a script, pick an AI avatar and voice, and Synthesia produces studio-quality videos in 140+ languages.",
    category: "video",
    pricing: "Paid",
    features: ["140+ AI avatars", "120+ languages", "Custom avatars"],
    url: "https://synthesia.io",
    rating: 4.4,
    logo: synthesiaLogo,
  },
  {
    slug: "heygen",
    name: "HeyGen",
    tagline: "AI avatars and instant video translation.",
    description:
      "HeyGen creates avatar videos from a script and offers instant lip-synced translation of existing footage into 175+ languages.",
    category: "video",
    pricing: "Freemium",
    features: ["Instant avatar videos", "Video translation + lip-sync", "Brand voices"],
    url: "https://heygen.com",
    rating: 4.4,
    logo: heygenLogo,
  },
  {
    slug: "opus-clip",
    name: "Opus Clip",
    tagline: "Repurpose long videos into viral shorts automatically.",
    description:
      "Drop a long-form video and Opus Clip auto-produces TikTok/Reels-ready shorts with captions, framing, and hooks.",
    category: "video",
    pricing: "Freemium",
    features: ["Auto-shorts from longform", "Auto-captioning", "Virality scoring"],
    url: "https://opus.pro",
    rating: 4.3,
    logo: opusClipLogo,
  },

  // -------- PRODUCTIVITY --------
  {
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "AI assistant baked into Notion docs and databases.",
    description:
      "Generates summaries, action items, translations, and answers questions across all your Notion content with workspace context.",
    category: "productivity",
    pricing: "Freemium",
    features: ["Summarize and rewrite", "Q&A across workspace", "Action items"],
    url: "https://notion.so/product/ai",
    rating: 4.4,
    logo: notionAiLogo,
  },
  {
    slug: "motion",
    name: "Motion",
    tagline: "AI calendar that auto-schedules your tasks.",
    description:
      "Motion combines tasks, calendar, and meetings — automatically scheduling work into open slots and rebalancing on conflicts.",
    category: "productivity",
    pricing: "Paid",
    features: ["Auto-schedule", "Smart calendar", "Project planning"],
    url: "https://usemotion.com",
    rating: 4.3,
    logo: motionLogo,
  },
  {
    slug: "reclaim-ai",
    name: "Reclaim.ai",
    tagline: "AI scheduling for habits, tasks, and meetings.",
    description:
      "Reclaim protects time for habits and high-priority tasks on your Google Calendar, rescheduling automatically when conflicts arise.",
    category: "productivity",
    pricing: "Freemium",
    features: ["Smart 1:1s", "Habit blocks", "Task auto-scheduling"],
    url: "https://reclaim.ai",
    rating: 4.5,
    logo: reclaimAiLogo,
  },
  {
    slug: "mem",
    name: "Mem",
    tagline: "AI-native note-taking that organizes itself.",
    description:
      "Mem auto-tags, links, and surfaces notes you forgot you wrote — search by meaning rather than keywords.",
    category: "productivity",
    pricing: "Freemium",
    features: ["Self-organizing notes", "Mem Chat across notes", "Smart Write"],
    url: "https://mem.ai",
    rating: 4.2,
    logo: memLogo,
  },
  {
    slug: "taskade",
    name: "Taskade",
    tagline: "AI-powered task and project workspace with agents.",
    description:
      "Taskade combines tasks, mind-maps, and AI agents that automate workflows across teams.",
    category: "productivity",
    pricing: "Freemium",
    features: ["AI agents", "Mind maps and outlines", "Real-time collab"],
    url: "https://taskade.com",
    rating: 4.3,
    logo: taskadeLogo,
  },

  // -------- DESIGN --------
  {
    slug: "figma-ai",
    name: "Figma AI",
    tagline: "AI features built into Figma — search, generate, rename.",
    description:
      "Figma AI adds Make Designs, Visual Search, layer auto-rename, and prototype generation directly inside Figma.",
    category: "design",
    pricing: "Freemium",
    features: ["Make Designs", "Visual Search", "Auto-rename layers"],
    url: "https://figma.com",
    rating: 4.4,
    logo: figmaAiLogo,
  },
  {
    slug: "framer-ai",
    name: "Framer AI",
    tagline: "Generate publishable websites from a prompt.",
    description:
      "Framer AI turns a description into a full responsive website — layout, copy, images, and interactions — in seconds.",
    category: "design",
    pricing: "Freemium",
    features: ["AI Site generation", "Responsive layouts", "One-click publish"],
    url: "https://framer.com",
    rating: 4.4,
    logo: framerAiLogo,
  },
  {
    slug: "uizard",
    name: "Uizard",
    tagline: "Turn sketches and screenshots into UI designs.",
    description:
      "Upload a hand sketch or screenshot and Uizard converts it to an editable Figma-style mockup, complete with components.",
    category: "design",
    pricing: "Freemium",
    features: ["Sketch to UI", "Screenshot to UI", "Theme generation"],
    url: "https://uizard.io",
    rating: 4.2,
    logo: uizardLogo,
  },
  {
    slug: "galileo-ai",
    name: "Galileo AI",
    tagline: "Generate editable UI designs from text descriptions.",
    description:
      "Galileo produces high-fidelity Figma-ready UI screens from natural-language briefs in seconds.",
    category: "design",
    pricing: "Freemium",
    features: ["Text to UI", "Figma export", "High-fidelity output"],
    url: "https://usegalileo.ai",
    rating: 4.3,
    logo: galileoAiLogo,
  },
  {
    slug: "recraft",
    name: "Recraft",
    tagline: "AI image generation built for designers.",
    description:
      "Recraft creates vectors, icons, illustrations, and brand-consistent images with a fine-tuned design-focused model.",
    category: "design",
    pricing: "Freemium",
    features: ["Vector output", "Brand styles", "Consistent characters"],
    url: "https://recraft.ai",
    rating: 4.4,
    logo: recraftLogo,
  },

  // -------- DATA --------
  {
    slug: "julius-ai",
    name: "Julius AI",
    tagline: "Chat with your data — analysis and visualization.",
    description:
      "Upload a spreadsheet and Julius runs analyses, generates charts, and writes Python in the background — explained in plain English.",
    category: "data",
    pricing: "Freemium",
    features: ["Chat with spreadsheets", "Auto-visualization", "Python notebooks"],
    url: "https://julius.ai",
    rating: 4.5,
    logo: juliusAiLogo,
  },
  {
    slug: "rows",
    name: "Rows",
    tagline: "AI-native spreadsheet with built-in integrations.",
    description:
      "Rows is a spreadsheet with AI formulas, integrations to 50+ tools (HubSpot, Salesforce, etc.), and shareable dashboards.",
    category: "data",
    pricing: "Freemium",
    features: ["AI formulas", "50+ integrations", "Shareable dashboards"],
    url: "https://rows.com",
    rating: 4.3,
    logo: rowsLogo,
  },
  {
    slug: "numerous",
    name: "Numerous",
    tagline: "ChatGPT inside Google Sheets and Excel.",
    description:
      "Numerous adds AI formulas to your existing spreadsheets — categorize, extract, and write at scale across thousands of rows.",
    category: "data",
    pricing: "Freemium",
    features: ["AI formulas in Sheets/Excel", "Bulk categorization", "Web scraping"],
    url: "https://numerous.ai",
    rating: 4.2,
    logo: numerousLogo,
  },
  {
    slug: "akkio",
    name: "Akkio",
    tagline: "No-code AI for predictive analytics.",
    description:
      "Akkio lets non-technical users train predictive models on their data — churn, lead scoring, forecasting — in minutes.",
    category: "data",
    pricing: "Paid",
    features: ["No-code ML", "Predictive forecasting", "CRM integrations"],
    url: "https://akkio.com",
    rating: 4.2,
    logo: akkioLogo,
  },
  {
    slug: "obviously-ai",
    name: "Obviously AI",
    tagline: "No-code predictive analytics for business teams.",
    description:
      "Connect a database or CSV and Obviously AI auto-builds prediction models with explanations a non-technical user can act on.",
    category: "data",
    pricing: "Paid",
    features: ["Auto ML", "Plain-language explanations", "API deployment"],
    url: "https://obviously.ai",
    rating: 4.1,
    logo: obviouslyAiLogo,
  },

  // -------- MARKETING --------
  {
    slug: "jasper-marketing",
    name: "Jasper Marketing Suite",
    tagline: "Jasper's enterprise marketing campaign suite.",
    description:
      "The team-edition extension of Jasper for marketing departments — campaign briefs, brand voice memory, and analytics.",
    category: "marketing",
    pricing: "Paid",
    features: ["Campaign briefs", "Brand voice memory", "Analytics"],
    url: "https://jasper.ai/products/marketing",
    rating: 4.1,
    logo: jasperMarketingLogo,
  },
  {
    slug: "hubspot-ai",
    name: "HubSpot AI",
    tagline: "AI features across HubSpot's marketing and sales suite.",
    description:
      "HubSpot AI adds Breeze copilot, content remixing, and predictive scoring across the HubSpot CRM — built for marketing teams.",
    category: "marketing",
    pricing: "Freemium",
    features: ["Breeze copilot", "Content remix", "Predictive scoring"],
    url: "https://hubspot.com/artificial-intelligence",
    rating: 4.4,
    logo: hubspotAiLogo,
  },
  {
    slug: "surfer-seo",
    name: "Surfer SEO",
    tagline: "AI-powered SEO content optimization.",
    description:
      "Surfer audits and writes content optimized for search — keyword density, structure, and internal linking — backed by SERP data.",
    category: "marketing",
    pricing: "Paid",
    features: ["SERP analyzer", "AI content writer", "Audit tool"],
    url: "https://surferseo.com",
    rating: 4.4,
    logo: surferSeoLogo,
  },
  {
    slug: "copy-ai-marketing",
    name: "Copy.ai for Go-To-Market",
    tagline: "Copy.ai's GTM AI platform for sales and marketing automation.",
    description:
      "Copy.ai's enterprise tier focuses on GTM workflows — outbound sequences, deal research, and account-based marketing automation.",
    category: "marketing",
    pricing: "Freemium",
    features: ["GTM workflows", "Account research", "Outbound sequences"],
    url: "https://copy.ai/gtm-ai-platform",
    rating: 4.2,
    logo: copyAiMarketingLogo,
  },
  {
    slug: "rytr",
    name: "Rytr",
    tagline: "Affordable AI copywriter for small teams.",
    description:
      "Rytr offers 40+ writing templates at a notably low price point — popular with solopreneurs and small marketing teams.",
    category: "marketing",
    pricing: "Freemium",
    features: ["40+ templates", "30+ languages", "Plagiarism check"],
    url: "https://rytr.me",
    rating: 4.3,
    logo: rytrLogo,
  },
] as const

// Module-load validation: throws at dev-server start AND during `vite build`.
// FOUND-07 structural prevention of duplicate-slug bugs.
__validateSlugsUnique(TOOLS)
__validateLogosPresent(TOOLS)
