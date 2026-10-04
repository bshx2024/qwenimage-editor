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
      q: 'How does Qwen Image Generator convert text to images?',
      a: 'Qwen Image Generator utilizes an advanced 7B visual diffusion transformer trained on diverse multimodal datasets. It parses detailed descriptive prompts, interprets spatial semantics, and progressively refines pixels into photorealistic scenes or artistic illustrations.',
    },
    {
      q: 'Can I generate commercial assets with Qwen Image online?',
      a: 'Yes. Images generated using Qwen Image Generator on our platform can be used for commercial websites, marketing advertisements, product illustrations, and social media without royalties.',
    },
    {
      q: 'How does Qwen Image handle bilingual and text prompts?',
      a: 'One of the unique standout strengths of the Qwen Image foundation architecture is native bilingual understanding (English and Chinese) and extraordinary text-spelling capabilities directly on posters, book covers, and signs.',
    },
    {
      q: 'Is there a limit on resolution or generation speed?',
      a: 'Free users can generate images up to 1024x1024 resolution. Pro plans unlock ultra-high definition 4K scaling, lossless PNG downloads, and high-priority dedicated GPU dispatching.',
    },
    {
      q: 'Can I edit the generated image after creating it?',
      a: 'Absolutely! You can send any generation directly into our Qwen Image Editor with one click to perform inpainting, swap backgrounds, or adjust specific objects using text instructions.',
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
        description="Generate photorealistic images and high-fidelity visuals with Qwen Image Generator online. Free AI text-to-image with superior rendering and prompt adherence."
        image="/images/model_compare_demo.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="generator" />

      <main className="flex-1 w-full">
        {/* Hero & Generator Tool */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
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
                          alt="Qwen Image Generator Result"
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
                Unlike earlier generative models that struggle with complex syntactic relationships or scramble letters into unreadable pseudo-text, Qwen Image understands deep semantic cues. It effortlessly synthesizes photorealistic lighting, cinematic depth-of-field, authentic material textures, and crystal-clear legible text banners across English and Chinese characters.
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
                    One-click handoff to Qwen Image Editor allows you to refine, tweak, and inpaint outputs without switching tools.
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
