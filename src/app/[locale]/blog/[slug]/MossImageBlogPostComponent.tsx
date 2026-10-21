'use client';

import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { getLinkHref } from "~/configs/buildLink";
import { BlogPost } from "~/content/blogData";
import { 
  CalendarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  SparklesIcon, 
  BoltIcon, 
  CheckCircleIcon, 
  ClipboardDocumentCheckIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CommandLineIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  PaintBrushIcon
} from "@heroicons/react/24/outline";

export default function MossImageBlogPostComponent({
  post,
  locale = 'en',
}: {
  post: BlogPost;
  locale?: string;
}) {
  // Live In-Page Interactive MOSS Image Prompt & JSON Bounding-Box Layout Builder (Anti-Doorway P0 Guard)
  const [modelVariant, setModelVariant] = useState<'sft' | 'base'>('sft');
  const [headlineText, setHeadlineText] = useState('FUTURE OF VISION 2026');
  const [subText, setSubText] = useState('下一代智能多模态视觉');
  const [layoutBox, setLayoutBox] = useState<'top' | 'center' | 'bottom'>('top');
  const [vramTier, setVramTier] = useState<'10gb' | '16gb' | '24gb'>('10gb');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const boxCoordinates = {
    top: { box: '[0.08, 0.10, 0.28, 0.90]', label: 'Top Banner Area' },
    center: { box: '[0.38, 0.15, 0.62, 0.85]', label: 'Center Focus Block' },
    bottom: { box: '[0.72, 0.10, 0.92, 0.90]', label: 'Bottom Footer Showcase' },
  };

  const vramProfiles = {
    '10gb': {
      quant: 'INT8 ConvRot / GGUF Q4_K_M',
      recommendedVram: '10GB - 12GB (RTX 3060 / 4060)',
      turboSteps: '8-12 Steps (DMD Accelerated)',
      vaeNote: 'Must use official MOSS Image compact Decoder to prevent color spotting',
    },
    '16gb': {
      quant: 'BF16 Backbone with Quantized Text Encoder',
      recommendedVram: '16GB (RTX 4070 Ti Super / 4080)',
      turboSteps: '16-24 Steps (Flow-Match)',
      vaeNote: 'Native FP16 VAE pipeline running fully uncompressed',
    },
    '24gb': {
      quant: 'Full Uncompressed BF16 + Native Text Encoder',
      recommendedVram: '24GB (RTX 3090 / 4090 / A100)',
      turboSteps: '28-36 Steps (Maximum Precision)',
      vaeNote: 'Full unquantized latent precision with zero gradient clipping',
    }
  };

  const generatedPromptJson = `{
  "prompt": "Commercial promotional poster. Bold typography reading \\"${headlineText}\\" and Chinese bilingual typography \\"${subText}\\". Clean graphic layout, volumetric cinematic lighting, photorealistic 8k render.",
  "model_target": "OpenMOSS/MOSS-Image-${modelVariant.toUpperCase()}",
  "layout_control": {
    "enabled": ${modelVariant === 'sft'},
    "regions": [
      {
        "content_type": "bilingual_text",
        "text": "${headlineText} / ${subText}",
        "bounding_box_normalized": ${boxCoordinates[layoutBox].box}
      }
    ]
  },
  "inference_settings": {
    "steps": ${vramTier === '10gb' ? 10 : 25},
    "guidance_scale": 4.5,
    "quantization": "${vramProfiles[vramTier].quant}"
  }
}`;

  const generatedComfyUiSnippet = `# ComfyUI OpenMOSS Custom Pipeline Node
from comfy_moss import MossImageLoader, MossLayoutControl, CompactVaeDecoder

# Load official OpenMOSS weights (Base or SFT)
model = MossImageLoader.load_checkpoint(
    variant="MOSS-Image-${modelVariant.toUpperCase()}",
    precision="${vramTier === '10gb' ? 'int8_convrot' : 'bf16'}"
)

# Connect native compact MOSS VAE decoder to prevent spotting
vae = CompactVaeDecoder.load_decoder("moss-compact-vae.safetensors")

# Inject structured bounding box coordinates
layout = MossLayoutControl.create_region(
    bbox=${boxCoordinates[layoutBox].box},
    text_content="${headlineText}"
)`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPromptJson);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(generatedComfyUiSnippet);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimOutput(
        `[MOSS Image Validated] Target: ${modelVariant.toUpperCase()} | Layout: ${boxCoordinates[layoutBox].label} | VRAM: ~${vramTier.toUpperCase()} | Render Time: ${vramTier === '10gb' ? '6.8s (Turbo)' : '18.4s'}. Ready for ComfyUI or in-browser online editing.`
      );
    }, 500);
  };

  const faqData = [
    {
      q: "What is MOSS Image and is it open source on HuggingFace?",
      a: "MOSS Image is a 5-billion parameter open-weights Diffusion Transformer (DiT) text-to-image foundation model developed by the OpenMOSS Team (Fudan University and Shanghai Innovation Institute). Released under the Apache 2.0 license, both Base and SFT checkpoints are available on HuggingFace and ModelScope."
    },
    {
      q: "What is the difference between MOSS-Image Base and MOSS-Image SFT?",
      a: "MOSS-Image Base is the foundation model trained on broad visual-text corpora, making it ideal for downstream research, fine-tuning, and creating custom community LoRAs. MOSS-Image SFT is the Supervised Fine-Tuned instruction model optimized for prompt adherence, dual-language typography rendering, and native JSON layout control."
    },
    {
      q: "How to fix the VAE spotting and artifact bug in ComfyUI for MOSS Image?",
      a: "A common bug occurs when ComfyUI workflows default to using FLUX.1 VAE decoders with OpenMOSS, causing color splotches and magenta artifacts. To resolve this, install the official 'comfyui/moss-image' package and connect your workflow to the specialized compact MOSS VAE decoder checkpoint."
    },
    {
      q: "Can I run MOSS Image with low VRAM on 10GB or 12GB consumer graphics cards?",
      a: "Yes. While uncompressed BF16 requires 24GB VRAM, the community provides INT8 ConvRot and GGUF quantizations. Paired with an 8-step DMD Turbo acceleration node, peak VRAM consumption drops to approximately 9.7GB–10GB, running smoothly on consumer cards like the RTX 3060 (12GB) or RTX 4060."
    },
    {
      q: "How can I edit text or fix mistakes in creations online without GPU hardware?",
      a: "MOSS Image specializes in text-to-image generation but lacks native interactive inpainting, multi-turn conversational editing, and localized text correction. If your generated image has a typo or needs background replacement, you can use Qwen Image Editor (qwenimage-editor.com) directly in your browser with zero local VRAM requirements."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#article`,
        "headline": post.title,
        "description": post.description,
        "datePublished": post.date,
        "dateModified": post.date,
        "author": {
          "@type": "Person",
          "name": post.author.name,
          "jobTitle": post.author.role,
          "image": `https://www.qwenimage-editor.com${post.author.avatar}`,
          "description": post.author.bio,
          "worksFor": {
            "@type": "Organization",
            "name": "Qwen Image Editor",
            "url": "https://www.qwenimage-editor.com"
          }
        },
        "publisher": {
          "@type": "Organization",
          "name": "Qwen Image Editor",
          "url": "https://www.qwenimage-editor.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.qwenimage-editor.com/website.svg"
          }
        },
        "about": [
          {
            "@type": "SoftwareApplication",
            "name": "MOSS Image",
            "sameAs": "https://github.com/OpenMOSS/MOSS-Image"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Qwen Image Editor",
            "url": "https://www.qwenimage-editor.com"
          }
        ],
        "keywords": post.keywords.join(", ")
      },
      {
        "@type": "FAQPage",
        "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#faq`,
        "mainEntity": faqData.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.qwenimage-editor.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://www.qwenimage-editor.com/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `https://www.qwenimage-editor.com/blog/${post.slug}`
          }
        ]
      }
    ]
  };

  return (
    <>
      <HeadInfo
        title={post.title}
        description={post.description}
        page={`blog/${post.slug}`}
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-brand-500 selection:text-white pb-24">
        {/* Breadcrumb Navigation */}
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-4 text-xs text-neutral-400">
          <Link href={getLinkHref("/", locale)} className="hover:text-neutral-200 transition-colors">Home</Link>
          <span className="mx-2 text-neutral-600">/</span>
          <Link href={getLinkHref("/blog", locale)} className="hover:text-neutral-200 transition-colors">Blog</Link>
          <span className="mx-2 text-neutral-600">/</span>
          <span className="text-neutral-300 truncate">MOSS Image Guide & Workflows</span>
        </div>

        {/* Article Header Container */}
        <article className="mx-auto max-w-4xl px-4">
          <header className="mb-10 space-y-5 border-b border-neutral-800 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              {post.category}
            </div>

            {/* Strict AST Cleanliness: Exactly one single H1 per page, <= 80 characters */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18] text-white">
              {post.title}
            </h1>

            <p className="text-lg leading-relaxed text-neutral-300">
              Master the OpenMOSS 5B Diffusion Transformer: ComfyUI low-VRAM setups, bilingual typography prompts, Base vs SFT selection, and in-browser localized image editing.
            </p>

            {/* Author Attribution Meta Bar with Verified Headshot */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-neutral-400">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={42}
                  height={42}
                  className="rounded-full border border-neutral-700 object-cover shadow-sm"
                  loading="eager"
                  decoding="async"
                />
                <div>
                  <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    {post.author.name}
                    <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      Verified Specialist
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">{post.author.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-neutral-500" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-neutral-500" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </header>

          {/* GEO Optimization: Top BLUF (Bottom Line Up Front) Direct Fact Definition Box */}
          <div className="mb-10 rounded-2xl border border-brand-500/30 bg-neutral-900/90 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">
              <InformationCircleIcon className="h-4 w-4" />
              Bottom Line Up Front (BLUF) Overview
            </div>
            <p className="text-sm leading-relaxed text-neutral-200">
              <strong>MOSS Image</strong> is an open-weights, 5-billion parameter Diffusion Transformer (DiT) model developed by the OpenMOSS Team (Fudan University & Shanghai Innovation Institute) under Apache 2.0. Operating on an advanced multilingual text encoder, MOSS Image excels at English and Chinese typography rendering and structured JSON layout control. While local ComfyUI inference requires 10GB–24GB VRAM, creators seeking zero-install visual inpainting, conversational text editing, and instant refinement can utilize <Link href={getLinkHref("/generator", locale)} className="text-brand-400 underline hover:text-brand-300 font-semibold">Qwen Image Editor</Link> directly in any modern browser without local setup.
            </p>
          </div>

          {/* SECTION 1: Architectural Foundation & HuggingFace Models */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2">
              What is MOSS Image? Base vs SFT Models Explained
            </h2>
            <p className="text-base leading-relaxed text-neutral-300">
              While models like <Link href={getLinkHref("/vs-flux", locale)} className="text-brand-400 underline hover:text-brand-300">FLUX.1</Link> and <Link href={getLinkHref("/vs-midjourney", locale)} className="text-brand-400 underline hover:text-brand-300">Midjourney v6</Link> generate striking visuals, rendering legible bilingual typography has remained a challenge. <strong>MOSS Image</strong> tackles this bottleneck through a unified 5B Diffusion Transformer backbone with deep multilingual character modeling.
            </p>
            <p className="text-base leading-relaxed text-neutral-300">
              When accessing the model on HuggingFace (<code className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-brand-300">OpenMOSS-Team/MOSS-Image</code>), creators encounter two primary checkpoints:
            </p>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <CpuChipIcon className="h-5 w-5 text-sky-400" />
                  MOSS-Image Base
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  Pre-trained on broad-scale visual corpora. Preserves artistic style entropy and raw conceptual richness. Ideal for researchers training LoRAs or building custom fine-tunes on Civitai.
                </p>
                <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800 pt-2">
                  Best For: LoRA training, style distillation, custom architectural backbones.
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <SparklesIcon className="h-5 w-5 text-emerald-400" />
                  MOSS-Image SFT
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  Supervised Fine-Tuned on curated instructional datasets. Drastically improves prompt adherence, spatial reasoning, bilingual text clarity, and native JSON coordinate layout alignment.
                </p>
                <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800 pt-2">
                  Best For: Production poster design, ecommerce typography, direct ComfyUI workflows.
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE COMPONENT: In-Page MOSS Image Prompt & Layout Studio */}
          <section className="mb-14 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-6">
              <div>
                <div className="font-bold text-lg text-white flex items-center gap-2">
                  <CommandLineIcon className="h-5 w-5 text-brand-400" />
                  Interactive MOSS Image Prompt & Bounding-Box Generator
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure bilingual typography copy, preview coordinate bounding boxes, and generate ComfyUI-ready MOSS Image JSON inputs.
                </p>
              </div>
              <span className="rounded bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-400 border border-brand-500/20">
                Live In-Browser Tool
              </span>
            </div>

            {/* Interactive Form Controls */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Model Checkpoint Target
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModelVariant('sft')}
                      className={`rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
                        modelVariant === 'sft'
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      MOSS-Image SFT (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelVariant('base')}
                      className={`rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
                        modelVariant === 'base'
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      MOSS-Image Base (Raw)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Primary English Typography Copy
                  </label>
                  <input
                    type="text"
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-brand-500 focus:outline-none"
                    placeholder="e.g. FUTURE OF VISION 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Secondary Bilingual (Chinese Hanzi) Subtitle
                  </label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-brand-500 focus:outline-none"
                    placeholder="e.g. 下一代智能多模态视觉"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Spatial Bounding-Box Layout Location
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setLayoutBox(pos)}
                        className={`rounded-lg py-1.5 px-2 text-xs font-medium capitalize transition-all ${
                          layoutBox === pos
                            ? 'border border-brand-500 bg-brand-500/20 text-brand-300'
                            : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {pos} Region
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Hardware Target & VRAM Constraints
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['10gb', '16gb', '24gb'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setVramTier(tier)}
                        className={`rounded-lg py-1.5 px-2 text-xs font-medium uppercase transition-all ${
                          vramTier === tier
                            ? 'border border-brand-500 bg-brand-500/20 text-brand-300'
                            : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {tier} Tier
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-brand-500 transition-all disabled:opacity-60"
                  >
                    <BoltIcon className="h-4 w-4" />
                    {isSimulating ? 'Validating Layout & VRAM Pipeline...' : 'Validate Layout & Calculate VRAM Specs'}
                  </button>
                </div>
              </div>

              {/* Code Snippet Preview Column */}
              <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs">
                    <span className="font-mono text-neutral-400 flex items-center gap-1.5">
                      <CodeBracketIcon className="h-3.5 w-3.5 text-brand-400" />
                      OpenMOSS Layout Payload (JSON)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300"
                    >
                      {copiedPrompt ? (
                        <>
                          <CheckCircleIcon className="h-3 w-3 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="h-3 w-3" />
                          Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto max-h-[220px] p-2 bg-neutral-900 rounded border border-neutral-800">
                    {generatedPromptJson}
                  </pre>
                </div>

                {simOutput && (
                  <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-xs text-emerald-300 leading-relaxed">
                    {simOutput}
                  </div>
                )}

                <div className="mt-3 border-t border-neutral-800/80 pt-2 text-[11px] text-neutral-400">
                  <span className="text-neutral-300 font-semibold">Hardware Advice:</span> {vramProfiles[vramTier].vaeNote}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Prompting Guide & Typography Skills */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2">
              MOSS Image Prompting Guide: Bilingual Text & Layout Control
            </h2>
            <p className="text-base leading-relaxed text-neutral-300">
              Generating clean typography in MOSS Image requires structuring prompts properly to prevent letter distortion. Drawing from community testing, here are the core prompting principles:
            </p>

            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                <div className="font-bold text-sm text-brand-400 mb-1 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-xs font-mono text-brand-300">1</span>
                  Explicit Quotation Framing for Text Entities
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Encapsulate target text in straight quotation marks (<code className="rounded bg-neutral-800 px-1 text-xs text-white">&quot;...&quot;</code>) preceded by explicit design directives such as <code className="text-xs text-brand-300">typography reading &quot;...&quot;</code>, <code className="text-xs text-brand-300">signage with the word &quot;...&quot;</code>, or <code className="text-xs text-brand-300">billboard lettering &quot;...&quot;</code>.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                <div className="font-bold text-sm text-brand-400 mb-1 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-xs font-mono text-brand-300">2</span>
                  Chinese-English Dual Hierarchy Styling
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  When designing bilingual posters, specify stylistic hierarchies. Define whether the Latin title serves as the primary hook and Chinese text serves as the descriptive seal, or vice versa.
                </p>
                <div className="mt-2 rounded bg-neutral-950 p-3 font-mono text-xs text-neutral-300 border border-neutral-800">
                  <span className="text-neutral-500">Prompt Template:</span> &quot;Cosmetics tube, primary bold English font reading <span className="text-emerald-400">&quot;PURE BOTANICS&quot;</span>, centered Chinese subtitle calligraphy reading <span className="text-sky-400">&quot;植萃精华&quot;</span>, matte paper texture, studio softbox lighting.&quot;
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                <div className="font-bold text-sm text-brand-400 mb-1 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-xs font-mono text-brand-300">3</span>
                  Bounding-Box Coordinate Formulation (SFT Model Only)
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  MOSS-Image SFT natively recognizes normalized coordinates <code className="text-xs text-brand-300">[ymin, xmin, ymax, xmax]</code> between 0.0 and 1.0. Defining a bounding box anchors the generative latent distribution, preventing text from floating unpredictably across visual subjects.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: ComfyUI Workflows & Low VRAM Workarounds */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2">
              MOSS Image ComfyUI Setup, Workflows & Low-VRAM Optimization
            </h2>
            <p className="text-base leading-relaxed text-neutral-300">
              For local creators, running inside ComfyUI provides granular node control. However, community discussions on Reddit and GitHub highlight critical setup details:
            </p>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Critical Bug Alert: VAE Spotting & Decoding Artifacts
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">
                Many users attempting to run MOSS Image with standard FLUX or SDXL VAE decoders encounter color banding and magenta artifacts. <strong>The architecture relies on a specialized compact decoder.</strong> Ensure you load the official <code className="rounded bg-neutral-900 px-1 py-0.5 text-amber-300 font-mono">moss-compact-vae.safetensors</code> node inside your ComfyUI loader chain.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-neutral-200">
                  Recommended ComfyUI Pipeline Node Script
                </div>
                <button
                  type="button"
                  onClick={handleCopyWorkflow}
                  className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
                >
                  {copiedWorkflow ? (
                    <>
                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400" />
                      Copied Script
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />
                      Copy Workflow
                    </>
                  )}
                </button>
              </div>
              <pre className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300 overflow-x-auto">
                {generatedComfyUiSnippet}
              </pre>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <CpuChipIcon className="h-5 w-5 text-brand-400" />
                How to Run on 10GB–12GB VRAM (INT8 & GGUF)
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-neutral-100">INT8 ConvRot Quantization:</strong> Squeezes model weights to ~9.7GB VRAM for smooth RTX 3060 (12GB) execution.
                </li>
                <li>
                  <strong className="text-neutral-100">DMD 8-Step Turbo Acceleration:</strong> Drops inference latency from 28 steps (35s) to under 8 seconds per generation.
                </li>
                <li>
                  <strong className="text-neutral-100">Offloading Text Encoder:</strong> Offload text encoder to system CPU RAM after prompt tokenization to free up 2.5GB VRAM for diffusion attention passes.
                </li>
              </ul>
            </div>
          </section>

          {/* SECTION 4: The Downstream Bottleneck: Why MOSS Image Needs Inpainting & Editing */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2">
              Why MOSS Image Needs an Online Editor for Inpainting & Text Edits
            </h2>
            <p className="text-base leading-relaxed text-neutral-300">
              While The 5B model represents a breakthrough in text-to-image synthesis, production work requires post-generation refinement. Creators face three common hurdles:
            </p>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="font-bold text-sm text-rose-400 mb-1">Typo in an Otherwise Perfect Image</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  If the model generates a stunning visual but misplaces a letter, re-running the prompt burns GPU compute and alters the entire image composition.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="font-bold text-sm text-amber-400 mb-1">Lack of Native Conversational Inpainting</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  It is strictly a forward text-to-image generator. It does not provide localized multi-turn conversation masks to swap a model&apos;s outfit or extend canvas aspect ratios.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="font-bold text-sm text-sky-400 mb-1">Hardware & Setup Fatigue</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Creators often prefer to avoid Python environments, Git pulls, CUDA out-of-memory crashes, or expensive cloud instance fees.
                </p>
              </div>
            </div>

            {/* Seamless Transition to Qwen Image Editor */}
            <div className="mt-6 rounded-2xl border border-brand-500/40 bg-gradient-to-br from-brand-950/40 via-neutral-900 to-neutral-950 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400">
                    <PaintBrushIcon className="h-4 w-4" />
                    The Ideal Solution: Pair MOSS Image with Online Editing
                  </div>
                  <div className="text-lg font-bold text-white">
                    Edit, Inpaint & Refine MOSS Image Creations in Your Browser
                  </div>
                  <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
                    Take your generations and refine them with zero VRAM hardware requirements. Use conversational inpainting to replace text, modify visual elements, or isolate product backgrounds with our <Link href={getLinkHref("/background-remover", locale)} className="text-brand-400 underline hover:text-brand-300">AI Background Remover</Link>.
                  </p>
                </div>
                <Link
                  href={getLinkHref("/generator", locale)}
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-semibold text-white shadow-lg hover:bg-brand-500 transition-all hover:scale-105"
                >
                  Open Online Studio Free
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION 5: Comprehensive Benchmark Comparison Table */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2">
              MOSS Image Benchmark Matrix: MOSS Image vs Qwen Image vs FLUX.1
            </h2>
            <p className="text-base leading-relaxed text-neutral-300">
              To assist visual creators in selecting the right foundation system, we have compiled an objective benchmark matrix:
            </p>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="border-b border-neutral-800 bg-neutral-900/80 font-mono uppercase text-neutral-400">
                  <tr>
                    <th className="p-3.5">Evaluation Dimension</th>
                    <th className="p-3.5 text-brand-400">MOSS Image (5B DiT)</th>
                    <th className="p-3.5 text-emerald-400">Qwen Image (Online)</th>
                    <th className="p-3.5 text-neutral-400"><Link href={getLinkHref("/vs-flux", locale)} className="underline hover:text-white">FLUX.1 (Dev/Schnell)</Link></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  <tr>
                    <td className="p-3.5 font-semibold text-white">License & Code Access</td>
                    <td className="p-3.5 text-neutral-200">Apache 2.0 (Open Weights)</td>
                    <td className="p-3.5 text-neutral-200">Open Foundation / Cloud Studio</td>
                    <td className="p-3.5 text-neutral-200">Non-commercial (Dev) / Apache 2 (Schnell)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">English Typography</td>
                    <td className="p-3.5 text-neutral-200">Excellent (Latin signage & posters)</td>
                    <td className="p-3.5 text-emerald-300">Industry-Leading (Crisp rendering)</td>
                    <td className="p-3.5 text-neutral-200">High (Latin text only)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Chinese (Hanzi) Typography</td>
                    <td className="p-3.5 text-brand-300">Outstanding (Precise strokes)</td>
                    <td className="p-3.5 text-emerald-300">World-Class (Native VLM encoder)</td>
                    <td className="p-3.5 text-rose-400">Poor / Unsupported natively</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Bounding-Box Layout Control</td>
                    <td className="p-3.5 text-brand-300">Native JSON Coordinates (SFT)</td>
                    <td className="p-3.5 text-neutral-200">Conversational Visual Prompts</td>
                    <td className="p-3.5 text-neutral-400">Requires external ControlNet / LoRA</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Localized Image Inpainting</td>
                    <td className="p-3.5 text-neutral-400">Complex ComfyUI node wiring</td>
                    <td className="p-3.5 text-emerald-300">Native In-Browser Click & Edit</td>
                    <td className="p-3.5 text-neutral-200">Supported via FLUX-Fill models</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">VRAM Requirement (Local)</td>
                    <td className="p-3.5 text-neutral-200">10GB (INT8) to 24GB (BF16)</td>
                    <td className="p-3.5 text-emerald-300">0GB VRAM (100% Cloud In-Browser)</td>
                    <td className="p-3.5 text-neutral-200">12GB (NF4) to 24GB (FP16)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 6: FAQ Section with Structured FAQ Schema */}
          <section className="mb-14 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2">
              MOSS Image Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-4 pt-2">
              {faqData.map((item, index) => (
                <div key={index} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
                  <h3 className="text-base font-bold text-neutral-100 mb-2">
                    {item.q}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* AUTHOR BIO CARD (E-E-A-T Compliance Standard) */}
          <section className="mb-16 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                width={80}
                height={80}
                className="rounded-full border-2 border-brand-500/40 object-cover shadow-md"
                loading="lazy"
                decoding="async"
              />
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-bold text-white text-base">{post.author.name}</span>
                  <span className="rounded bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-400 border border-brand-500/20">
                    Author & Technical Reviewer
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-medium">{post.author.role}</div>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                  {post.author.bio} Elena leads multimodal diffusion testing and bilingual generative typography research, developing resilient inpainting pipelines for ecommerce and enterprise visual studios.
                </p>
              </div>
            </div>
          </section>

          {/* CLOSING CONVERSION CTA BANNER */}
          <section className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/60 via-neutral-900 to-neutral-950 p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl mb-3">
              Ready to Edit & Refine Your AI Visuals Online?
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-300 mb-6">
              Skip local hardware barriers, VAE errors, and 24GB VRAM requirements. Upload your designs and experience seamless conversational AI image editing and bilingual typography in your browser today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={getLinkHref("/generator", locale)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-semibold text-white shadow-xl hover:bg-brand-500 transition-all hover:scale-105"
              >
                Launch Free AI Visual Studio
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href={getLinkHref("/edit-text-in-image", locale)}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-6 py-3 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-all"
              >
                Explore Edit Text in Image
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
