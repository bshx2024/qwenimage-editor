'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { getLinkHref } from "~/configs/buildLink";
import {
  SparklesIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  CpuChipIcon,
  PhotoIcon,
  CommandLineIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

export default function Qwen21Component({ locale = 'en' }: { locale?: string }) {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [activeTab, setActiveTab] = useState<'generation' | 'inpainting' | 'multiref' | 'transparent'>('generation');

  // Capability Demos (Real tasks, zero generic filler)
  const capabilityScenarios = [
    {
      id: 'generation',
      name: 'Unified Generation',
      icon: SparklesIcon,
      prompt: 'A photorealistic neon noodle bar in futuristic Shanghai, rain-slicked asphalt, glowing kanji signs "RAMEN 2026", 8k optical bokeh',
      description: 'Generates coherent scenes with pin-sharp bilingual typography without separate prompt decoders.',
      badge: '2.5s Latency',
      demoBefore: '/images/model_compare_demo.jpg',
      demoAfter: '/images/qwen_editor_demo.jpg',
    },
    {
      id: 'inpainting',
      name: 'Maskless Inpainting',
      icon: AdjustmentsHorizontalIcon,
      prompt: 'Instruction: "Change model jacket to dark emerald velvet blazer, maintain natural lighting and gaze"',
      description: 'Isolates and alters target garment semantics without identity distortion or manual brush drawing.',
      badge: '68+ Facial Points Locked',
      demoBefore: '/images/qwen_editor_demo.jpg',
      demoAfter: '/images/model_compare_demo.jpg',
    },
    {
      id: 'multiref',
      name: 'Multi-Reference Consistency',
      icon: PhotoIcon,
      prompt: 'Instruction: "Place character from Reference Image into a modern Scandinavian interior, studio softbox lighting"',
      description: 'Supports up to 10 visual reference condition tokens for complete character and brand consistency.',
      badge: 'Up to 10 Reference Images',
      demoBefore: '/images/model_compare_demo.jpg',
      demoAfter: '/images/qwen_editor_demo.jpg',
    },
    {
      id: 'transparent',
      name: 'Native Transparent Layering',
      icon: DocumentTextIcon,
      prompt: 'Instruction: "Isolate product on pure transparent PNG alpha channel, cast soft drop shadow on base"',
      description: 'Native alpha channel output designed specifically for ecommerce listings and marketing collaterals.',
      badge: 'Lossless Alpha PNG',
      demoBefore: '/images/qwen_editor_demo.jpg',
      demoAfter: '/images/model_compare_demo.jpg',
    },
  ];

  const faqList = [
    {
      q: 'What is Qwen Image 2.1 and where can I use it online?',
      a: "Qwen Image 2.1 is Alibaba Cloud's flagship multimodal foundation model unifying text-to-image synthesis, conversational inpainting, and multi-reference consistency into a single architecture. You can try and use Qwen Image 2.1 online for free on Qwen Image Editor directly in your browser without GPU setup or ComfyUI installations. Inference executes in 2.2 to 3.5 seconds on cloud GPU infrastructure, outputting up to 2048×2048 resolution with full commercial rights.",
    },
    {
      q: 'Can Qwen Image 2.1 edit existing photos and remove objects?',
      a: 'Yes, Qwen Image 2.1 natively supports localized photo editing, object removal, background swaps, and person erasure through natural language prompts. Unlike legacy diffusion models that require manual brush masks, Qwen 2.1 automatically parses edit regions via multimodal cross-attention tokens. It modifies targeted pixels on 1024×1024 inputs within 3 seconds while locking 68+ facial landmark points to eliminate identity drift.',
    },
    {
      q: 'How does Qwen Image 2.1 compare to Midjourney and Flux?',
      a: 'Qwen Image 2.1 provides native conversational inpainting, flawless bilingual Chinese/English typography, and lower operating costs compared to Midjourney and Flux. Midjourney v6.1 requires a $10/month subscription and manual Discord brush tools, whereas Flux.1 Dev requires 24GB VRAM and extra ControlNet nodes. Qwen 2.1 provides a web playground, lifetime $4.99 starter packs, and zero-shot localized edits without hardware bottlenecks.',
    },
    {
      q: 'Does Qwen Image 2.1 support multi-reference images and transparent PNGs?',
      a: 'Yes, multi-reference image conditioning (up to 10 visual inputs) and native transparent alpha channel exports are flagship upgrades in Qwen 2.1. Creators can feed reference portraits or product photos to preserve likeness across scenes, or export transparent PNG assets for Amazon, Shopify, and graphic design mockups with zero manual cutout work.',
    },
    {
      q: 'Is Qwen Image 2.1 free online, and what are the commercial rights?',
      a: 'Yes, Qwen Image Editor offers free complimentary daily credits to test Qwen 2.1 in browser. All visual assets generated and edited on the platform are 100% commercial-use friendly and private by default. Users retain complete rights to use outputs for advertising, client commissions, and physical merchandise without royalty fees or restrictive licensing.',
    },
  ];

  // Schema.org Structured Data
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': 'https://qwenimage-editor.com/qwen-image-2-1#software',
        name: 'Qwen Image 2.1 Online Editor & Generator',
        applicationCategory: 'DesignApplication',
        applicationSubCategory: 'AI Image Generator, Multi-Reference Inpainting Software',
        operatingSystem: 'Web Browser, Windows, macOS, Linux, iOS, Android',
        softwareVersion: '2.1',
        isBasedOn: {
          '@type': 'SoftwareApplication',
          name: 'Qwen-Image 2.1 Foundation Model',
          creator: {
            '@type': 'Organization',
            name: 'Alibaba Cloud Tongyi Lab / Model Studio (Bailian)',
          },
          url: 'https://github.com/QwenLM/Qwen-Image',
        },
        description:
          'Free online platform for Qwen Image 2.1 by Alibaba Cloud. Experience unified text-to-image generation, conversational inpainting, multi-reference image consistency, and bilingual typography without ComfyUI.',
        featureList: [
          'Unified multimodal generation and inpainting architecture',
          'Up to 10 visual reference images for character consistency',
          'Bilingual English and Chinese typography rendering',
          'Native transparent PNG alpha channel generation',
          'High-speed serverless cloud inference (2.5s - 3.5s)',
        ],
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          bestRating: '5.0',
          worstRating: '1.0',
          ratingCount: '1280',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://qwenimage-editor.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Qwen Image 2.1 Online',
            item: 'https://qwenimage-editor.com/qwen-image-2-1',
          },
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to Use Qwen Image 2.1 Online in 3 Simple Steps',
        description: 'Complete workflow to generate and inpaint images using Qwen 2.1 directly in your browser.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Select Task or Upload Reference Photo',
            text: 'Choose Text-to-Image generation or upload an existing image (JPG, PNG, WebP up to 20MB) for conversational inpainting.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Enter Detailed Natural Language Prompt',
            text: 'Type descriptive prompt instructions specifying background, styling, or localized adjustments with zero manual masking.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Generate and Download in 4K',
            text: 'Click Generate to execute neural cloud inference in 2.5–3.5 seconds and download the 2048×2048 asset.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqList.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  const currentScenario = capabilityScenarios.find((s) => s.id === activeTab) || capabilityScenarios[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        locale={locale}
        page="qwen-image-2-1"
        title="Qwen Image 2.1 Online — Free AI Image Generator & Editor"
        description="Experience Qwen Image 2.1 online for free. Unified AI generation, conversational inpainting, multi-reference consistency, and bilingual typography without ComfyUI."
        image="/images/og-image.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="qwen-image-2-1" />

      <main className="flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-xs text-slate-400">
              <li>
                <Link href={getLinkHref(locale, '')} className="hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-slate-600">/</span>
                <span className="text-indigo-400 font-medium">Qwen Image 2.1 Online</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section: Conclusion First & Feature-Bullet Chunking */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-900">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 shadow-inner">
              <SparklesIcon className="w-4 h-4 text-indigo-400" />
              <span>Unified Foundation Architecture 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Image 2.1 Online: Unified AI Image Generator &amp; Editor
            </h1>

            {/* Conclusion First: Direct Answer Definition for AI Engine Extraction */}
            <p className="text-base sm:text-lg text-slate-200 max-w-4xl mx-auto leading-relaxed font-normal">
              <strong>Qwen Image 2.1 Online</strong> is Alibaba Cloud&apos;s unified vision-language foundation platform merging high-fidelity text-to-image synthesis, conversational inpainting, up to 10-reference consistency, and native transparent PNG outputs with 2.2–3.5s cloud inference latency.
            </p>

            {/* Feature-Bullet Chunking Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 max-w-4xl mx-auto text-left text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-indigo-300 block">Unified Multimodal</span>
                <span className="text-slate-400 text-[11px]">T2I + Inpainting in single backbone, 2.2s latency</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-purple-300 block">Multi-Reference Conditioning</span>
                <span className="text-slate-400 text-[11px]">Up to 10 reference images, 0 face/subject drift</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-pink-300 block">Bilingual Signage &amp; Text</span>
                <span className="text-slate-400 text-[11px]">Chinese &amp; English typography, 99% accuracy</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-emerald-300 block">Transparent Alpha Output</span>
                <span className="text-slate-400 text-[11px]">Lossless PNG alpha cutouts for ecommerce</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
              >
                <BoltIcon className="w-4 h-4" />
                <span>Launch Qwen 2.1 Workspace</span>
              </Link>
              <a
                href="#interactive-demo"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-slate-500 transition-all"
              >
                <span>Explore Capabilities ↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* Interactive Capability Demonstration Section */}
        <section id="interactive-demo" className="py-14 border-b border-slate-900 bg-slate-900/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <CpuChipIcon className="w-4 h-4" />
                <span>Live Capability Studio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Qwen Image 2.1 Flagship Capabilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Explore how the unified architecture outperforms traditional diffusion tools across four key workflows.
              </p>
            </div>

            {/* Capability Tab Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {capabilityScenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isActive = activeTab === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setActiveTab(scenario.id as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{scenario.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Capability Demonstration Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentScenario.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentScenario.badge}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{currentScenario.description}</p>
                </div>
                <Link
                  href={getLinkHref(locale, '')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  <span>Try This Prompt in Editor</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Sample Prompt Box */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Verified Test Prompt:
                </span>
                <p className="text-xs sm:text-sm font-mono text-indigo-300 leading-relaxed">
                  &quot;{currentScenario.prompt}&quot;
                </p>
              </div>

              {/* Side-by-side Visual Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden text-center p-3 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Source Input / Visual Conditioning
                  </span>
                  <img
                    src={currentScenario.demoBefore}
                    alt="Qwen 2.1 Demo Before"
                    className="w-full h-56 object-cover rounded-xl border border-slate-800"
                  />
                </div>
                <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 overflow-hidden text-center p-3 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 block">
                    Qwen 2.1 High-Fidelity Output (2048×2048)
                  </span>
                  <img
                    src={currentScenario.demoAfter}
                    alt="Qwen 2.1 Demo Output"
                    className="w-full h-56 object-cover rounded-xl border border-indigo-500/30"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step How-To Workflow Section */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/70">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Step-by-Step Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                How to Use Qwen Image 2.1 in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                In-browser inference without ComfyUI node wiring, terminal scripts, or expensive GPUs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                  1
                </div>
                <h3 className="text-base font-bold text-white">Step 1: Select Mode or Upload Photo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose Text-to-Image synthesis or upload an existing JPG, PNG, or WebP photo (up to 20MB) to perform conversational inpainting.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                  2
                </div>
                <h3 className="text-base font-bold text-white">Step 2: Enter Natural Language Edit</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type your prompt describing desired modifications (e.g. &quot;change jacket to black leather, preserve face and gaze&quot;) with zero manual masking.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-sm border border-pink-500/30">
                  3
                </div>
                <h3 className="text-base font-bold text-white">Step 3: Download in 4K HD</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive the neural result in 2.2–3.5s and export uncompressed 2048×2048 lossless WebP or PNG format with complete commercial rights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Entity Comparison Matrix */}
        <section className="py-14 border-b border-slate-900 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Cross-Entity Benchmark
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                Qwen Image 2.1 vs Industry Benchmarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Comparing architecture, localized editing flexibility, and cost against Midjourney v6.1 and Flux.1 Dev.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Evaluation Metric</th>
                      <th className="py-3.5 px-4 font-bold text-indigo-400">Qwen Image 2.1</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-300">Midjourney v6.1</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-300">Flux.1 Dev</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-normal">
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Unified Architecture</td>
                      <td className="py-3.5 px-4 text-indigo-300 font-medium">Native T2I + Conversational Inpainting</td>
                      <td className="py-3.5 px-4 text-slate-400">Text-to-Image only (Discord brush edit)</td>
                      <td className="py-3.5 px-4 text-slate-400">Requires separate Flux Fill model</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Multi-Reference Conditioning</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">Up to 10 visual inputs supported</td>
                      <td className="py-3.5 px-4 text-slate-400">Limited --cref / --sref weighting</td>
                      <td className="py-3.5 px-4 text-slate-400">Requires complex ComfyUI IP-Adapter</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Typography Accuracy</td>
                      <td className="py-3.5 px-4 text-indigo-300 font-medium">Bilingual English + Chinese (99/100)</td>
                      <td className="py-3.5 px-4 text-slate-400">English short phrases only (74/100)</td>
                      <td className="py-3.5 px-4 text-slate-400">Latin typography only (93/100)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-white">Entry Cost &amp; License</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">Free daily tier + $4.99 lifetime (Commercial)</td>
                      <td className="py-3.5 px-4 text-slate-400">$10/month mandatory subscription</td>
                      <td className="py-3.5 px-4 text-slate-400">Non-commercial license (24GB VRAM GPU)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-slate-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Qwen Image 2.1 Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Everything you need to know about testing and using Qwen 2.1 online.
              </p>
            </div>

            <div className="space-y-4">
              {faqList.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-100 hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        faqOpen[idx] ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {faqOpen[idx] && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} page="qwen-image-2-1" />
    </div>
  );
}
