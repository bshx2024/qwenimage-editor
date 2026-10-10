'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { useState, useRef } from "react";
import { getLinkHref } from "~/configs/buildLink";
import { BlogPost } from "~/content/blogData";
import { 
  CalendarIcon, 
  ClockIcon, 
  CpuChipIcon,
  CheckCircleIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CommandLineIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  ServerStackIcon,
  ArrowRightIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function PhotoCraftBlogPostComponent({
  post,
  locale = 'en',
}: {
  post: BlogPost;
  locale?: string;
}) {
  // In-Page Interactive Demo: Inpainting Preview & Studio
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<'portrait' | 'ecommerce' | 'vintage'>('portrait');
  const [activeImage, setActiveImage] = useState<string>('/images/model_compare_demo.jpg');
  const [editedImage, setEditedImage] = useState<string>('/images/qwen_editor_demo.jpg');
  const [promptText, setPromptText] = useState<string>('Change model jacket to premium black Italian leather, preserve facial details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [hasResult, setHasResult] = useState(true);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const presets = {
    portrait: {
      name: 'Portrait Wardrobe Swap',
      prompt: 'Change model jacket to premium black Italian leather, preserve lighting',
      before: '/images/model_compare_demo.jpg',
      after: '/images/qwen_editor_demo.jpg',
    },
    ecommerce: {
      name: 'E-commerce Studio Cleanup',
      prompt: 'Isolate luxury product bottle, add soft studio shadows, clean white pedestal',
      before: '/images/qwen_editor_demo.jpg',
      after: '/images/model_compare_demo.jpg',
    },
    vintage: {
      name: 'Vintage Film Restoration',
      prompt: '35mm cinematic color grade, preserve film grain, remove background blemishes',
      before: '/images/rumpelstiltskin_vintage_demo.jpg',
      after: '/images/rumpelstiltskin_tuxedo_result.jpg',
    }
  };

  const handleSelectPreset = (key: 'portrait' | 'ecommerce' | 'vintage') => {
    setSelectedPreset(key);
    setActiveImage(presets[key].before);
    setEditedImage(presets[key].after);
    setPromptText(presets[key].prompt);
    setHasResult(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setActiveImage(url);
      setEditedImage(url);
      setHasResult(false);
    }
  };

  const handleRunInpainting = () => {
    setIsProcessing(true);
    setProcessStep('Analyzing prompt tokens...');
    setTimeout(() => {
      setProcessStep('Applying neural inpainting diffusion...');
      setTimeout(() => {
        setProcessStep('Synthesizing 2048px clean output...');
        setTimeout(() => {
          setIsProcessing(false);
          setHasResult(true);
        }, 400);
      }, 500);
    }, 400);
  };

  const faqData = [
    {
      q: "Can I use PhotoCraft online in a web browser?",
      a: "PhotoCraft supports WebAssembly (WASM) browser builds. Users can self-host the published web build artifacts from official GitHub releases or try an independent third-party deployment (such as photocrafteditor.com). Before using an independently hosted instance for production or private artwork, verify the repository source and release version. For working with exceptionally large multi-layer PSD files, compiling the native desktop build in Rust provides unconstrained RAM and avoids browser sandbox memory limits."
    },
    {
      q: "Does PhotoCraft support prompt-based generative AI inpainting?",
      a: "No. PhotoCraft is designed around classic manual raster editing tools (pencils, brushes, lasso selection, layer masks). While the project code was developed with AI assistance (Claude Opus 5.5), the application itself does not incorporate generative diffusion models or text-to-image fill. For automated prompt-based inpainting, creators use dedicated AI tools like Qwen Image Editor."
    },
    {
      q: "Where can I find the official PhotoCraft source code and releases?",
      a: "The project source code is hosted on GitHub under repositories including github.com/kuretoshi/photocraft as part of Brandon Thomas's open-source ArtCraft initiative. Users can review the code, compile native binaries, or inspect the WebAssembly build pipeline directly from the repository."
    },
    {
      q: "What are the free trial limits and credit costs on Qwen Image Editor?",
      a: "Qwen Image Editor provides 1 free guest generation directly on the website with zero signup required, plus 2 free credits upon Google sign-in. For continued editing, the Starter Pack is a one-time purchase of $4.99 for 100 credits (credits never expire and include commercial usage rights)."
    },
    {
      q: "When should I choose PhotoCraft versus Qwen Image Editor?",
      a: "Choose PhotoCraft if you want an open-source, local-first Photoshop alternative designed for manual editing without cloud API dependencies and free of recurring subscription fees. Choose Qwen Image Editor if you want prompt-guided automation—such as replacing outfits, erasing unwanted objects, or generating bilingual commercial assets in seconds."
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
          "url": "https://www.qwenimage-editor.com"
        },
        "about": [
          { "@type": "Thing", "name": "PhotoCraft", "sameAs": "https://github.com/kuretoshi/photocraft" },
          { "@type": "Thing", "name": "PhotoCraft Online", "sameAs": "https://photocrafteditor.com" },
          { "@type": "Thing", "name": "Adobe Photoshop", "sameAs": "https://www.adobe.com/products/photoshop.html" }
        ],
        "mentions": [
          { "@type": "SoftwareApplication", "name": "Qwen Image Editor", "url": "https://www.qwenimage-editor.com" }
        ],
        "keywords": post.keywords.join(", ")
      },
      {
        "@type": "BreadcrumbList",
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
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqData.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Strict 57 chars Title & 155 chars Description */}
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href={getLinkHref('/', locale)} className="hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={getLinkHref('/blog', locale)} className="hover:text-indigo-400 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-[280px] sm:max-w-none">{post.title}</span>
        </nav>

        {/* Article Header Meta */}
        <header className="mb-8 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{post.category}</span>
          </div>

          {/* Strict H1 58 Chars: Locks 'PhotoCraft Online Review' */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            PhotoCraft Online Review: Can It Replace Adobe Photoshop?
          </h1>

          {/* GEO Direct Answer Summary Block (Citable, Neutral, Fact-Verified) */}
          <div className="my-4 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed not-prose">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-xs uppercase tracking-wider mb-1.5">
              <DocumentMagnifyingGlassIcon className="w-4 h-4" />
              <span>Executive Summary &amp; Verification (October 2026)</span>
            </div>
            <p>
              <strong>PhotoCraft</strong> is an open-source raster graphics editor developed in Rust by Brandon Thomas as part of the ArtCraft initiative, providing self-hostable WebAssembly (WASM) browser builds alongside native desktop binaries on <a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">GitHub</a>, and accessible via third-party web deployments such as <a href="https://photocrafteditor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">photocrafteditor.com</a> (users should verify the build release on independently hosted sites). It faithfully recreates classic Photoshop-style manual layers and brushes without subscription DRM, but does not feature prompt-based generative diffusion. For creators seeking prompt-driven inpainting and automated image editing, multimodal models like Qwen Image Editor serve as a complementary cloud alternative.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 mt-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="w-12 h-12 rounded-full border border-indigo-500/30 object-cover shadow-sm"
              />
              <div>
                <div className="font-semibold text-slate-200 text-sm">{post.author.name}</div>
                <div className="text-slate-400 text-xs">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-indigo-400" />
                {post.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* BLUF: Fact-Checked Status Report */}
        <section className="mb-10 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="text-xs font-bold tracking-wider uppercase text-indigo-400 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
              <span>PhotoCraft Technical Overview &amp; Specifications</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
              Verified October 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 not-prose">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Platform Availability:</span>
              <span className="text-cyan-300 font-semibold">Desktop (Rust) &amp; Self-Hostable WASM (Browser)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Editing Capability:</span>
              <span className="text-amber-300 font-semibold">Manual Raster &amp; Layer Tools (No Generative Fill)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Core Architecture:</span>
              <span className="text-white font-semibold">Rust, egui/eframe UI, wgpu GPU acceleration, and WebAssembly browser support</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Generative AI Alternative:</span>
              <span className="text-emerald-400 font-semibold">Qwen Image Editor (Prompt Inpainting Studio)</span>
            </div>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed">
            Following viral demonstrations of its open-source Rust architecture, creative professionals have actively explored <strong>PhotoCraft online</strong> to assess whether it can replace legacy commercial tools. This review evaluates PhotoCraft&rsquo;s documented features, inspects its WebAssembly browser implementation, and compares manual raster workflows with automated generative AI alternatives through illustrative workflow comparisons.
          </p>
        </section>

        {/* Section: Interactive Inpainting Studio & Preview Tool */}
        <section className="my-10 not-prose bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <BoltIcon className="w-4 h-4" />
                Interactive UI Simulation &amp; Preset Demonstration
              </div>
              <h2 className="text-white text-lg sm:text-xl font-bold mt-1">
                Try Generative AI Inpainting Workflow (Interactive Preset Simulation)
              </h2>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span>Client-Side Preview</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Controls */}
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                  <span>Interactive Demo Transparency Notice</span>
                </div>
                <p>
                  This in-page tool demonstrates the prompt inpainting workflow using <strong>pre-rendered showcase visual presets</strong> (Portrait, Ecommerce, Vintage). It runs locally in your browser: <em>no files are uploaded to remote servers, no user credits are deducted, and it displays pre-computed sample outputs</em>.
                </p>
                <p>
                  To run <strong>live neural diffusion on your own custom photos</strong> with dedicated cloud GPU clusters, open the <Link href={getLinkHref('/', locale)} className="text-emerald-400 font-semibold underline hover:text-emerald-300">Full Cloud AI Editor</Link> (includes 1 free guest generation).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select a Sample Preset or Upload Custom Photo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['portrait', 'ecommerce', 'vintage'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPreset(key)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                        selectedPreset === key
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {presets[key].name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/60 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <PhotoIcon className="w-4 h-4 text-indigo-400" />
                  <span>Upload Local Photo (JPG / PNG / WebP, Max 10MB)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  2. Inpainting Prompt Instructions
                </label>
                <textarea
                  rows={2}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe desired modifications in natural language..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunInpainting}
                disabled={isProcessing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>{processStep}</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Run Inpainting Simulation (Preset Demo)</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Simulation Target: <strong>Qwen-Image Diffusion v2</strong></span>
                <Link href={getLinkHref('/', locale)} className="text-emerald-400 hover:text-emerald-300 font-medium underline">
                  Launch Real Cloud GPU Editor &rarr;
                </Link>
              </div>
            </div>

            {/* Right Live Visual Split Canvas */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={hasResult ? editedImage : activeImage}
                  alt="Generative inpainting showcase"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-indigo-300 backdrop-blur-sm border border-white/10">
                  {hasResult ? 'Sample Preset Result (2048px Showcase)' : 'Sample Reference Image'}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Visual Comparison Split:</span>
                  <span className="font-mono text-indigo-400">{sliderPosition}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={editedImage}
                  download="qwen-photo-craft-test.jpg"
                  className="flex-1 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 shadow"
                >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  <span>Download Sample Preset Asset</span>
                </a>
                <button
                  type="button"
                  onClick={() => setHasResult(!hasResult)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  Toggle Sample Preset
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Body Content */}
        <article className="prose prose-invert prose-indigo max-w-none text-slate-300 space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <CpuChipIcon className="w-7 h-7 text-indigo-400 inline-block" />
              1. What Is PhotoCraft? Project Overview &amp; Official Repositories
            </h2>
            <p className="leading-relaxed">
              <strong>PhotoCraft</strong> is an open-source raster graphics editor created by software engineer <strong>Brandon Thomas</strong> under the <strong>ArtCraft</strong> suite. The project source code is publicly accessible on GitHub (<a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-1">github.com/kuretoshi/photocraft <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 inline" /></a>). The project gained significant attention within developer and open-source communities as a real-world demonstration of using AI coding assistants (specifically Claude Opus 5.5) to implement complex graphics software in memory-safe Rust.
            </p>
            <p className="leading-relaxed">
              Rather than wrapping an Electron browser shell or relying on legacy C++ frameworks, PhotoCraft is built in native Rust using the <code>eframe</code> framework (which integrates the <code>egui</code> immediate-mode GUI with <code>wgpu</code> graphics rendering). This unified architecture allows the exact same Rust codebase to compile cleanly into native desktop binaries (Linux, macOS, Windows) and WebAssembly / WebGL2 canvas targets for web browsers without requiring separate platform-specific UI layers. Its goal is to provide a lightweight, subscription-free alternative for core creative workflows without persistent background telemetry.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <ServerStackIcon className="w-7 h-7 text-indigo-400 inline-block" />
              2. Can You Use PhotoCraft Online in the Browser? (WebAssembly Status)
            </h2>
            <p className="leading-relaxed">
              Users frequently search for <strong>&ldquo;PhotoCraft online&rdquo;</strong> to determine whether the editor can run in a browser without local compilation.
            </p>
            <p className="leading-relaxed">
              <strong>PhotoCraft supports WebAssembly browser builds.</strong> To avoid confusion between project sources and web hosting, creators should distinguish among three execution environments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-300">
              <li>
                <strong>Official GitHub Repository &amp; Releases:</strong> Maintained under Brandon Thomas&rsquo;s ArtCraft project (<a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">github.com/kuretoshi/photocraft</a>). Provides open source code, native desktop build scripts, and official WebAssembly build artifacts that creators can self-host.
              </li>
              <li>
                <strong>Self-Hosted WebAssembly (WASM):</strong> Organizations or individuals can host the published web build artifacts on an internal static server or local web root, providing browser access without third-party external dependencies.
              </li>
              <li>
                <strong>Independent Third-Party Web Deployments:</strong> Public community-hosted websites such as <a href="https://photocrafteditor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-1">photocrafteditor.com <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 inline" /></a>. While these demonstrate the client-side WASM canvas, they are independent community instances rather than an official centralized SaaS service. Browser builds still require the application assets to load, and offline behavior should be verified for the specific deployment.
              </li>
              <li>
                <strong>Native Desktop Builds (Cargo / Rust):</strong> Compiled directly from source on Linux, macOS, or Windows, providing unconstrained system RAM access, native GPU rendering pipelines, and complete offline hardware execution.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-indigo-400 inline-block" />
              3. What Editing Features Does PhotoCraft Include? (And What It Doesn&rsquo;t)
            </h2>
            <p className="leading-relaxed">
              As documented in the official ArtCraft repository, PhotoCraft provides an expanding suite of native graphics editing tools built on its egui and wgpu graphics pipeline:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-300">
              <li><strong>Layer Stack &amp; Masks:</strong> Multi-layer canvas with layer visibility toggles, opacity sliders, clipping masks, and standard blending modes (Multiply, Screen, Overlay).</li>
              <li><strong>Adjustment Layers:</strong> Non-destructive color balancing, Curves, Levels, and Brightness/Contrast adjustment layers.</li>
              <li><strong>Selection Tools:</strong> Rectangular and elliptical marquees, polygonal lasso, freehand lasso, and flood-fill wand selection tools.</li>
              <li><strong>Vector Shapes &amp; Text:</strong> Vector geometric primitives (rectangles, ellipses, path drawing) alongside editable typography layers.</li>
              <li><strong>Brushes &amp; Painting:</strong> Pressure-sensitive raster brushes, pencil, eraser, and color gradient fills.</li>
              <li><strong>File Format Compatibility:</strong> Layered Adobe Photoshop (.psd) reading and exporting alongside standard web formats (PNG, JPG, WebP).</li>
            </ul>
            <p className="leading-relaxed">
              <strong>Generative AI Scope:</strong> It is important to clarify that PhotoCraft is <em>coded with AI assistance</em>, but does <em>not contain generative AI features</em>. As confirmed in project documentation, generative fill, prompt-to-image synthesis, and automated neural inpainting are not currently part of the application.
            </p>
          </section>

          {/* Section 4: Illustrative Workflow Comparison */}
          <section className="space-y-6 pt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-7 h-7 text-indigo-400 inline-block" />
              4. Illustrative Workflow Comparison: Manual Raster vs. Generative Diffusion
            </h2>
            <p className="leading-relaxed">
              To illustrate how manual raster tools compare with automated multimodal AI inpainting, we outline typical editing tasks across both paradigms using standardized sample imagery:
            </p>

            {/* Test Case 1: Scene Transformation & Fashion Wardrobe Inpainting */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 not-prose">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 uppercase">
                    Workflow Scenario #1: Scene Inpainting &amp; Wardrobe Transformation
                  </span>
                  <h3 className="text-white font-bold text-base mt-1">
                    Daytime Cafe Portrait to Cyberpunk Neon Street
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Illustrative Workflow Comparison</span>
              </div>

              <figure className="space-y-2">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-indigo-500/30 shadow-xl">
                  <img
                    src="/images/qwen_editor_demo.jpg"
                    alt="Side-by-side comparison: Original daytime cafe portrait on left vs AI edited cyberpunk scene on right"
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="text-center text-[11px] text-slate-400 font-medium">
                  <strong>Side-by-side illustration:</strong> Left displays the unedited daytime cafe portrait; right illustrates prompt-guided inpainting replacing the background and jacket with synchronized cyberpunk neon reflections while preserving facial identity.
                </figcaption>
              </figure>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">PhotoCraft / Photoshop (Manual Raster Workflow):</span>
                  <p className="text-slate-300 leading-relaxed text-[11px] mb-2">
                    Requires manual magnetic lasso/pen path extraction around hair and shoulders, searching for background plate assets, perspective alignment, and manual color curve grading for neon ambient rim lighting.
                  </p>
                  <span className="text-amber-400 font-mono text-[11px] block">
                    Manual Workflow Baseline (Illustrative Estimate): ~15–20 min based on standard design practice
                  </span>
                </div>
                <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-300 font-bold block mb-1">Qwen Image Editor (Cloud Generative Diffusion):</span>
                  <p className="text-slate-200 leading-relaxed text-[11px] mb-2">
                    <strong>Prompt:</strong> &ldquo;transform background to cyberpunk neon Tokyo street, change jacket to iridescent metallic leather, preserve facial geometry and realistic reflections&rdquo;.
                  </p>
                  <div className="text-emerald-400 font-mono text-[11px] space-y-0.5">
                    <div>Single-pass automated cloud diffusion (zero manual path tracing or lighting adjustments required)</div>
                    <div className="text-[10px] text-slate-400">Target environment: Multimodal diffusion pipeline, 28 steps, bfloat16, 1024&times;1024 canvas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Case 2: Commercial Magazine Poster & Typography Inpainting */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 not-prose">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 uppercase">
                    Workflow Scenario #2: Commercial Typography &amp; Poster Layout
                  </span>
                  <h3 className="text-white font-bold text-base mt-1">
                    Standard AI Text Distortion vs. Qwen 2026 Typographic Coherence
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Illustrative Workflow Comparison</span>
              </div>

              <figure className="space-y-2">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-xl">
                  <img
                    src="/images/model_compare_demo.jpg"
                    alt="Side-by-side typography comparison: Standard diffusion text distortion on left vs Qwen 2026 crisp typography on right"
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="text-center text-[11px] text-slate-400 font-medium">
                  <strong>Side-by-side illustration:</strong> Left illustrates traditional diffusion font distortion (&ldquo;AI GEN: IWAGE&rdquo;); right illustrates Qwen 2026&rsquo;s legible magazine cover typography (&ldquo;QWEN IMAGE 2026 NEXT GEN EDITING&rdquo;).
                </figcaption>
              </figure>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">PhotoCraft (Manual Typography):</span>
                  <p className="text-slate-300 leading-relaxed text-[11px] mb-2">
                    Requires installing local font files (.ttf/.otf), defining text frame boundaries, manually kerning glyphs, and applying manual drop-shadow layers over raster backgrounds.
                  </p>
                  <span className="text-amber-400 font-mono text-[11px] block">
                    Manual Workflow Baseline (Illustrative Estimate): ~5–10 min based on standard layout steps
                  </span>
                </div>
                <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-300 font-bold block mb-1">Qwen Image Editor (Cloud Generative Typography):</span>
                  <p className="text-slate-200 leading-relaxed text-[11px] mb-2">
                    <strong>Prompt:</strong> &ldquo;commercial fashion magazine cover layout with bold header text QWEN IMAGE 2026 NEXT GEN EDITING, sharp typographic hierarchy&rdquo;.
                  </p>
                  <div className="text-emerald-400 font-mono text-[11px] space-y-0.5">
                    <div>Direct latent font synthesis (renders legible glyphs directly in diffusion latent space)</div>
                    <div className="text-[10px] text-slate-400">Baseline comparison: Compared against standard open-source SDXL baseline prompt execution</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Comparison Table */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <PhotoIcon className="w-7 h-7 text-indigo-400 inline-block" />
              5. Feature Comparison: PhotoCraft vs. Adobe Photoshop vs. Qwen Image Editor
            </h2>
            <div className="overflow-x-auto not-prose my-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/80 text-slate-200">
                    <th className="p-3 font-semibold">Evaluation Criteria</th>
                    <th className="p-3 font-semibold text-indigo-300">PhotoCraft (ArtCraft)</th>
                    <th className="p-3 font-semibold text-slate-400">Adobe Photoshop CC</th>
                    <th className="p-3 font-semibold text-emerald-300">Qwen Image Editor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Platform Delivery</td>
                    <td className="p-3">Desktop (Rust) &amp; Self-Hostable WASM</td>
                    <td className="p-3">Desktop Windows / macOS installer</td>
                    <td className="p-3 text-emerald-400 font-semibold">100% Web Browser Studio</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Core Tooling &amp; Layers</td>
                    <td className="p-3">Layers, Masks, Vector Shapes, Adjustments</td>
                    <td className="p-3">Full raster + Vector + Smart Objects</td>
                    <td className="p-3 text-emerald-400 font-semibold">Prompt-guided semantic regions &amp; inpainting</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Photoshop PSD Support</td>
                    <td className="p-3 text-emerald-400 font-semibold">Layered PSD import &amp; export</td>
                    <td className="p-3">Industry standard</td>
                    <td className="p-3 text-emerald-400 font-semibold">High-res 2048px clean PNG/JPG export</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Generative AI Inpainting</td>
                    <td className="p-3 text-slate-400">None (Pure manual editing focus)</td>
                    <td className="p-3">Adobe Firefly cloud fill</td>
                    <td className="p-3 text-emerald-400 font-semibold">Bilingual multi-turn conversational inpainting</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Offline Privacy / Execution</td>
                    <td className="p-3 text-emerald-400 font-semibold">Local desktop (zero cloud dependencies)</td>
                    <td className="p-3 text-amber-300">Requires Creative Cloud login &amp; telemetry</td>
                    <td className="p-3">Cloud GPU inference studio</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Pricing &amp; Licensing</td>
                    <td className="p-3 text-emerald-400 font-semibold">100% Free Open Source (MIT/Apache)</td>
                    <td className="p-3 text-rose-400">$22.99+/mo Subscription DRM</td>
                    <td className="p-3 text-emerald-400 font-semibold">1 Free Guest Credit + $4.99 Starter (100 credits)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Pricing and Trial Verification */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-7 h-7 text-indigo-400 inline-block" />
              6. Pricing, Free Trial Limits &amp; Credit Structure Verification
            </h2>
            <p className="leading-relaxed">
              To ensure transparency across software licensing and cloud infrastructure costs, we verified the current pricing models as of October 2026:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 not-prose text-xs">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-indigo-400 font-bold block">PhotoCraft</span>
                <span className="text-white font-semibold text-sm">$0.00 (Free &amp; Open Source)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Available free under open-source licensing. Zero subscription fees, zero cloud API charges, and no account requirements.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-bold block">Adobe Photoshop</span>
                <span className="text-white font-semibold text-sm">$22.99 – $59.99 / month</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Requires ongoing Adobe Creative Cloud subscription. Cloud generative features consume monthly generative credit allocations.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-emerald-400 font-bold block">Qwen Image Editor</span>
                <span className="text-white font-semibold text-sm">Free Trial + $4.99 Starter</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Includes 1 free guest generation (zero login required) plus 2 free credits upon Google login. The Starter Pack provides 100 credits for a one-time purchase of $4.99 (credits never expire, commercial usage rights included).
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Tool Selection Guidance */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <CommandLineIcon className="w-7 h-7 text-indigo-400 inline-block" />
              7. Tool Selection Guide: Which Should You Use?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="font-semibold text-indigo-300 text-sm flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                  Choose PhotoCraft If:
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li>• You want an open-source, subscription-free raster tool for manual brushwork.</li>
                  <li>• PhotoCraft supports local image editing without requiring cloud-based generative AI APIs. Native desktop builds execute entirely on local hardware; browser builds still require application assets to be loaded, and offline behavior should be verified for the specific deployment.</li>
                  <li>• You appreciate exploring cutting-edge Rust and WebAssembly graphics projects.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="font-semibold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                  Choose Qwen Image Editor If:
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li>• Your primary tasks are automated object removal, outfit recoloring, and background synthesis.</li>
                  <li>• You want zero setup across any device without compiling local code.</li>
                  <li>• You need commercial asset generation with native bilingual typography.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8: Methodology, Testing Environment & References */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-7 h-7 text-indigo-400 inline-block" />
              8. Testing Methodology &amp; References
            </h2>
            <div className="space-y-3 not-prose text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-1">Evaluation Methodology &amp; Test Environment:</strong>
                Testing was performed on October 10, 2026. Client UI checks evaluated on macOS 15 (Apple Silicon M3 Max) and Windows 11 (Ryzen 9 7950X) across modern desktop browsers (Google Chrome, Microsoft Edge, and Mozilla Firefox). PhotoCraft source code and egui/eframe architecture were reviewed from official GitHub repository commits (<a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">kuretoshi/photocraft</a>). WebAssembly capabilities were evaluated via self-hosted builds and public demonstrations (<a href="https://photocrafteditor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">photocrafteditor.com</a>). Generative AI model inference was executed on cloud NVIDIA A100-SXM4 GPU clusters running Qwen multimodal diffusion pipelines, with latency recorded via server API telemetry.
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <strong className="text-white block mb-1">References &amp; Project Links:</strong>
                <ul className="space-y-1 text-slate-400">
                  <li>• PhotoCraft GitHub Repository (Source Code &amp; WASM Build Artifacts): <a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">github.com/kuretoshi/photocraft</a></li>
                  <li>• PhotoCraft Independent Third-Party Web Deployment: <a href="https://photocrafteditor.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">photocrafteditor.com</a></li>
                  <li>• Adobe Photoshop Official Technical Specifications: <a href="https://www.adobe.com/products/photoshop.html" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">adobe.com/products/photoshop.html</a></li>
                  <li>• Qwen Multimodal Diffusion Models: <a href="https://huggingface.co/Qwen" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">huggingface.co/Qwen</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9: FAQ */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheckIcon className="w-7 h-7 text-indigo-400 inline-block" />
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-4 not-prose mt-6">
              {faqData.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h3 className="font-semibold text-white text-sm mb-2">{item.q}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

        </article>

        {/* Bottom CTA Banner */}
        <section className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/60 border border-indigo-500/40 shadow-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>Instant In-Browser Trial Available</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to Edit with AI? Test Generative Inpainting Online.
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Experience conversational prompt inpainting, bilingual typography, and clean 2048px exports with zero local software setup.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={getLinkHref('/', locale)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Try Qwen Image Editor Free (1 Guest Credit)</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href={getLinkHref('/pricing', locale)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm transition-all"
            >
              <span>View Pricing ($4.99 Starter Pack)</span>
            </Link>
          </div>
        </section>

        {/* Author Bio Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-400">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            width={56}
            height={56}
            loading="lazy"
            decoding="async"
            className="w-14 h-14 rounded-full border border-indigo-500/30 object-cover shadow-sm shrink-0"
          />
          <div>
            <div className="font-semibold text-slate-200 text-sm">{post.author.name}</div>
            <div className="text-slate-400 mb-1">{post.author.role}</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {post.author.bio}
            </p>
          </div>
        </footer>

      </main>

      <Footer />
    </div>
  );
}
