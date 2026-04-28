// src/data/tools.ts
// Phase 1 / Plan 01-05 — the seed catalog. Every tool has a unique slug, real SVG logo,
// and full Tool shape. __validateSlugsUnique + __validateLogosPresent fire at module load
// (works in both `vite` and `vite build`), failing the build on data integrity violations.
//
// Phase 4 polish — accuracy pass. Descriptions, pricing tiers, features and ratings
// updated against vendor info as of April 2026 (model versions: Claude Sonnet 4.x,
// Midjourney v7, Runway Gen-4, Pika 2.x, Suno v4, etc.). Slugs unchanged so logos
// continue to resolve.
import type { Tool } from "@/types"
import {
  __validateCategoriesShape,
  __validateLogosPresent,
  __validateSlugsUnique,
} from "./_validate"

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
    tagline: "OpenAI's flagship conversational AI assistant.",
    description:
      "ChatGPT is OpenAI's chat product, built on GPT-4o and GPT-5 models. It handles long-form writing, code generation, image and voice input/output, web search, and the largest custom-GPT and plugin ecosystem of any AI assistant. Free tier covers most students; Plus ($20/mo) raises message caps and unlocks priority access to newer models.",
    category: "writing",
    categories: ["writing", "coding", "research", "productivity"],
    pricing: "Freemium",
    features: [
      "GPT-5 + GPT-4o models",
      "Voice and image input",
      "Custom GPTs and plugin ecosystem",
      "Web search and Canvas mode",
      "Free tier with daily message limits",
    ],
    url: "https://chat.openai.com",
    rating: 4.7,
    logo: chatgptLogo,
  },
  {
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic's assistant — careful reasoning, long context, agentic coding.",
    description:
      "Claude is Anthropic's AI assistant family — Sonnet 4.x balances speed and quality, Opus 4 leads on complex reasoning, and Haiku handles fast cheap tasks. Known for honest, thoughtful answers and 200K-token standard context (1M on Sonnet 4 with the long-context flag). The Claude Code CLI and IDE extensions make it the go-to assistant for serious coding work, and Artifacts render interactive output inline. Free tier with daily limits; Pro at $20/month adds higher caps and Projects.",
    category: "writing",
    categories: ["writing", "coding", "research", "productivity"],
    pricing: "Freemium",
    features: [
      "Sonnet 4.x + Opus 4 + Haiku",
      "Up to 1M token context window",
      "Claude Code (CLI + IDE agent)",
      "Artifacts (interactive output)",
      "Projects with shared knowledge",
    ],
    url: "https://claude.ai",
    rating: 4.7,
    logo: claudeLogo,
  },
  {
    slug: "jasper",
    name: "Jasper",
    tagline: "AI marketing copywriter built around brand voice.",
    description:
      "Jasper is a paid copywriting platform for marketing teams that learn and reproduce a specific brand voice. It ships with templates for blogs, ad creative, social posts, and SEO-optimized articles, plus a workflow editor for multi-step content production. Pricing starts at $49/seat/month for Creator; team plans run higher.",
    category: "writing",
    categories: ["writing", "marketing"],
    pricing: "Paid",
    features: [
      "Brand voice memory",
      "60+ marketing templates",
      "SEO mode (Surfer integration)",
      "Team collaboration",
      "Campaigns and content workflows",
    ],
    url: "https://jasper.ai",
    rating: 4.1,
    logo: jasperLogo,
  },
  {
    slug: "copy-ai",
    name: "Copy.ai",
    tagline: "AI copywriter for blogs, emails, and product copy.",
    description:
      "Copy.ai generates short and long-form marketing copy from short briefs — blog posts, email sequences, product descriptions, and social posts. The Free plan covers light personal use; the Pro plan ($49/month) unlocks unlimited generations and the workflow builder for repeatable content automations.",
    category: "writing",
    categories: ["writing", "marketing"],
    pricing: "Freemium",
    features: [
      "90+ copy templates",
      "Workflow automations",
      "25+ languages",
      "Free plan available",
      "Brand voice settings",
    ],
    url: "https://copy.ai",
    rating: 4.0,
    logo: copyAiLogo,
  },
  {
    slug: "grammarly",
    name: "Grammarly",
    tagline: "Writing assistant for grammar, clarity, tone, and rewriting.",
    description:
      "Grammarly is the most widely used real-time writing assistant — grammar, spelling, punctuation, and tone suggestions across browsers, Word, Docs, email, and chat. Now bundled with generative AI features that draft, rewrite, and shorten text. Free tier covers basics; Premium ($12/month) adds tone rewrite and clarity-focused suggestions.",
    category: "writing",
    categories: ["writing", "productivity"],
    pricing: "Freemium",
    features: [
      "Real-time grammar + spelling",
      "Tone detector",
      "Generative drafting and rewriting",
      "Plagiarism check (Premium)",
      "Browser, desktop, and mobile",
    ],
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
      "Cursor is a fork of VS Code rebuilt around AI: inline edits, multi-file refactors via Composer, and an Agent mode that runs commands and edits the codebase autonomously. It indexes your repo for context-aware chat. Free Hobby tier includes limited fast requests; Pro at $20/month unlocks unlimited slow requests and 500+ fast requests on top models.",
    category: "coding",
    categories: ["coding"],
    pricing: "Freemium",
    features: [
      "Composer multi-file edits",
      "Agent mode (autonomous tasks)",
      "Codebase chat with @-mentions",
      "Tab autocomplete with context",
      "Bring-your-own-key option",
    ],
    url: "https://cursor.com",
    rating: 4.8,
    logo: cursorLogo,
  },
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "AI pair programmer from GitHub and OpenAI.",
    description:
      "GitHub Copilot ships inline code suggestions, chat, and PR review for VS Code, JetBrains, Visual Studio, Neovim, and Xcode. The free tier (added Dec 2024) gives 2,000 completions and 50 chats per month; Pro ($10/month) is unlimited and adds model choice (Claude, Gemini, GPT-5). Copilot Workspace and Coding Agent automate full PRs.",
    category: "coding",
    categories: ["coding"],
    pricing: "Freemium",
    features: [
      "Inline completions in 8+ IDEs",
      "Chat with codebase awareness",
      "Free tier (2,000 completions/mo)",
      "Coding Agent (autonomous PRs)",
      "Choice of GPT-5, Claude, Gemini",
    ],
    url: "https://github.com/features/copilot",
    rating: 4.5,
    logo: githubCopilotLogo,
  },
  {
    slug: "codeium",
    name: "Codeium",
    tagline: "Free unlimited AI code completion and chat.",
    description:
      "Codeium is the free-forever alternative to Copilot — unlimited autocomplete, chat, and search across 70+ languages and 40+ editors with no message caps for individuals. The team behind it also ships Windsurf, an AI-first IDE. Strong individual free tier; enterprise plans add self-hosting and SOC 2 Type II.",
    category: "coding",
    categories: ["coding"],
    pricing: "Freemium",
    features: [
      "Unlimited free autocomplete",
      "70+ languages",
      "40+ editor integrations",
      "In-IDE chat and search",
      "Enterprise self-hosting available",
    ],
    url: "https://codeium.com",
    rating: 4.4,
    logo: codeiumLogo,
  },
  {
    slug: "tabnine",
    name: "Tabnine",
    tagline: "Privacy-first AI code assistant for the enterprise.",
    description:
      "Tabnine is a code completion and chat tool built around enterprise data isolation — air-gapped self-hosting, private deployments, and audit logs. Models are tuned to never train on your code. Basic free tier; Pro at $12/seat/month adds higher-quality completions, and Enterprise unlocks self-hosted models and SSO.",
    category: "coding",
    categories: ["coding"],
    pricing: "Freemium",
    features: [
      "Self-hosted / on-prem deployment",
      "Zero data retention guarantees",
      "Code chat + agent commands",
      "Per-team customization",
      "VS Code, JetBrains, Vim, more",
    ],
    url: "https://tabnine.com",
    rating: 4.2,
    logo: tabnineLogo,
  },
  {
    slug: "replit",
    name: "Replit",
    tagline: "Cloud IDE with Replit Agent that builds full apps from prompts.",
    description:
      "Replit pairs a browser-based IDE and one-click hosting with Replit Agent — an autonomous coding agent that builds, deploys, and iterates on full apps from a description. Excellent for rapid prototyping and learning. Free Starter plan; Core at $25/month unlocks full Agent access and increased compute.",
    category: "coding",
    categories: ["coding", "productivity"],
    pricing: "Freemium",
    features: [
      "Replit Agent (autonomous full-app build)",
      "Cloud IDE with collaborative coding",
      "One-click deploy with always-on hosting",
      "50+ languages",
      "Database, secrets, and auth built-in",
    ],
    url: "https://replit.com",
    rating: 4.3,
    logo: replitLogo,
  },

  // -------- RESEARCH --------
  {
    slug: "perplexity",
    name: "Perplexity",
    tagline: "Answer engine that cites every source.",
    description:
      "Perplexity is a search-first AI that returns concise, cited answers and follow-up questions based on real-time web search. Pro (free for students at supported universities, otherwise $20/month) adds access to top-tier models (GPT-5, Claude Opus 4, Sonar Huge), file uploads, and Pro Search agentic mode.",
    category: "research",
    categories: ["research", "writing"],
    pricing: "Freemium",
    features: [
      "Inline citations on every answer",
      "Follow-up question suggestions",
      "Pro Search (multi-step agentic)",
      "File and image upload",
      "Free Pro for many .edu emails",
    ],
    url: "https://perplexity.ai",
    rating: 4.6,
    logo: perplexityLogo,
  },
  {
    slug: "elicit",
    name: "Elicit",
    tagline: "AI research assistant for academic literature.",
    description:
      "Elicit searches 125M+ academic papers, extracts findings into a structured table, and summarizes across studies — built for systematic reviews and literature scans. Free tier covers core search; Plus at $12/month adds higher extraction limits and PDF chat.",
    category: "research",
    categories: ["research"],
    pricing: "Freemium",
    features: [
      "125M+ paper index",
      "Auto-extract into tables",
      "Cross-paper summaries",
      "PDF chat (Plus)",
      "Citation export (BibTeX, RIS)",
    ],
    url: "https://elicit.com",
    rating: 4.4,
    logo: elicitLogo,
  },
  {
    slug: "consensus",
    name: "Consensus",
    tagline: "Search engine for what science actually says.",
    description:
      "Ask a yes/no research question and Consensus surfaces what peer-reviewed papers conclude — with effect-direction tags (yes / mixed / possibly / no) and a Consensus Meter. Indexes 200M+ papers across PubMed and Semantic Scholar. Free tier limited to 20 searches/month; Premium at $9/month is unlimited.",
    category: "research",
    categories: ["research"],
    pricing: "Freemium",
    features: [
      "Consensus Meter on results",
      "Yes/No effect-direction tags",
      "Cited findings (200M+ papers)",
      "Study Snapshot summaries",
      "ChatGPT plugin available",
    ],
    url: "https://consensus.app",
    rating: 4.3,
    logo: consensusLogo,
  },
  {
    slug: "semantic-scholar",
    name: "Semantic Scholar",
    tagline: "Free AI-powered research search by Allen AI.",
    description:
      "Semantic Scholar (from the Allen Institute) is a fully free, open research index over 200M+ papers with TLDR summaries, citation graphs, and influence-aware ranking. Powers a lot of downstream research tools and offers a free public API.",
    category: "research",
    categories: ["research"],
    pricing: "Free",
    features: [
      "200M+ paper index",
      "TLDR auto-summaries",
      "Citation context graph",
      "Free public API",
      "No account required",
    ],
    url: "https://semanticscholar.org",
    rating: 4.5,
    logo: semanticScholarLogo,
  },
  {
    slug: "scite",
    name: "Scite",
    tagline: "See how a paper has actually been cited.",
    description:
      "Scite's Smart Citations classify each citation as supporting, contrasting, or just mentioning — letting you assess paper credibility at a glance. Browser extension surfaces this on PubMed, Wikipedia, and journal sites. Personal plan $20/month; institutional licenses available.",
    category: "research",
    categories: ["research"],
    pricing: "Paid",
    features: [
      "Smart Citations (support/contrast/mention)",
      "Citation context excerpts",
      "Browser extension",
      "Reference Check for manuscripts",
      "Search 1.2B+ citation statements",
    ],
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
      "Midjourney's v7 model leads the field on aesthetic quality and stylistic range — the go-to for concept art, illustration, and editorial. Now accessed primarily via the web app (with Discord legacy), with Style Reference, Character Reference, and Vary modes for iterating on a look. No free tier; Basic plan starts at $10/month.",
    category: "image",
    categories: ["image", "design"],
    pricing: "Paid",
    features: [
      "Midjourney v7 model",
      "Style and Character References",
      "Vary, Pan, Zoom, Inpaint",
      "Web app (Discord legacy)",
      "Image-to-video (limited)",
    ],
    url: "https://midjourney.com",
    rating: 4.7,
    logo: midjourneyLogo,
  },
  {
    slug: "dalle",
    name: "DALL-E",
    tagline: "OpenAI's image generation, integrated into ChatGPT.",
    description:
      "DALL-E 3 generates detailed images from natural-language prompts and is built into ChatGPT, where it inherits the conversation context for iterative editing. The 4o image model (released 2025) handles in-context image editing inside ChatGPT chats. Bundled with ChatGPT Plus ($20/month) or via API.",
    category: "image",
    categories: ["image"],
    pricing: "Paid",
    features: [
      "DALL-E 3 + GPT-4o image",
      "ChatGPT-integrated editing",
      "Conversational refinement",
      "API access for developers",
      "Built into ChatGPT Plus",
    ],
    url: "https://openai.com/dall-e-3",
    rating: 4.3,
    logo: dalleLogo,
  },
  {
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    tagline: "Open-source image generation from Stability AI.",
    description:
      "Stable Diffusion is the open-source backbone of half the AI art ecosystem — SDXL, SD 3.5 Large, and community fine-tunes you can run locally on a consumer GPU. Free for self-hosting; Stability's hosted API is metered. Unmatched ecosystem: ComfyUI, AUTOMATIC1111, dozens of LoRA marketplaces.",
    category: "image",
    categories: ["image"],
    pricing: "Free",
    features: [
      "SDXL + SD 3.5 open weights",
      "Run locally on your GPU",
      "Massive LoRA / ControlNet ecosystem",
      "ComfyUI + AUTOMATIC1111 UIs",
      "Commercial use allowed (with license)",
    ],
    url: "https://stability.ai",
    rating: 4.5,
    logo: stableDiffusionLogo,
  },
  {
    slug: "leonardo-ai",
    name: "Leonardo.Ai",
    tagline: "Image generation tuned for game art and concept work.",
    description:
      "Leonardo specializes in production-ready game assets, character concepts, and illustration with a Realtime Canvas for live editing and Custom Models you can train on your own art. Acquired by Canva in 2024. Free plan with daily token quota; paid plans start at $12/month.",
    category: "image",
    categories: ["image", "design"],
    pricing: "Freemium",
    features: [
      "Realtime Canvas (live edit)",
      "Game-asset model variants",
      "Train custom models",
      "Image-to-video and 3D texture",
      "Now part of Canva",
    ],
    url: "https://leonardo.ai",
    rating: 4.3,
    logo: leonardoAiLogo,
  },
  {
    slug: "ideogram",
    name: "Ideogram",
    tagline: "AI image generation that handles text inside images.",
    description:
      "Ideogram (v3 model) excels at images containing legible text — logos, posters, memes, infographics — where most other generators garble letters. Magic Prompt expands short prompts into detailed scenes. Free tier available; Plus at $8/month adds private generations and faster queues.",
    category: "image",
    categories: ["image", "design"],
    pricing: "Freemium",
    features: [
      "Ideogram v3 model",
      "Reliable in-image text rendering",
      "Magic Prompt expansion",
      "Style references",
      "Free tier with daily limit",
    ],
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
      "ElevenLabs is the leading consumer-grade voice AI — realistic text-to-speech, instant voice cloning from short samples, and multilingual dubbing across 70+ languages. Studio editor for long-form projects; Conversational AI agents; ElevenReader app. Free 10k characters/month; Starter at $5/month for personal use.",
    category: "audio",
    categories: ["audio"],
    pricing: "Freemium",
    features: [
      "Instant voice cloning",
      "70+ languages",
      "Studio long-form editor",
      "Conversational AI agents",
      "ElevenReader and dubbing",
    ],
    url: "https://elevenlabs.io",
    rating: 4.7,
    logo: elevenlabsLogo,
  },
  {
    slug: "suno",
    name: "Suno",
    tagline: "Generate full songs with vocals from a text prompt.",
    description:
      "Suno's v4 model produces 4-minute songs with realistic vocals, instrumentation, and song structure from a text prompt. Custom Lyrics mode lets you write and steer; Cover and Persona keep your style consistent. Free Basic plan with 50 credits/day; Pro at $10/month unlocks commercial use.",
    category: "audio",
    categories: ["audio"],
    pricing: "Freemium",
    features: [
      "Suno v4 model",
      "Full songs with AI vocals",
      "Custom Lyrics + Style prompts",
      "Personas (consistent voices)",
      "Stem download (Pro)",
    ],
    url: "https://suno.com",
    rating: 4.5,
    logo: sunoLogo,
  },
  {
    slug: "udio",
    name: "Udio",
    tagline: "AI music generation with fine-grained style control.",
    description:
      "Udio competes with Suno on full-song generation and is favored for cleaner vocals, finer style adherence, and the ability to extend or remix existing audio. Free tier 10 songs/month; Standard at $10/month for 1,200 credits and commercial rights.",
    category: "audio",
    categories: ["audio"],
    pricing: "Freemium",
    features: [
      "Strong vocal clarity",
      "Style anchoring on references",
      "Extend, inpaint, remix",
      "Stem download (paid)",
      "Free 10 songs/month",
    ],
    url: "https://udio.com",
    rating: 4.4,
    logo: udioLogo,
  },
  {
    slug: "whisper",
    name: "Whisper",
    tagline: "OpenAI's open-source speech-to-text model.",
    description:
      "Whisper transcribes and translates audio across 99 languages with state-of-the-art accuracy. Open-source weights run locally; OpenAI's hosted API charges $0.006/minute. The backbone of countless transcription products including Otter and Descript.",
    category: "audio",
    categories: ["audio", "productivity"],
    pricing: "Free",
    features: [
      "99 language support",
      "Open-source weights (MIT)",
      "Word-level timestamps",
      "Translation to English",
      "Hosted API ($0.006/min)",
    ],
    url: "https://openai.com/research/whisper",
    rating: 4.6,
    logo: whisperLogo,
  },
  {
    slug: "descript",
    name: "Descript",
    tagline: "Edit audio and video like a Google Doc.",
    description:
      "Descript transcribes your recording, then lets you edit the audio or video by deleting words from the transcript. Overdub clones your voice for fixes; Studio Sound cleans bad recordings; Eye Contact corrects gaze. The all-in-one tool for podcasters and YouTubers. Free tier 1 hour/month; Hobbyist at $16/month for 10 hours.",
    category: "audio",
    categories: ["audio", "video", "productivity"],
    pricing: "Freemium",
    features: [
      "Transcript-based editing",
      "Overdub voice cloning",
      "Studio Sound (audio enhance)",
      "Eye Contact correction",
      "Multitrack podcast / video",
    ],
    url: "https://descript.com",
    rating: 4.5,
    logo: descriptLogo,
  },

  // -------- VIDEO --------
  {
    slug: "runway",
    name: "Runway",
    tagline: "Generative video — Gen-4 leads the field.",
    description:
      "Runway's Gen-4 produces cinematic AI video from text or image prompts and is widely used in TV, film, and indie productions. Tools include Act-One (transfer performance), Frames (image gen), and Motion Brush. Free tier 125 credits; Standard at $15/month for 625 credits and Gen-4 access.",
    category: "video",
    categories: ["video"],
    pricing: "Freemium",
    features: [
      "Gen-4 (text- and image-to-video)",
      "Act-One performance transfer",
      "Motion Brush directing",
      "Frames (image generation)",
      "Standard upscale to 4K",
    ],
    url: "https://runwayml.com",
    rating: 4.5,
    logo: runwayLogo,
  },
  {
    slug: "pika",
    name: "Pika",
    tagline: "Fast, fun AI video generation.",
    description:
      "Pika 2.x focuses on short, expressive clips with effect libraries (Pikaeffects), lip-sync, and Pikaframes for keyframe-driven animation. Excellent for social-media-ready video without a learning curve. Free tier 250 credits; Standard at $10/month for 700 credits.",
    category: "video",
    categories: ["video"],
    pricing: "Freemium",
    features: [
      "Pika 2.x model",
      "Pikaeffects (built-in effects)",
      "Lip-sync to audio",
      "Image-to-video",
      "Free tier with daily credits",
    ],
    url: "https://pika.art",
    rating: 4.3,
    logo: pikaLogo,
  },
  {
    slug: "synthesia",
    name: "Synthesia",
    tagline: "AI avatars for corporate training and explainer videos.",
    description:
      "Type a script, pick from 230+ AI avatars and Synthesia produces studio-quality videos in 140+ languages. The standard for L&D and corporate communications — used by 60% of the Fortune 100. Custom avatars (your own face) available on Enterprise. Starter plan $29/month for 10 minutes of video.",
    category: "video",
    categories: ["video", "marketing"],
    pricing: "Paid",
    features: [
      "230+ stock AI avatars",
      "140+ languages and accents",
      "Custom avatars (Enterprise)",
      "Brand kit and templates",
      "Screen recording + voiceover",
    ],
    url: "https://synthesia.io",
    rating: 4.4,
    logo: synthesiaLogo,
  },
  {
    slug: "heygen",
    name: "HeyGen",
    tagline: "AI avatars and instant video translation.",
    description:
      "HeyGen creates avatar videos from a script and offers instant video translation that lip-syncs the existing speaker into 175+ languages — its breakout feature. Avatar IV creates expressive avatars from a single photo. Free tier 1 minute/month; Creator at $24/month unlocks 15 minutes and HD.",
    category: "video",
    categories: ["video", "marketing"],
    pricing: "Freemium",
    features: [
      "Instant video translation + lip-sync",
      "Avatar IV (photo to talking head)",
      "175+ languages",
      "175+ stock avatars",
      "Brand voice cloning",
    ],
    url: "https://heygen.com",
    rating: 4.4,
    logo: heygenLogo,
  },
  {
    slug: "opus-clip",
    name: "Opus Clip",
    tagline: "Repurpose long videos into viral shorts automatically.",
    description:
      "Drop a long-form video (podcast, lecture, webinar) and Opus Clip auto-produces TikTok / Reels / Shorts with captions, dynamic framing, and a virality score on each clip. Free starter tier; Pro at $19/month for 7,200 minutes per year and brand templates.",
    category: "video",
    categories: ["video", "marketing"],
    pricing: "Freemium",
    features: [
      "Auto-shorts from long video",
      "AI captions with brand styling",
      "Dynamic-zoom framing",
      "Virality score per clip",
      "ClipAnything (search by description)",
    ],
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
      "Notion AI summarizes, drafts, translates, and answers questions across all your Notion content with workspace context. AI Connectors pull in Slack, Google Drive, and GitHub data. Bundled into the Notion Business plan ($24/seat/month) or as a $10/seat/month add-on to Plus.",
    category: "productivity",
    categories: ["productivity", "writing"],
    pricing: "Paid",
    features: [
      "Q&A across whole workspace",
      "Summarize and rewrite in-line",
      "AI Connectors (Slack, Drive, GitHub)",
      "Auto-fill database properties",
      "Meeting note summaries",
    ],
    url: "https://notion.so/product/ai",
    rating: 4.4,
    logo: notionAiLogo,
  },
  {
    slug: "motion",
    name: "Motion",
    tagline: "AI calendar that auto-schedules your tasks.",
    description:
      "Motion combines tasks, calendar, and meeting scheduling — automatically dropping work into open slots and rebalancing when conflicts arise. Project Manager handles team workflows. No free tier; Individual at $19/month, Team at $12/seat/month.",
    category: "productivity",
    categories: ["productivity"],
    pricing: "Paid",
    features: [
      "Auto-schedule tasks into calendar",
      "Project planning with AI deadlines",
      "Meeting scheduler links",
      "Time blocking and focus modes",
      "Google + Outlook calendar sync",
    ],
    url: "https://usemotion.com",
    rating: 4.3,
    logo: motionLogo,
  },
  {
    slug: "reclaim-ai",
    name: "Reclaim.ai",
    tagline: "AI scheduling for habits, tasks, and meetings.",
    description:
      "Reclaim sits on top of Google Calendar and protects time for habits and high-priority tasks, rescheduling automatically when conflicts arise. Smart 1:1s find the best time recurring. Free tier with core features; Pro at $10/seat/month adds task integrations and Habit Pro.",
    category: "productivity",
    categories: ["productivity"],
    pricing: "Freemium",
    features: [
      "Smart 1:1s (auto-reschedule)",
      "Habit blocks (Reclaim time)",
      "Task auto-scheduling",
      "Buffer time and travel time",
      "Slack + Linear + Asana integrations",
    ],
    url: "https://reclaim.ai",
    rating: 4.5,
    logo: reclaimAiLogo,
  },
  {
    slug: "mem",
    name: "Mem",
    tagline: "AI-native note-taking that organizes itself.",
    description:
      "Mem auto-tags, links, and surfaces notes you forgot you wrote — search by meaning rather than keywords. Mem Chat lets you ask questions across your entire knowledge base. Free tier; Mem X at $10/month adds full AI features and unlimited Mem Chat.",
    category: "productivity",
    categories: ["productivity", "writing"],
    pricing: "Freemium",
    features: [
      "Self-organizing notes",
      "Mem Chat across all notes",
      "Smart Write (drafting in context)",
      "Auto-linking related notes",
      "Twitter, Slack, calendar capture",
    ],
    url: "https://mem.ai",
    rating: 4.2,
    logo: memLogo,
  },
  {
    slug: "taskade",
    name: "Taskade",
    tagline: "AI agents for tasks, projects, and team workflows.",
    description:
      "Taskade combines tasks, mind-maps, and customizable AI agents that automate workflows across teams. AI Agent Builder lets non-technical users design specialized agents (research, coding, writing). Free for personal use; Pro at $8/month, Team at $16/seat/month.",
    category: "productivity",
    categories: ["productivity", "writing"],
    pricing: "Freemium",
    features: [
      "Custom AI agents",
      "Mind maps + outlines + kanban",
      "Real-time team collaboration",
      "Project templates",
      "Generous free tier",
    ],
    url: "https://taskade.com",
    rating: 4.3,
    logo: taskadeLogo,
  },

  // -------- DESIGN --------
  {
    slug: "figma-ai",
    name: "Figma AI",
    tagline: "AI features built into Figma — search, generate, prototype.",
    description:
      "Figma AI adds Make Designs (generate from a prompt), Visual Search (find similar components in your file), automatic layer rename, and First Draft prototype generation directly inside Figma. Bundled with paid Figma plans; free preview while in beta. The default for design teams already in Figma.",
    category: "design",
    categories: ["design"],
    pricing: "Freemium",
    features: [
      "Make Designs (prompt → frame)",
      "Visual Search across files",
      "Auto-rename layers",
      "First Draft (prototype generation)",
      "Asset replace and recolor",
    ],
    url: "https://figma.com",
    rating: 4.4,
    logo: figmaAiLogo,
  },
  {
    slug: "framer-ai",
    name: "Framer AI",
    tagline: "Generate publishable websites from a prompt.",
    description:
      "Framer AI turns a description into a full responsive website — layout, copy, images, and interactions — that you can edit visually and publish in one click with hosting included. Best in class for marketing sites and portfolios. Free tier with .framer.website domain; Mini at $5/month for custom domain.",
    category: "design",
    categories: ["design"],
    pricing: "Freemium",
    features: [
      "Prompt → full responsive site",
      "Visual editor (no-code)",
      "One-click publishing + hosting",
      "Animations and interactions",
      "CMS and forms built-in",
    ],
    url: "https://framer.com",
    rating: 4.4,
    logo: framerAiLogo,
  },
  {
    slug: "uizard",
    name: "Uizard",
    tagline: "Turn sketches and screenshots into editable UI designs.",
    description:
      "Upload a hand-drawn sketch or a screenshot and Uizard converts it to an editable Figma-style mockup with detected components and a generated theme. Free Starter; Pro at $19/month adds higher project limits and AI Theme Generator.",
    category: "design",
    categories: ["design"],
    pricing: "Freemium",
    features: [
      "Sketch-to-UI conversion",
      "Screenshot-to-UI",
      "Theme generator",
      "Auto-component detection",
      "Figma export",
    ],
    url: "https://uizard.io",
    rating: 4.1,
    logo: uizardLogo,
  },
  {
    slug: "galileo-ai",
    name: "Galileo AI",
    tagline: "Generate editable UI designs from text descriptions.",
    description:
      "Galileo produces high-fidelity, Figma-ready UI screens from natural-language briefs in seconds. Acquired by Google in 2024; the team's tech now powers Stitch (Google's design tool) but Galileo remains available for direct use. Free tier with limited generations; paid plans for production work.",
    category: "design",
    categories: ["design"],
    pricing: "Freemium",
    features: [
      "Text-to-UI generation",
      "Figma export with components",
      "iOS, Android, Web layouts",
      "Now part of Google",
      "Variations and refinement",
    ],
    url: "https://usegalileo.ai",
    rating: 4.2,
    logo: galileoAiLogo,
  },
  {
    slug: "recraft",
    name: "Recraft",
    tagline: "AI image generation built for designers.",
    description:
      "Recraft creates vectors, icons, illustrations, and brand-consistent images with a fine-tuned design-focused model (Recraft V3). Native SVG output is rare among image generators. Free tier 50 credits/day; Basic at $12/month for 1,000 monthly credits.",
    category: "design",
    categories: ["design", "image"],
    pricing: "Freemium",
    features: [
      "Native vector / SVG output",
      "Brand styles (consistent look)",
      "Recraft V3 model",
      "Mockups and ad creative",
      "Editable raster + vector mix",
    ],
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
      "Upload a spreadsheet or connect a database and Julius runs analyses, generates charts, and writes Python in the background — all explained in plain English. Excellent for non-coders doing real exploratory analysis. Free tier 15 messages/month; Standard at $20/month for 250 messages.",
    category: "data",
    categories: ["data", "productivity"],
    pricing: "Freemium",
    features: [
      "Chat with CSVs and databases",
      "Auto-generate charts and tables",
      "Python notebooks under the hood",
      "Forecasting and regression",
      "Export to PDF / PowerPoint",
    ],
    url: "https://julius.ai",
    rating: 4.5,
    logo: juliusAiLogo,
  },
  {
    slug: "rows",
    name: "Rows",
    tagline: "AI-native spreadsheet with built-in integrations.",
    description:
      "Rows is a modern spreadsheet with AI formulas (=ASK, =CLASSIFY), 50+ integrations to HubSpot / Salesforce / Stripe / GA4, and shareable interactive dashboards. Generous free tier including AI Analyst; Plus at $8/seat/month adds higher API limits.",
    category: "data",
    categories: ["data", "productivity"],
    pricing: "Freemium",
    features: [
      "AI formulas (=ASK, =CLASSIFY)",
      "50+ data integrations",
      "Live shareable dashboards",
      "AI Analyst (chat with sheet)",
      "Strong free tier",
    ],
    url: "https://rows.com",
    rating: 4.3,
    logo: rowsLogo,
  },
  {
    slug: "numerous",
    name: "Numerous",
    tagline: "ChatGPT inside Google Sheets and Excel.",
    description:
      "Numerous adds AI formulas to your existing spreadsheets — categorize, extract, and write at scale across thousands of rows. Drag-down to fill thousands of rows in one go. Free 50 runs/month; Plus at $19/month for 500 runs and team sharing.",
    category: "data",
    categories: ["data", "productivity"],
    pricing: "Freemium",
    features: [
      "AI formulas in Sheets / Excel",
      "Bulk categorization and extraction",
      "Web scraping inside cells",
      "Sentiment and translation",
      "No code or notebooks",
    ],
    url: "https://numerous.ai",
    rating: 4.2,
    logo: numerousLogo,
  },
  {
    slug: "akkio",
    name: "Akkio",
    tagline: "No-code AI for predictive analytics.",
    description:
      "Akkio lets non-technical users train predictive models on their data — churn, lead scoring, forecasting, ad targeting — in minutes. Strong CRM integrations (HubSpot, Salesforce). Pricing starts at $49/month Basic; Professional at $999/month for full predictive suite.",
    category: "data",
    categories: ["data", "marketing"],
    pricing: "Paid",
    features: [
      "No-code ML model training",
      "Predictive forecasting",
      "Lead scoring + churn",
      "CRM integrations",
      "Generative reports",
    ],
    url: "https://akkio.com",
    rating: 4.2,
    logo: akkioLogo,
  },
  {
    slug: "obviously-ai",
    name: "Obviously AI",
    tagline: "No-code predictive analytics for business teams.",
    description:
      "Connect a database or CSV and Obviously AI auto-builds prediction models with explanations a non-technical user can act on. API deployment and Snowflake / BigQuery connectors. Pricing starts at $99/month Pilot; production plans negotiated.",
    category: "data",
    categories: ["data", "marketing"],
    pricing: "Paid",
    features: [
      "AutoML with explanations",
      "Plain-language predictions",
      "API deployment",
      "Snowflake + BigQuery connectors",
      "Scenario simulations",
    ],
    url: "https://obviously.ai",
    rating: 4.0,
    logo: obviouslyAiLogo,
  },

  // -------- MARKETING --------
  {
    slug: "jasper-marketing",
    name: "Jasper for Enterprise",
    tagline: "Jasper's enterprise marketing and brand suite.",
    description:
      "The enterprise tier of Jasper for marketing departments — campaign briefs, persistent brand voice memory, knowledge base, multi-channel campaign tools, and SSO/audit-log security. Pricing custom (typically $69+/seat/month). For marketing teams already standardized on Jasper.",
    category: "marketing",
    categories: ["marketing"],
    pricing: "Paid",
    features: [
      "Campaign briefs and outputs",
      "Brand voice memory (multi-brand)",
      "Knowledge base",
      "SSO + audit logs",
      "Marketing-specific templates",
    ],
    url: "https://jasper.ai/products/marketing",
    rating: 4.1,
    logo: jasperMarketingLogo,
  },
  {
    slug: "hubspot-ai",
    name: "HubSpot AI",
    tagline: "AI features across HubSpot's CRM and marketing suite.",
    description:
      "HubSpot AI ships Breeze (the platform-wide copilot), Breeze Agents (autonomous customer agents), content remixing, and predictive lead/deal scoring across HubSpot CRM. Bundled with HubSpot plans; free tier on the CRM includes basic Breeze features.",
    category: "marketing",
    categories: ["marketing"],
    pricing: "Freemium",
    features: [
      "Breeze copilot across CRM",
      "Breeze Agents (autonomous)",
      "Content remixing and SEO",
      "Predictive lead scoring",
      "Built into HubSpot CRM",
    ],
    url: "https://hubspot.com/artificial-intelligence",
    rating: 4.4,
    logo: hubspotAiLogo,
  },
  {
    slug: "surfer-seo",
    name: "Surfer SEO",
    tagline: "AI-powered SEO content optimization.",
    description:
      "Surfer audits and writes content optimized for search — keyword density, structure, internal linking, NLP entity coverage — backed by SERP data. Surfer AI generates full optimized articles in one click. Essential plan $89/month; Scale and Enterprise above.",
    category: "marketing",
    categories: ["marketing", "writing"],
    pricing: "Paid",
    features: [
      "SERP analyzer",
      "Surfer AI article generator",
      "Content audit and rewrite",
      "Internal-link suggestions",
      "Keyword research integration",
    ],
    url: "https://surferseo.com",
    rating: 4.4,
    logo: surferSeoLogo,
  },
  {
    slug: "copy-ai-marketing",
    name: "Copy.ai for Go-To-Market",
    tagline: "Copy.ai's GTM AI platform for sales and marketing automation.",
    description:
      "Copy.ai's enterprise tier focuses on GTM workflows — outbound sequences, deal research, account-based marketing, and lifecycle automation. Workflows orchestrate prompts and integrations end-to-end. Pricing is custom; team plans typically start at $49/seat/month for the workflow tier.",
    category: "marketing",
    categories: ["marketing"],
    pricing: "Paid",
    features: [
      "GTM workflow automation",
      "Account research and intent",
      "Outbound sequence generation",
      "ABM personalization at scale",
      "CRM and sales-tool integrations",
    ],
    url: "https://copy.ai/gtm-ai-platform",
    rating: 4.0,
    logo: copyAiMarketingLogo,
  },
  {
    slug: "rytr",
    name: "Rytr",
    tagline: "Affordable AI copywriter for solopreneurs.",
    description:
      "Rytr offers 40+ writing templates at one of the lowest price points in the AI copywriting category — popular with solopreneurs and small marketing teams who want to ship copy on a small budget. Free 10k characters/month; Saver at $7.50/month for 100k.",
    category: "writing",
    categories: ["writing", "marketing"],
    pricing: "Freemium",
    features: [
      "40+ copy templates",
      "30+ languages",
      "Plagiarism check",
      "Browser extension",
      "Cheapest paid tier in category",
    ],
    url: "https://rytr.me",
    rating: 4.2,
    logo: rytrLogo,
  },
] as const

// Module-load validation: throws at dev-server start AND during `vite build`.
// FOUND-07 structural prevention of duplicate-slug bugs.
__validateSlugsUnique(TOOLS)
__validateLogosPresent(TOOLS)
__validateCategoriesShape(TOOLS)
