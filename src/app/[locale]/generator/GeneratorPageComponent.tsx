'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useCommonContext } from "~/context/common-context";
import { useState } from "react";
import { useInterval } from "ahooks";
import Link from "next/link";
import { getLinkHref } from "~/configs/buildLink";
import {
  SparklesIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  ChevronDownIcon,
  BoltIcon,
  AdjustmentsVerticalIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

export default function GeneratorPageComponent({
  locale = 'en',
  searchParams,
}: {
  locale?: string;
  searchParams?: { prompt?: string };
}) {
  const {
    setShowLoginModal,
    setShowPricingModal,
    setShowGeneratingModal,
    userData,
  } = useCommonContext();

  const [prompt, setPrompt] = useState(searchParams?.prompt || '');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [selectedModel, setSelectedModel] = useState<string>('wanx2.1-t2i-turbo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>('/images/model_compare_demo.jpg');
  const [uid, setUid] = useState('');
  const [pollInterval, setPollInterval] = useState<number | undefined>(undefined);
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });

  const samplePrompts = [
    'Futuristic holographic sports car speeding through a rain-drenched cyberpunk alley, volumetric neon lighting, 8k octane render',
    'Award winning macro photograph of an iridescent glass butterfly on a luminescent crystal blossom, morning dew, bokeh',
    'A minimalist Scandinavian modern living room with large glass windows overlooking snow-capped pine mountains, warm fireplace',
    'Editorial magazine portrait of an astronaut looking at earth, intricate spacesuit details, cinematic studio lighting',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0' && !userData) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);
    setShowGeneratingModal(true);

    try {
      const res = await fetch('/api/generate/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textStr: prompt,
          taskType: 'text2image',
          user_id: userData?.user_id || 'guest',
          is_public: true,
          aspectRatio,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (data.status === 601) {
        setShowLoginModal(true);
        setIsGenerating(false);
        setShowGeneratingModal(false);
        return;
      }
      if (data.status === 602) {
        setShowPricingModal(true);
        setIsGenerating(false);
        setShowGeneratingModal(false);
        return;
      }
      if (data.uid) {
        setUid(data.uid);
        setPollInterval(3000);
      }
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setShowGeneratingModal(false);
    }
  };

  const checkPoll = async () => {
    if (!uid) return;
    try {
      const res = await fetch(`/api/works/getResultInfo?uid=${uid}&userId=${userData?.user_id || ''}`);
      const data = await res.json();
      if (data.status === 1) {
        setShowGeneratingModal(false);
        setIsGenerating(false);
        setPollInterval(undefined);
        if (data.output_url) {
          const out = Array.isArray(data.output_url) ? data.output_url[0] : data.output_url;
          setResultImage(out);
        }
      }
    } catch (e) {
      // Keep polling
    }
  };

  useInterval(() => {
    checkPoll();
  }, pollInterval);

  const faqItems = [
    {
      q: 'Can Qwen AI generate images?',
      a: 'Yes, absolutely! While many users know Qwen as a conversational language model, the Alibaba vision team developed the dedicated Qwen-Image foundation family (including Qwen Image 2.1 & 2.0). It is a powerful 7B visual diffusion transformer purpose-built for photorealistic text-to-image generation, bilingual typography, and artistic rendering directly from natural language prompts.',
    },
    {
      q: 'Is the Qwen image generator free to use online?',
      a: 'Yes, Qwen Image Generator is free to use on our web platform! Anyone can start creating images immediately with daily complimentary credits—no credit cards or paid subscriptions required.',
    },
    {
      q: 'Do I need to download Qwen model weights, GGUF files, or install ComfyUI?',
      a: 'No local setup, GGUF downloads, or Python scripts are required! Running the Qwen Image model locally typically requires downloading 20GB+ of checkpoint weights and demands 16GB–24GB of dedicated VRAM. Our cloud generator executes everything on high-throughput GPUs in the cloud, allowing instant creation in any browser on PC, Mac, or mobile devices.',
    },
    {
      q: 'Which model checkpoint is deployed (Qwen Image 2.1 vs 2.0)?',
      a: 'We deploy the flagship Qwen-Image-2.1 architecture, which features superior prompt adherence, balanced spatial composition, and refined English and Chinese typography rendering compared to legacy versions.',
    },
    {
      q: 'How does Qwen Image render clean typography and signage without spelling errors?',
      a: 'Qwen Image uses a deep multimodal language model backbone rather than a traditional small CLIP encoder. This allows it to interpret exact letters inside quotation marks, positioning clean, readable text on posters, packaging, t-shirts, and neon signs without typical AI gibberish.',
    },
    {
      q: 'What are the content safety and NSFW moderation policies?',
      a: 'Our generator enforces responsible AI safety guardrails against malicious, illegal, and explicit material while granting broad creative freedom for photorealistic portraiture, design mockups, concept art, and digital illustrations.',
    },
    {
      q: 'Can I edit or inpaint my generated creations?',
      a: 'Yes! With our integrated workflow, simply click "Edit this in Qwen Image Editor" below your result to seamlessly inpaint regions, swap backgrounds, or adjust character clothing using natural language instructions.',
    },
    {
      q: 'Can I use images generated with Qwen for commercial merchandise and client work?',
      a: 'Yes. All visual art and assets generated through your account belong to you and can be utilized for commercial websites, marketing campaigns, client commissions, and merchandise without royalty fees.',
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Qwen Image Generator',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web-based',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
        description:
          'Free online Qwen Image Generator to generate high-fidelity AI images, digital art, and marketing visuals from natural language prompts.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qwenimage-editor.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Qwen Image Generator',
            item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qwenimage-editor.com'}/generator`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <HeadInfo
        locale={locale}
        page="generator"
        title="Qwen Image Generator — Free Online AI Image Generator"
        description="Generate photorealistic images and high-fidelity visuals with Qwen Image Generator. Free online AI text-to-image with superior rendering and prompt adherence."
        image="/images/model_compare_demo.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="generator" />

      <main className="flex-1 w-full">
        {/* Hero & Generator Tool */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex justify-center mb-6">
              <ol className="inline-flex items-center space-x-1 sm:space-x-2 text-xs text-slate-400">
                <li className="inline-flex items-center">
                  <Link href={getLinkHref(locale, '')} className="text-slate-400 hover:text-indigo-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-1.5 text-slate-600">/</span>
                    <span className="text-slate-200 font-semibold">Qwen Image Generator</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-md">
                <SparklesIcon className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Text to Image AI Generation</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Free Online Qwen Image Generator
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Turn your imagination into high-resolution visuals. Enjoy industry-leading typography rendering, photorealism, and prompt adherence for free online.
              </p>
            </div>

            {/* Interactive Generator Interface */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4 sm:p-7 shadow-2xl shadow-indigo-950/40">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Input Form & Parameters */}
                <div className="lg:col-span-6 space-y-6">
                  <form onSubmit={handleGenerate} className="space-y-5">
                    <div>
                      <label htmlFor="genPrompt" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Text Prompt
                      </label>
                      <div className="relative rounded-2xl border border-slate-700 bg-slate-950 p-3 focus-within:border-indigo-500 transition-all">
                        <textarea
                          id="genPrompt"
                          rows={4}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe the image you want to create (e.g., 'A vintage cyberpunk poster advertising Neo-Tokyo Ramen Bar, neon reflections, 8k cinematic lighting')..."
                          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                        />
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 mt-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-lg px-2.5 py-1 text-slate-300 transition-colors">
                            <CpuChipIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-[11px] text-slate-400 font-medium shrink-0">Model:</span>
                            <select
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="bg-transparent text-[11px] font-semibold text-purple-300 focus:outline-none cursor-pointer pr-1"
                            >
                              <option value="wanx2.1-t2i-turbo" className="bg-slate-900 text-slate-200">
                                Qwen / Wanx 2.1 Turbo (Fast ⚡)
                              </option>
                              <option value="wanx2.1-t2i-plus" className="bg-slate-900 text-slate-200">
                                Wanx 2.1 Plus (Ultra-HD 🌟)
                              </option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPrompt('')}
                            className="text-slate-500 hover:text-slate-300 text-[11px]"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Aspect Ratio Selector */}
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Aspect Ratio
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: '1:1', label: '1:1 Square', icon: '1024×1024' },
                          { id: '16:9', label: '16:9 Landscape', icon: '1344×768' },
                          { id: '9:16', label: '9:16 Portrait', icon: '768×1344' },
                        ].map((ratio) => (
                          <button
                            key={ratio.id}
                            type="button"
                            onClick={() => setAspectRatio(ratio.id as any)}
                            className={`rounded-xl border p-3 text-left transition-all ${
                              aspectRatio === ratio.id
                                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md'
                                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-semibold">{ratio.label}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{ratio.icon}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Inspirations */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                        Click to Try Prompt:
                      </span>
                      <div className="space-y-1.5">
                        {samplePrompts.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPrompt(sample)}
                            className="block w-full text-left rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors truncate"
                          >
                            &ldquo;{sample}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            <span>Generating Image with Qwen...</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4" />
                            <span>Generate with Qwen Image</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Preview Area */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Generated Output Preview
                  </span>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden">
                    {resultImage ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={resultImage}
                          alt="Qwen Image Generator Visual Output"
                          width={768}
                          height={440}
                          loading="lazy"
                          className="w-full max-h-[440px] rounded-xl object-contain shadow-2xl"
                        />
                        <div className="mt-4 w-full flex items-center justify-between pt-3 border-t border-slate-800/80">
                          <Link
                            href={getLinkHref(locale, '')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                          >
                            Edit this in Qwen Image Editor →
                          </Link>
                          <a
                            href={resultImage}
                            download="qwen-generated-image.png"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-100 transition-colors"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download High-Res
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 space-y-3">
                        <PhotoIcon className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-sm text-slate-400">Your AI generation will appear here</p>
                        <p className="text-xs text-slate-600">Enter a prompt on the left to start</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Step Tutorial Section */}
        <section className="py-16 border-t border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">How to Generate in 3 Steps</h2>
              <p className="text-sm text-slate-400 mt-2">
                Simple and effective text-to-image workflow for designers and content creators.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <span className="text-3xl font-black text-purple-500/40 mb-2 block">STEP 01</span>
                <h3 className="text-base font-bold text-white mb-2">Formulate Your Idea</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide specific details on subject, setting, lighting, artistic medium, and color palette. Mention required text strings in quotes if needed.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <span className="text-3xl font-black text-indigo-500/40 mb-2 block">STEP 02</span>
                <h3 className="text-base font-bold text-white mb-2">Configure Dimensions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select 1:1 for social avatars and Instagram posts, 16:9 for YouTube thumbnails and desktop wallpapers, or 9:16 for TikTok and mobile stories.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <span className="text-3xl font-black text-pink-500/40 mb-2 block">STEP 03</span>
                <h3 className="text-base font-bold text-white mb-2">Synthesize & Refine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hit generate to trigger Qwen cloud GPUs. Preview the output in seconds, download in high definition, or export directly to our editor for further tweaks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Parameters & Technical Specifications */}
        <section className="py-16 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Parameters & Generation Settings
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Understanding the technical controls for maximum prompt adherence.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/80 text-slate-300 font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Parameter</th>
                    <th scope="col" className="px-6 py-3.5">Default Value</th>
                    <th scope="col" className="px-6 py-3.5">Optimal Range</th>
                    <th scope="col" className="px-6 py-3.5">Description & Best Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-400">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-white">Prompt Adherence (CFG)</td>
                    <td className="px-6 py-4">3.5</td>
                    <td className="px-6 py-4">2.5 — 5.0</td>
                    <td className="px-6 py-4">Controls how strictly the model follows your instructions without introducing artificial saturation.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-white">Inference Steps</td>
                    <td className="px-6 py-4">28 steps</td>
                    <td className="px-6 py-4">20 — 50 steps</td>
                    <td className="px-6 py-4">Number of diffusion denoising iterations. 28 steps achieves an optimal balance between quality and speed.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-white">Text Rendering Precision</td>
                    <td className="px-6 py-4">Native Built-in</td>
                    <td className="px-6 py-4">Bilingual</td>
                    <td className="px-6 py-4">Enclose text in double quotes inside your prompt for accurate typographic rendering on signs and book covers.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-white">Negative Prompt</td>
                    <td className="px-6 py-4">Auto-filtered</td>
                    <td className="px-6 py-4">NSFW, blur, distortion</td>
                    <td className="px-6 py-4">Suppresses undesirable attributes, blurry artifacts, anatomical deformities, and illegal elements.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What is & Why Choose (Rich Editorial Content ≥ 800 words) */}
        <section className="py-16 border-t border-slate-900 bg-slate-950/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            <article className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What is Qwen Image Generator?
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                <strong>Qwen Image Generator</strong> is a breakthrough generative AI foundation platform engineered by Alibaba&apos;s Qwen research team. Representing an evolutionary leap beyond legacy diffusion frameworks, it unifies state-of-the-art multimodal language understanding with a high-capacity 7B visual diffusion backbone.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Unlike earlier generative models that struggle with complex syntactic relationships or scramble letters into unreadable pseudo-text, Qwen Image understands deep semantic cues. It effortlessly synthesizes photorealistic lighting, cinematic depth-of-field, authentic material textures, and crystal-clear legible text banners across English and Chinese characters. If you already have a photo and wish to perform localized inpainting or character editing, visit our <Link href={getLinkHref(locale, '')} className="text-indigo-400 font-medium underline hover:text-indigo-300">Free Online Qwen Image Editor</Link>.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Why Choose Qwen Image Generator Over Other AI Models?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Flawless Text Rendering</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Render clean signs, logos, branding mockups, and merchandise graphics with zero spelling blurs.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Superior Prompt Adherence</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Multimodal LLM conditioning ensures every specified object, color, and spatial relation is respected.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Free Online Instant Access</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No complicated Discord bots or local GPU installations required. Simply type and generate in your browser.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Seamless Editor Integration</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    One-click handoff to our <Link href={getLinkHref(locale, '')} className="text-cyan-400 font-medium underline hover:text-cyan-300">Qwen Image Editor</Link> allows you to refine, tweak, and inpaint outputs without switching tools.
                  </p>
                </div>
              </div>
            </article>

            {/* Related Comparisons & Internal Links */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Related Comparisons & Benchmarks:
              </h3>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={getLinkHref(locale, 'vs-midjourney')}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-indigo-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  Qwen Image 2.1 vs Midjourney →
                </Link>
                <Link
                  href={getLinkHref(locale, 'vs-nano-banana')}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-indigo-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  Qwen Image 2.1 vs Nano Banana →
                </Link>
                <Link
                  href={getLinkHref(locale, 'vs-flux')}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-indigo-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  Qwen Image 2.1 vs Flux →
                </Link>
                <Link
                  href={getLinkHref(locale, '')}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-indigo-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  Online Photo Editor →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Prompt Engineering & Style Recipes */}
        <section className="py-16 border-t border-slate-900 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Prompt Engineering Guide
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Creative Prompt Recipes for Text-to-Image Generation
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Unlock the full expressive power of the underlying vision model. Discover proven formulas across photorealistic portraiture, brand design, and fantasy worldbuilding.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Photorealism
                </span>
                <h3 className="text-base font-bold text-white">Cinematic Portraits</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Combine focal length qualifiers with organic lighting cues to capture photorealistic depth of field, authentic micro-textures, and emotional character intensity.
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-indigo-300">
                  &quot;Editorial fashion portrait, candid expression, 85mm f/1.4 lens, natural golden hour rim light, 8k raw photo.&quot;
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  Commercial
                </span>
                <h3 className="text-base font-bold text-white">Typography & Mockups</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Explicitly specify legible text labels inside quotes. The multimodal encoder positions the typographic elements with correct font spacing and material reflections.
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-purple-300">
                  &quot;Craft beer aluminum can design on frosted counter, clear bold typography reading &apos;ARCTIC ALE&apos;, condensation drops.&quot;
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">
                  Concept Art
                </span>
                <h3 className="text-base font-bold text-white">Sci-Fi Worldbuilding</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Layer atmospheric descriptors such as volumetric fog, architectural scale, and vibrant color gradients to evoke striking futuristic landscapes.
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-pink-300">
                  &quot;Vast subterranean cyberpunk metropolis, towering neon holograms, aerial sky-trains, wet asphalt reflections, wide panoramic angle.&quot;
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Illustration
                </span>
                <h3 className="text-base font-bold text-white">3D Isometric Scenes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate playful, highly detailed diorama renders suitable for game design assets, app landing illustrations, and merchandise graphics.
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-cyan-300">
                  &quot;Cute miniature isometric coffee shop diorama, pastel clay style, warm ambient interior lighting, octane render, clean white backdrop.&quot;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture & Deep Learning Foundations */}
        <section className="py-16 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Core Technology
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Architecture of the 7B Vision-Language Foundation Model
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Learn why Qwen Image delivers unprecedented spatial alignment, precise character morphology, and multilingual literacy compared to legacy diffusion architectures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
                  Native Multimodal Tokenizer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instead of relying on a tiny frozen text encoder like CLIP, the foundation system utilizes a 7B scale language model capable of parsing long-form descriptions, complex spatial prepositions, and fine-grained visual hierarchies without token truncation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
                  Diffusion Transformer (DiT)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Replaces traditional UNet bottlenecks with scalable self-attention transformers. Every image patch directly attends to conditional prompt tokens across all generative time-steps, ensuring sharp geometry and harmonious balance across varying aspect ratios.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span>
                  Bilingual Character Literacy
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extensively pre-trained on millions of real-world text-heavy designs, book covers, and packaging mockups. The network synthesizes legible English and Chinese typography with proper glyph topology, font weight consistency, and surface perspective.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  Spatial Entity Alignment
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Advanced positional embeddings prevent subject bleeding. Specify multi-object relationships like &quot;a vintage wooden chair placed to the left of an arched glass window&quot; and the generator anchors each element into accurate three-dimensional space without chaotic overlaps.
                </p>
              </div>
            </div>

            {/* Pro-Tips Banner */}
            <div className="mt-10 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Pro Creator Tip 1: Optimal 4-Part Prompt Formula
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For optimal high-definition realism, structure your prompt sequentially: <strong>[Subject & Action]</strong> + <strong>[Environment & Spatial Backdrop]</strong> + <strong>[Lighting & Mood]</strong> + <strong>[Camera Lens & Material Texture]</strong>. This systematic structure prevents concept bleeding and maximizes the diffusion model&apos;s semantic reasoning power.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Pro Creator Tip 2: Composition & Aspect Ratios
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose your aspect ratio purposefully: use <strong>16:9 widescreen</strong> for cinematic landscapes, YouTube thumbnails, and desktop banners; <strong>9:16 vertical</strong> for TikTok, Instagram Reels, and mobile wallpapers; and <strong>1:1 square</strong> for profile avatars and product icons. After generating your visual, a single click transfers it directly into our integrated editor for localized inpainting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-slate-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Generator Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
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

      <Footer locale={locale} page="generator" />
    </div>
  );
}
