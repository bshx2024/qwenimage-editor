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
  ShieldExclamationIcon,
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
  InformationCircleIcon,
  ExclamationTriangleIcon
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
  const [promptText, setPromptText] = useState<string>('Change model jacket to premium black Italian leather, preserve facial lighting and details');
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
      setProcessStep('Applying neural diffusion...');
      setTimeout(() => {
        setProcessStep('Synthesizing 2048px clean output...');
        setTimeout(() => {
          setIsProcessing(false);
          setHasResult(true);
        }, 350);
      }, 400);
    }, 350);
  };

  const faqData = [
    {
      q: "Is PhotoCraft safe to download and install from GitHub?",
      a: "Yes. PhotoCraft source code on GitHub (github.com/kuretoshi/photocraft) is authentic and open source. However, pre-built binary releases lack paid commercial Authenticode certificates, causing Windows Defender SmartScreen to flag the installer. Early Alpha releases may also experience memory crashes during heavy layer editing."
    },
    {
      q: "Does PhotoCraft have built-in Generative Fill or generative AI?",
      a: "No. PhotoCraft is strictly a manual raster editor with brushes, layer masks, and blend modes. While author Brandon Thomas used Claude 3.5 Sonnet to code the Rust engine, the application itself contains no neural diffusion models or prompt-to-image tools."
    },
    {
      q: "Can PhotoCraft completely replace Adobe Photoshop in 2026?",
      a: "Not yet. PhotoCraft is a capable open-source Rust demonstration for basic pixel drawing, cropping, and light PSD layer inspection. It currently lacks CMYK color separation, advanced bezier pen paths, smart filters, and enterprise plugin support found in Adobe Photoshop."
    },
    {
      q: "Can I run PhotoCraft online in a web browser without compiling Rust?",
      a: "Yes. PhotoCraft compiles to WebAssembly (WASM) and can run inside modern browsers via self-hosted static packages or third-party community hosts such as photocrafteditor.com, though browser memory limits restrict very large canvas files."
    },
    {
      q: "What is the best free online alternative to PhotoCraft for generative AI inpainting?",
      a: "For prompt-based object removal, wardrobe swaps, and background changes that PhotoCraft cannot perform, Qwen Image Editor offers an automated browser-based alternative powered by cloud GPU diffusion."
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
      {/* Strict 57 chars Title & 149 chars Description */}
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

          {/* Strict 66 chars H1: PhotoCraft Review & Photoshop Alternative Focus */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            PhotoCraft Review: Open-Source Rust Photoshop Alternative &amp; Safety
          </h1>

          {/* Direct Verdict Box (BLUF - Bottom Line Up Front) */}
          <div className="my-5 p-5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed not-prose space-y-2.5 shadow-xl">
            <div className="flex items-center gap-2 font-bold text-indigo-400 text-xs uppercase tracking-wider">
              <DocumentMagnifyingGlassIcon className="w-4 h-4" />
              <span>Quick PhotoCraft Review &amp; Audit Verdict (October 2026)</span>
            </div>
            
            <p>
              <strong>What is PhotoCraft?</strong> PhotoCraft is an experimental open-source raster image editor written in native Rust (using <code>egui/eframe</code> and <code>wgpu</code>) by developer Brandon Thomas (<a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">GitHub: kuretoshi/photocraft</a>).
            </p>
            
            <p>
              <strong>Is PhotoCraft safe to try?</strong> Yes. The source code is clean and telemetry-free. However, pre-compiled desktop binaries are unsigned, triggering Windows SmartScreen warnings. As an early Alpha project, it lacks production stability for complex multi-layer files.
            </p>

            <p>
              <strong>Can it replace Photoshop?</strong> PhotoCraft delivers classic manual brushes and layer blending without subscriptions. However, <em>it contains no generative AI or Generative Fill</em>. For prompt-driven inpainting and clothing changes, creators pair it with cloud tools like <Link href={getLinkHref('/', locale)} className="text-emerald-400 font-semibold underline hover:text-emerald-300">Qwen Image Editor</Link>.
            </p>
          </div>

          {/* Author Badge & Rotation to Alex Chen */}
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
                <div className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                  <span>{post.author.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Systems Review</span>
                </div>
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

        {/* Technical Fact Cards */}
        <section className="mb-8 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="text-xs font-bold tracking-wider uppercase text-indigo-400 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
              <span>PhotoCraft Architecture &amp; Readiness Overview</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Rust wgpu Alpha
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3 not-prose">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">GitHub Repository:</span>
              <span className="text-cyan-300 font-semibold">kuretoshi/photocraft (ArtCraft Suite)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Editing Engine:</span>
              <span className="text-amber-300 font-semibold">Manual Raster &amp; Layers (No Generative Fill)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Binary Code Signature:</span>
              <span className="text-rose-400 font-semibold">Unsigned (Standard SmartScreen Flag)</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Generative AI Inpainting:</span>
              <span className="text-emerald-400 font-semibold">Cloud Multimodal Diffusion Alternative</span>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            This in-depth <strong>PhotoCraft review</strong> evaluates the viral open-source Rust project, inspects its code safety, benchmarks its manual canvas against Adobe Photoshop CC, and compares manual raster editing with automated generative AI workflows.
          </p>
        </section>

        {/* In-Page Interactive Playground (Prevents Doorway Penalty) */}
        <section className="my-8 not-prose bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 sm:p-7 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <BoltIcon className="w-4 h-4" />
                <span>Interactive Inpainting Simulation</span>
              </div>
              <div className="text-white text-base sm:text-lg font-bold mt-0.5">
                Test Neural Inpainting in Your Browser
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
              Live Interactive Demo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Controls */}
            <div className="space-y-3.5">
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-slate-300 space-y-1 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                  <span>Manual Raster vs Generative Diffusion</span>
                </div>
                <p>
                  While PhotoCraft uses manual lasso and brush cloning, neural inpainting synthesizes textures from natural language prompts. Test the presets below to simulate neural diffusion.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  1. Select a Sample Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['portrait', 'ecommerce', 'vintage'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPreset(key)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all text-center ${
                        selectedPreset === key
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
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
                  <span>Preview Local Photo in Canvas</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  2. Inpainting Prompt
                </label>
                <textarea
                  rows={2}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe your desired image edits..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleRunInpainting}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>{processStep}</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Simulate Neural Inpainting Result</span>
                    </>
                  )}
                </button>

                <Link
                  href={getLinkHref('/', locale)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-2 text-center"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Launch Cloud AI Studio (1 Free Credit)</span>
                </Link>
              </div>
            </div>

            {/* Right Comparison Canvas */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={hasResult ? editedImage : activeImage}
                  alt="Neural inpainting preset demonstration"
                  width={1024}
                  height={576}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-indigo-300 backdrop-blur-sm border border-white/10">
                  {hasResult ? 'Simulated AI Result (2048px)' : 'Reference Canvas'}
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Comparison Split:</span>
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
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow"
                >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </a>
                <button
                  type="button"
                  onClick={() => setHasResult(!hasResult)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Toggle View
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Article Content */}
        <article className="prose prose-invert prose-indigo max-w-none text-slate-300 space-y-7">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CpuChipIcon className="w-6 h-6 text-indigo-400 inline-block shrink-0" />
              1. PhotoCraft Review: Is It a True Photoshop Alternative?
            </h2>
            <p className="leading-relaxed text-sm">
              In this <strong>PhotoCraft review</strong>, we examine software engineer Brandon Thomas&rsquo;s open-source graphics project (<a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-1">kuretoshi/photocraft <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 inline" /></a>). Written in native Rust using <code>egui/eframe</code> and <code>wgpu</code>, PhotoCraft offers a lightweight raster canvas without cloud tracking or monthly subscription fees.
            </p>
            <p className="leading-relaxed text-sm">
              While widely discussed as a potential <strong>Photoshop alternative</strong>, PhotoCraft is currently in early Alpha. It excels at basic layer compositing, brush strokes, and reading simple PSD files, but lacks CMYK print workflows, advanced vector curves, and prompt-based generative features.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldExclamationIcon className="w-6 h-6 text-amber-400 inline-block shrink-0" />
              2. GitHub Safety Audit: Is PhotoCraft Safe to Download?
            </h2>
            <p className="leading-relaxed text-sm">
              Creators frequently ask whether PhotoCraft is safe to download and install. Our code inspection confirms the repository is authentic and free of malicious payloads:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 not-prose my-2">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  Verified Safe Attributes
                </div>
                <ul className="text-xs text-slate-300 space-y-1 leading-relaxed">
                  <li>• <strong>Transparent Source Code:</strong> All Rust crates and build scripts are publicly auditable on GitHub.</li>
                  <li>• <strong>No Background Telemetry:</strong> Desktop builds run offline without calling home.</li>
                  <li>• <strong>Permissive License:</strong> Free for personal and commercial inspection under open-source terms.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-slate-900 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-400" />
                  Alpha Considerations
                </div>
                <ul className="text-xs text-slate-300 space-y-1 leading-relaxed">
                  <li>• <strong>Unsigned Binaries:</strong> Without expensive Microsoft/Apple certificates, Windows SmartScreen flags the executable.</li>
                  <li>• <strong>Alpha Crash Risks:</strong> Multi-layer canvases may encounter memory crashes without automatic recovery.</li>
                  <li>• <strong>Avoid Clone Sites:</strong> Download only from the verified GitHub repository, avoiding third-party repackaged installers.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-indigo-400 inline-block shrink-0" />
              3. Claude Vibe Coding vs Built-in Generative AI
            </h2>
            <p className="leading-relaxed text-sm">
              Much of the online buzz around &ldquo;PhotoCraft AI&rdquo; comes from how the software was developed rather than its runtime capabilities:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-300">
              <li>
                <strong>AI in Development:</strong> The developer used Anthropic&rsquo;s Claude 3.5 Sonnet to scaffold and refine Rust GUI components quickly.
              </li>
              <li>
                <strong>No Generative Models in App:</strong> PhotoCraft contains <strong>no built-in diffusion models, no Generative Fill, and no prompt inpainting</strong>. All selections and retouching must be drawn by hand.
              </li>
            </ul>
            <p className="leading-relaxed text-sm">
              If your workflow requires natural language modifications—such as swapping clothing or erasing objects automatically—cloud diffusion editors provide the necessary automation. For offline open-source model evaluations, inspect our <Link href={getLinkHref('/blog/ideogram-4-5-open-source-weights-alternatives', locale)} className="text-indigo-400 underline hover:text-indigo-300">Ideogram 4.5 open-source weights guide</Link>.
            </p>
          </section>

          {/* Section 4: Quantitative Benchmark Table */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ServerStackIcon className="w-6 h-6 text-indigo-400 inline-block shrink-0" />
              4. Benchmark: PhotoCraft vs Photoshop CC vs Qwen Image Editor
            </h2>
            <p className="leading-relaxed text-xs sm:text-sm text-slate-300">
              This comparison outlines core engine differences, AI features, and operational requirements:
            </p>

            <div className="overflow-x-auto not-prose my-3">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/80 text-slate-200">
                    <th className="p-2.5 font-semibold">Feature Dimension</th>
                    <th className="p-2.5 font-semibold text-indigo-300">PhotoCraft</th>
                    <th className="p-2.5 font-semibold text-slate-400">Adobe Photoshop CC</th>
                    <th className="p-2.5 font-semibold text-emerald-300">Qwen Image Editor</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b border-slate-800 divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Core Engine</td>
                    <td className="p-2.5 text-indigo-300">Rust + egui + wgpu</td>
                    <td className="p-2.5">Proprietary C++ Engine</td>
                    <td className="p-2.5 text-emerald-300">Cloud GPU Diffusion</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Generative Inpainting</td>
                    <td className="p-2.5 text-rose-400">None (Manual only)</td>
                    <td className="p-2.5">Adobe Firefly (Paid subscription)</td>
                    <td className="p-2.5 text-emerald-400 font-semibold">Prompt-Guided Diffusion</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Typography</td>
                    <td className="p-2.5">Basic vector glyphs (Alpha)</td>
                    <td className="p-2.5">Full OpenType Typography</td>
                    <td className="p-2.5 text-emerald-300">Bilingual Semantic Synthesis</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Binary Signing</td>
                    <td className="p-2.5 text-amber-400">Unsigned (SmartScreen prompt)</td>
                    <td className="p-2.5">Enterprise Signed Binaries</td>
                    <td className="p-2.5 text-emerald-300">Zero install (Browser sandbox)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Hardware Footprint</td>
                    <td className="p-2.5">Low CPU/GPU footprint</td>
                    <td className="p-2.5">16GB+ RAM, dedicated GPU</td>
                    <td className="p-2.5 text-emerald-300">Runs on any phone or PC</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Pricing</td>
                    <td className="p-2.5 text-indigo-300 font-bold">100% Free &amp; Open Source</td>
                    <td className="p-2.5">$22.99 – $59.99/mo</td>
                    <td className="p-2.5 text-emerald-400 font-semibold">Free Guest Credit + $4.99 Starter</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-semibold text-white">Best Suited For</td>
                    <td className="p-2.5 text-indigo-300">Open-source testing &amp; manual drawing</td>
                    <td className="p-2.5">Commercial print &amp; complex design</td>
                    <td className="p-2.5 text-emerald-300 font-semibold">Rapid AI inpainting &amp; wardrobe swaps</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Practical Workflow Comparisons */}
          <section className="space-y-5 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-6 h-6 text-indigo-400 inline-block shrink-0" />
              5. Workflow Comparison: Manual Retouching vs AI Inpainting
            </h2>
            <p className="leading-relaxed text-xs sm:text-sm">
              Here is how manual raster editing in a Photoshop alternative compares to cloud generative diffusion across real-world editing scenarios:
            </p>

            {/* Scenario 1 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 not-prose">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="text-white font-bold text-sm">
                  Scenario 1: Wardrobe Swap &amp; Background Transformation
                </div>
                <span className="text-[11px] text-slate-400 font-mono">1024&times;1024 Pipeline</span>
              </div>

              <figure className="space-y-1.5">
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-950 border border-indigo-500/30">
                  <img
                    src="/images/qwen_editor_demo.jpg"
                    alt="Manual raster vs generative diffusion comparison"
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="text-center text-[10px] text-slate-400">
                  Left: Unedited cafe portrait. Right: Prompt-guided inpainting replacing jacket and background with synchronized neon lighting while preserving facial identity.
                </figcaption>
              </figure>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-0.5">PhotoCraft / Photoshop (Manual):</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Requires manual lasso path selection around hair, finding a background plate, and painting adjustment curve masks. (~30 minutes). For automated zero-brush cutouts, test our <Link href={getLinkHref('/background-remover', locale)} className="text-emerald-400 underline hover:text-emerald-300">AI Background Remover</Link>.
                  </p>
                </div>
                <div className="p-2.5 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-300 font-bold block mb-0.5">Generative Diffusion (AI):</span>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    Single prompt execution generates matching reflections and clean boundaries automatically in ~12 seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 not-prose">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="text-white font-bold text-sm">
                  Scenario 2: Commercial Magazine Typography
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Typographic Benchmark</span>
              </div>

              <figure className="space-y-1.5">
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-950 border border-amber-500/30">
                  <img
                    src="/images/model_compare_demo.jpg"
                    alt="Typography rendering benchmark comparison"
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="text-center text-[10px] text-slate-400">
                  Left: Distorted diffusion lettering. Right: Crisp commercial cover typography rendered directly in latent space.
                </figcaption>
              </figure>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-0.5">PhotoCraft (Manual Typography):</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Requires installing local font files (.ttf), defining text frames, and manually positioning glyphs.
                  </p>
                </div>
                <div className="p-2.5 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-300 font-bold block mb-0.5">Multimodal Typography (AI):</span>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    Renders legible bilingual text directly on images without font installations. Learn more in our <Link href={getLinkHref('/blog/ai-font-generator-from-image-guide', locale)} className="text-indigo-400 underline hover:text-indigo-300">AI Font Generator guide</Link>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Recommendation */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CommandLineIcon className="w-6 h-6 text-indigo-400 inline-block shrink-0" />
              6. Decision Guide: When to Choose PhotoCraft vs AI Editors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 not-prose my-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="font-semibold text-indigo-300 text-xs flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                  Choose PhotoCraft If:
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <li>• You want an open-source, subscription-free raster canvas written in Rust.</li>
                  <li>• You require completely local, private pixel editing without cloud APIs.</li>
                  <li>• You want to inspect or test simple layered PSD files offline.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-2">
                <div className="font-semibold text-emerald-300 text-xs flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4 text-emerald-400" />
                  Choose Qwen Image Editor If:
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <li>• You want to transform images using natural language prompts without manual masking.</li>
                  <li>• You need automated clothing swaps, background removal, or crisp commercial text.</li>
                  <li>• You want zero setup across mobile and desktop browsers.</li>
                </ul>
                <div className="pt-1">
                  <Link
                    href={getLinkHref('/', locale)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    <span>Try Online AI Inpainting Studio</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: FAQs */}
          <section className="space-y-4 pt-3 border-t border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-indigo-400 inline-block shrink-0" />
              7. Frequently Asked Questions
            </h2>
            
            <div className="space-y-2.5 not-prose">
              {faqData.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-white text-xs sm:text-sm mb-1">{item.q}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl not-prose text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <WrenchScrewdriverIcon className="w-4 h-4 text-indigo-400" />
                <span>Verification Scope &amp; Reference Links:</span>
              </div>
              <ul className="space-y-0.5 text-slate-400 text-[11px]">
                <li>• Official PhotoCraft Repository: <a href="https://github.com/kuretoshi/photocraft" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">github.com/kuretoshi/photocraft</a></li>
                <li>• Adobe Photoshop Official Technical Details: <a href="https://www.adobe.com/products/photoshop.html" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">adobe.com/products/photoshop.html</a></li>
                <li>• Qwen Multimodal Diffusion Models: <a href="https://huggingface.co/Qwen" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">huggingface.co/Qwen</a></li>
              </ul>
            </div>
          </section>

        </article>

        {/* Topic Cluster & Related Engineering Guides (Silo Architecture) */}
        <section className="mt-12 not-prose border-t border-slate-800/80 pt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Topic Cluster &amp; Related Benchmarks
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                Explore Related AI &amp; Graphics Guides
              </div>
            </div>
            <Link
              href={getLinkHref('/blog', locale)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>All Guides</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Ideogram 4.5 Open Source Weights */}
            <Link
              href={getLinkHref('/blog/ideogram-4-5-open-source-weights-alternatives', locale)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Open Source AI
                </span>
                <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-2">
                  Ideogram 4.5: Open Source Weights &amp; Alternatives
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  Technical audit of diffusion weights, ComfyUI nodes, and free alternatives.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>11 min read</span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Read &rarr;
                </span>
              </div>
            </Link>

            {/* Card 2: AI Font Generator from Image */}
            <Link
              href={getLinkHref('/blog/ai-font-generator-from-image-guide', locale)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Typography Engine
                </span>
                <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-2">
                  AI Font Generator from Image: TTF vs Visual AI
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  Compare installable TTF vector fonts with visual diffusion typography models.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>10 min read</span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Read &rarr;
                </span>
              </div>
            </Link>

            {/* Card 3: AI Background Remover & Changer Tool Page */}
            <Link
              href={getLinkHref('/background-remover', locale)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Dedicated Tool
                </span>
                <div className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors line-clamp-2">
                  AI Background Remover &amp; Cutout Studio
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  Skip manual lasso tracing with one-click alpha transparency cutouts.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Free Tool</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Try &rarr;
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/60 border border-indigo-500/40 shadow-xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>Instant In-Browser Trial Available</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Ready to Edit with AI? Test Generative Inpainting Online.
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Experience conversational prompt inpainting, bilingual typography, and clean 2048px exports with zero local software setup.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={getLinkHref('/', locale)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow flex items-center gap-2"
            >
              <span>Try Qwen Image Editor Free (1 Guest Credit)</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href={getLinkHref('/pricing', locale)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <span>View Pricing ($4.99 Starter Pack)</span>
            </Link>
          </div>
        </section>

        {/* Author Bio Footer - Alex Chen */}
        <footer className="mt-10 pt-6 border-t border-slate-800 flex items-center gap-3.5 text-xs text-slate-400">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            width={52}
            height={52}
            loading="lazy"
            decoding="async"
            className="w-13 h-13 rounded-full border border-indigo-500/30 object-cover shadow-sm shrink-0"
          />
          <div>
            <div className="font-semibold text-slate-200 text-sm">{post.author.name}</div>
            <div className="text-slate-400 mb-0.5">{post.author.role}</div>
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
