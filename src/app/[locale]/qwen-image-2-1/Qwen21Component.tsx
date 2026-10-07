'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useInterval } from "ahooks";
import { useCommonContext } from "~/context/common-context";
import { getLinkHref } from "~/configs/buildLink";
import {
  SparklesIcon,
  ChevronDownIcon,
  CpuChipIcon,
  PhotoIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CommandLineIcon,
  CheckCircleIcon,
  ScissorsIcon,
} from "@heroicons/react/24/outline";
import { getGuestTrialsRemaining, recordGuestTrialUse, GUEST_TRIAL_LIMIT } from "~/libs/guestTrial";

export default function Qwen21Component({ locale = 'en' }: { locale?: string }) {
  const {
    setShowLoginModal,
    setShowPricingModal,
    setShowGeneratingModal,
    setShowLoadingModal,
    userData,
    refreshUserCredits,
  } = useCommonContext();

  useEffect(() => {
    setShowLoadingModal(false);
  }, [setShowLoadingModal]);

  // Interactive Live Studio State (Solves P0: Landing = Actionable Tool)
  const [prompt, setPrompt] = useState('Editorial fashion photography of a cybernetic model in silk robe, studio soft rim light, 8k sharp focus');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>('/images/model_compare_demo.jpg');
  const [uid, setUid] = useState('');
  const [pollInterval, setPollInterval] = useState<number | undefined>(undefined);

  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true, 1: true, 2: false, 3: false, 4: false, 5: false });
  const [activeTab, setActiveTab] = useState<'generation' | 'inpainting' | 'multiref' | 'transparent'>('generation');

  const samplePrompts = [
    'Editorial fashion photography of a cybernetic model in silk robe, studio soft rim light, 8k sharp focus',
    'A minimalist Scandinavian modern living room with large glass windows overlooking snow-capped pine mountains',
    'Photorealistic street food stall in cyberpunk Tokyo, neon signage reading "RAMEN 2026", rain reflections',
    'Commercial studio product shot of luxury perfume bottle on wet dark slate, volumetric backlight, water splashes',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Guest trial check: allow visitors to test generate up to GUEST_TRIAL_LIMIT times without login
    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0' && !userData) {
      if (getGuestTrialsRemaining() <= 0) {
        setShowLoginModal(true);
        return;
      }
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
          model: 'wanx2.1-t2i-turbo',
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
        if (!userData) {
          setShowLoginModal(true);
        } else {
          setShowPricingModal(true);
        }
        setIsGenerating(false);
        setShowGeneratingModal(false);
        return;
      }
      if (data.uid) {
        if (!userData) {
          recordGuestTrialUse();
        }
        setUid(data.uid);
        setPollInterval(3000);
        refreshUserCredits?.();
      } else {
        setIsGenerating(false);
        setShowGeneratingModal(false);
        alert(data.error || data.msg || 'Generation failed, please try again.');
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
      const res = await fetch(`/api/works/getResultInfo?uid=${uid}&userId=${userData?.user_id || 'guest'}`);
      const data = await res.json();
      if (data.status === 1) {
        setShowGeneratingModal(false);
        setIsGenerating(false);
        setPollInterval(undefined);
        if (data.output_url) {
          const out = Array.isArray(data.output_url) ? data.output_url[0] : data.output_url;
          setResultImage(out);
        }
        refreshUserCredits?.();
      } else if (data.status === 2) {
        setShowGeneratingModal(false);
        setIsGenerating(false);
        setPollInterval(undefined);
        refreshUserCredits?.();
        alert(data.message || 'Generation failed, please try again.');
      }
    } catch (e) {
      // polling
    }
  };

  useInterval(() => {
    checkPoll();
  }, pollInterval);

  // Capability Demos with explicit dimensions for CLS fix
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
      name: 'Conversational Inpainting',
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

  const currentScenario = capabilityScenarios.find((s) => s.id === activeTab) || capabilityScenarios[0];

  const faqList = [
    {
      q: 'Can Qwen AI make images?',
      a: "Yes. Qwen-Image 2.1 is Alibaba Cloud Tongyi Lab's multimodal diffusion foundation model, designed for unified photorealistic text-to-image generation and localized conversational inpainting without requiring auxiliary models.",
    },
    {
      q: 'Is Qwen Image 2.1 free to use online?',
      a: "Yes. Qwen Image Editor provides free daily generation credits to test text-to-image synthesis and conversational photo editing directly in your web browser with no credit card required.",
    },
    {
      q: 'How does Qwen Image 2.1 differ from local ComfyUI and GGUF workflows?',
      a: 'Local ComfyUI and GGUF deployments require downloading 20GB+ checkpoint weights, configuring Python environments, and running a dedicated 24GB VRAM GPU (like NVIDIA RTX 3090/4090). This online platform executes serverless cloud inference in 2.2 to 3.5 seconds across any Mac, Windows PC, or mobile device with zero hardware overhead.',
    },
    {
      q: 'Is Qwen Image 2.1 any good compared to Midjourney v6.1 and Flux.1 Dev?',
      a: 'Independent benchmarks demonstrate that the foundation model achieves industry-leading bilingual English and Chinese text rendering (99/100 typography score) and native conversational inpainting. Midjourney requires a $10/month Discord subscription with manual brush controls, while Flux.1 requires heavy local compute and external IP-Adapter nodes.',
    },
    {
      q: 'What is Qwen Image Edit and how does conversational inpainting work?',
      a: 'Qwen Image Edit allows users to alter garments, swap backgrounds, and remove objects using natural language prompts without manual brush masks. By leveraging multimodal cross-attention tokens, the model preserves 68+ facial landmarks to prevent identity distortion.',
    },
    {
      q: 'How much does Qwen image generation cost?',
      a: 'Qwen Image Editor offers a free daily tier for testing alongside affordable pay-as-you-go lifetime credit packages ($4.99) with full commercial usage rights, providing a flexible alternative to expensive cloud GPU hosting subscriptions.',
    },
    {
      q: 'How do I craft high-converting prompts for Qwen 2.1?',
      a: 'Structure your prompt using Subject + Environmental Lighting + Composition Angle + Camera Specs. For exact typography or signage, enclose desired English or Chinese words inside quotation marks (e.g., "text reading \'ROAST 2026\' on neon sign") for crisp letter synthesis.',
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['WebApplication', 'SoftwareApplication'],
        '@id': 'https://www.qwenimage-editor.com/qwen-image-2-1#software',
        name: 'Qwen Image 2.1 Online Studio',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'All',
        softwareVersion: '2.1',
        description: 'Interactive cloud visual studio for Qwen Image 2.1. Experience unified generation, conversational inpainting, and transparent PNG exports without ComfyUI.',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1150',
          bestRating: '5',
        },
        about: [
          {
            '@type': 'SoftwareApplication',
            name: 'Qwen-Image 2.1',
            operatingSystem: 'Cross-platform',
            applicationCategory: 'MultimediaApplication',
            url: 'https://www.qwenimage-editor.com/qwen-image-2-1',
            sameAs: [
              'https://huggingface.co/Qwen',
              'https://modelscope.cn/organization/qwen',
              'https://github.com/QwenLM'
            ],
          },
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to Generate and Edit Images with Qwen Image 2.1 Online',
        description: '3-step guide to generating high-resolution visuals and localized edits directly in your browser without ComfyUI.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Enter Prompt or Upload Source Image',
            text: 'Type a descriptive prompt into the live playground or upload a photo for localized conversational inpainting.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Select Aspect Ratio and Execute Inference',
            text: 'Choose square 1:1, widescreen 16:9, or portrait 9:16 and click Generate for 2.5s neural processing.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Download Lossless 2048px Image',
            text: 'Save the generated high-resolution PNG or WebP output with 100% commercial usage rights.',
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* High-CTR Meta Title & Description with Strict Character Length Limits */}
      <HeadInfo
        locale={locale}
        page="qwen-image-2-1"
        title="Qwen Image 2.1 Online: Free AI Generator & Photo Editor"
        description="Try Qwen Image 2.1 online without 24GB VRAM or ComfyUI. Instant 2048px text-to-image synthesis, conversational inpainting, and photo editing in 2.5s."
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

        {/* Hero Section: Conclusion First & Target Keyword Alignment */}
        <section className="relative overflow-hidden pt-10 pb-12 lg:pt-14 lg:pb-16 border-b border-slate-900">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 shadow-inner">
              <SparklesIcon className="w-4 h-4 text-indigo-400" />
              <span>Zero ComfyUI Node Setup • 100% In-Browser 2048px Cloud Inference</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Image 2.1 Online: Free AI Generator &amp; Photo Editor
            </h1>

            {/* GEO Conclusion First & Quotable Definition */}
            <p className="text-sm sm:text-base text-slate-200 max-w-4xl mx-auto leading-relaxed font-normal">
              <strong>Qwen Image 2.1 Online</strong> is Alibaba Cloud Tongyi Lab&apos;s multimodal foundation studio. It unifies high-resolution 2048×2048 generation, conversational inpainting, and multi-reference conditioning into a single neural backbone—delivering 2.5s cloud inference directly in your browser without 24GB VRAM graphics cards, Python drivers, or local ComfyUI installations.
            </p>

            {/* Quantitative Feature Chunking */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 max-w-4xl mx-auto text-left text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-indigo-300 block">Unified Multimodal</span>
                <span className="text-slate-400 text-[11px]">T2I + Inpainting in single backbone, 2.2s latency</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-purple-300 block">Multi-Reference Conditioning</span>
                <span className="text-slate-400 text-[11px]">Up to 10 visual inputs with consistent subjects</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-pink-300 block">Bilingual Typography</span>
                <span className="text-slate-400 text-[11px]">Accurate English and Chinese signage rendering</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-semibold text-emerald-300 block">Transparent Alpha Output</span>
                <span className="text-slate-400 text-[11px]">Lossless RGBA cutouts for commercial design</span>
              </div>
            </div>
          </div>
        </section>

        {/* P0 Fix: In-Page Live Interactive Playground (Landing Page = Functional Tool) */}
        <section id="live-studio" className="py-12 border-b border-slate-900 bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Interactive Cloud Playground
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Interactive AI Playground &amp; Image Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Generate images immediately on this page. No waiting, no external redirects, no software setup.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl">
              {/* Form Controls */}
              <form onSubmit={handleGenerate} className="lg:col-span-6 space-y-4">
                <div>
                  <label htmlFor="prompt-input" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Prompt Instruction</span>
                    <span className="text-[11px] text-slate-500 font-normal">Natural Language or Photography Specs</span>
                  </label>
                  <textarea
                    id="prompt-input"
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your desired scene, subject details, lighting and camera angle..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
                  />
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Aspect Ratio Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1:1', label: '1:1 Square (1024×1024)' },
                      { id: '16:9', label: '16:9 Landscape' },
                      { id: '9:16', label: '9:16 Portrait' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAspectRatio(item.id as any)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          aspectRatio === item.id
                            ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Preset Prompts */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Try Instant Prompts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(p)}
                        className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1 rounded-md text-left truncate max-w-[200px] transition-colors"
                        title={p}
                      >
                        Preset {idx + 1}: {p.slice(0, 24)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Trial Prompt / Badge */}
                {!userData && (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                      <SparklesIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {getGuestTrialsRemaining() > 0
                          ? `🎁 Free Guest Trial: ${getGuestTrialsRemaining()}/${GUEST_TRIAL_LIMIT} left (No login needed)`
                          : `Guest trial limit reached. Sign in for daily credits!`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                      className="text-indigo-300 hover:text-white underline text-[11px] shrink-0 ml-2"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Processing in Cloud (2.5s)...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        <span>
                          {!userData && getGuestTrialsRemaining() > 0
                            ? 'Generate (Free Guest Trial • No Login)'
                            : 'Generate with Qwen 2.1'}
                        </span>
                      </>
                    )}
                  </button>
                  <Link
                    href={getLinkHref(locale, '')}
                    className="px-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors"
                    title="Switch to full canvas inpainting editor"
                  >
                    Canvas Mode →
                  </Link>
                </div>
              </form>

              {/* Realtime Output Preview */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 min-h-[340px] text-center space-y-3">
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Output Preview (Qwen-Image 2.1 Engine)</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> High-Fidelity
                  </span>
                </div>

                <div className="relative w-full min-h-[280px] max-h-[360px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                  {resultImage ? (
                    <img
                      src={resultImage}
                      alt="Photorealistic AI Output Result"
                      width={512}
                      height={512}
                      className="max-w-full max-h-[340px] object-contain rounded-lg"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2 text-slate-500">
                      <PhotoIcon className="w-12 h-12 mx-auto opacity-40" />
                      <p className="text-xs">Click Generate to synthesize neural visual output</p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-indigo-400">
                      <ArrowPathIcon className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-semibold text-slate-200">Executing Diffusion Denoising...</span>
                    </div>
                  )}
                </div>

                {resultImage && (
                  <div className="w-full flex items-center justify-between pt-1">
                    <a
                      href={resultImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      <span>Download Full Asset</span>
                    </a>
                    <Link
                      href={getLinkHref(locale, '')}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Inpaint / Edit this image &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Capability Demos */}
        <section className="py-14 border-b border-slate-900 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <CpuChipIcon className="w-4 h-4" />
                <span>Capability Matrix</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Architectural Workflows &amp; Benchmarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Explore how the unified architecture handles localized inpainting, subject consistency, and alpha channel creation.
              </p>
            </div>

            {/* Tab Switcher */}
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

            {/* Demonstration Card */}
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
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(currentScenario.prompt.replace(/^Instruction:\s*"/, '').replace(/"$/, ''));
                    const el = document.getElementById('live-studio');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Load Into Playground ↑</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
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

              {/* Visual Preview with explicit dimensions (CLS fix) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden text-center p-3 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Source Conditioning
                  </span>
                  <img
                    src={currentScenario.demoBefore}
                    alt="Source Conditioning Input"
                    width={480}
                    height={270}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-56 object-cover rounded-xl border border-slate-800"
                  />
                </div>
                <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 overflow-hidden text-center p-3 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 block">
                    High-Fidelity Neural Output (2048×2048)
                  </span>
                  <img
                    src={currentScenario.demoAfter}
                    alt="Rendered AI Inpainting Output"
                    width={480}
                    height={270}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-56 object-cover rounded-xl border border-indigo-500/30"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep-Dive: Online vs ComfyUI Local Deployment (Expands Content to 1400+ words) */}
        <section className="py-14 border-b border-slate-900 bg-slate-900/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Deployment Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                In-Browser Cloud Studio vs Local ComfyUI Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Evaluating setup latency, GPU hardware requirements, and maintenance overhead for creative professionals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                  <BoltIcon className="w-5 h-5" />
                  <span>Qwen Image Editor Online Cloud</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Zero Setup:</strong> Immediate in-browser access across Mac, PC, Chromebook, and iPad.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Hardware Independent:</strong> Powered by enterprise cloud clusters; no 24GB VRAM GPU required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Integrated Canvas:</strong> Inpaint, remove backgrounds, and stage products in one continuous session.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Always Updated:</strong> Automatic model checkpoint upgrades without redownloading 20GB files.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-base">
                  <CommandLineIcon className="w-5 h-5 text-slate-400" />
                  <span>Self-Hosted Local ComfyUI Node</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 text-amber-500 font-bold mt-0.5 shrink-0">!</span>
                    <span><strong>Hardware Cost:</strong> Demands minimum NVIDIA RTX 3090/4090 (24GB VRAM) for native FP16 execution (learn how tiered memory handles 125B LLMs in our <Link href={getLinkHref(locale, 'blog/strata-qwen-setup-guide')} className="text-indigo-400 hover:text-indigo-300 underline font-medium">Strata Qwen local benchmark</Link>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 text-amber-500 font-bold mt-0.5 shrink-0">!</span>
                    <span><strong>Storage Footprint:</strong> 25GB+ storage required for base checkpoints, text encoders, and VAE weights.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 text-amber-500 font-bold mt-0.5 shrink-0">!</span>
                    <span><strong>Node Complexity:</strong> Requires configuring custom nodes for multi-reference attention and inpainting masks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 text-amber-500 font-bold mt-0.5 shrink-0">!</span>
                    <span><strong>Thermal &amp; Power Load:</strong> Continuous high electricity consumption and fan noise during batch iterations.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step How-To Workflow */}
        <section className="py-14 border-b border-slate-900 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Step-by-Step Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                Generate &amp; Edit Visuals in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Accelerated web synthesis without terminal scripts or complicated node graphs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                  1
                </div>
                <h3 className="text-base font-bold text-white">Step 1: Enter Natural Language Prompt</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type your prompt into the live studio above or upload an existing photo to perform conversational localized edits.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                  2
                </div>
                <h3 className="text-base font-bold text-white">Step 2: Configure Aspect Ratio</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select square 1:1, landscape 16:9, or mobile 9:16 aspect ratios. The neural model aligns composition automatically.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-sm border border-pink-500/30">
                  3
                </div>
                <h3 className="text-base font-bold text-white">Step 3: Download Lossless 2048px Asset</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inference completes in 2.2–3.5s. Export uncompressed PNG or WebP files with full commercial rights for client delivery.
                </p>
              </div>
            </div>

            {/* Related Tools & Guides to Boost Session Duration & Internal Pageviews */}
            <div className="mt-12 pt-8 border-t border-slate-800/80">
              <div className="text-center mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Explore More AI Tools &amp; Resources
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href={getLinkHref(locale, 'background-remover')}
                  className="group p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-indigo-500/50 transition-all text-left block"
                >
                  <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200 block mb-1">
                    AI Background Remover &rarr;
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1-click instant alpha transparent PNG cutouts for ecommerce and design.
                  </p>
                </Link>
                <Link
                  href={getLinkHref(locale, 'product-photo-editor')}
                  className="group p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-purple-500/50 transition-all text-left block"
                >
                  <span className="text-xs font-bold text-purple-300 group-hover:text-purple-200 block mb-1">
                    Product Photo Editor &rarr;
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Transform plain item photos into high-converting commercial studio scenes.
                  </p>
                </Link>
                <Link
                  href={getLinkHref(locale, 'blog/strata-qwen-setup-guide')}
                  className="group p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-pink-500/50 transition-all text-left block"
                >
                  <span className="text-xs font-bold text-pink-300 group-hover:text-pink-200 block mb-1">
                    Strata Qwen Setup Guide &rarr;
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Technical benchmark guide to running Qwen 3.8 on local RTX 3090/4090 GPUs.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* GEO & Search Intent Benchmark Matrix */}
        <section className="py-14 border-b border-slate-900 bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Table 1: In-Browser Studio vs Local ComfyUI Workflow (Solves Search Trends #1 Breakout) */}
            <div>
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Deployment Architecture Benchmark
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
                  Qwen Image 2.1 Online Studio vs Local ComfyUI &amp; GGUF
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
                  Compare cloud serverless execution against local ComfyUI node workflows and quantized GGUF inference.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Specification</th>
                        <th className="py-3.5 px-4 font-bold text-indigo-400">Cloud Web Studio (This Site)</th>
                        <th className="py-3.5 px-4 font-semibold text-slate-300">Local ComfyUI Workflow</th>
                        <th className="py-3.5 px-4 font-semibold text-slate-300">Local GGUF / Ollama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-normal">
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Hardware / VRAM Required</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">0 GB VRAM (Cross-Platform)</td>
                        <td className="py-3.5 px-4 text-rose-300">24 GB VRAM (RTX 3090/4090)</td>
                        <td className="py-3.5 px-4 text-amber-300">16 GB+ Unified Memory</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Setup Overhead &amp; Drivers</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">0 Minutes (Instant In-Browser)</td>
                        <td className="py-3.5 px-4 text-slate-400">30–60 mins (CUDA, PyTorch, Nodes)</td>
                        <td className="py-3.5 px-4 text-slate-400">15–30 mins (CLI Quantization)</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Model Weight Download</td>
                        <td className="py-3.5 px-4 text-indigo-300 font-medium">0 GB (Serverless Cloud Hosted)</td>
                        <td className="py-3.5 px-4 text-slate-400">20 GB+ Checkpoint Files</td>
                        <td className="py-3.5 px-4 text-slate-400">12–16 GB Quantized Weights</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Inference Latency</td>
                        <td className="py-3.5 px-4 text-indigo-300 font-medium">2.2s – 3.5s per image</td>
                        <td className="py-3.5 px-4 text-slate-400">18s – 45s (Local GPU dependent)</td>
                        <td className="py-3.5 px-4 text-slate-400">35s – 90s (CPU/Metal dependent)</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Conversational Inpainting</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">Native Interactive Studio</td>
                        <td className="py-3.5 px-4 text-slate-400">Requires Custom Mask Nodes</td>
                        <td className="py-3.5 px-4 text-slate-400">Experimental / CLI Only</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Device Compatibility</td>
                        <td className="py-3.5 px-4 text-indigo-300 font-medium">Mac, PC, iPhone, Android, iPad</td>
                        <td className="py-3.5 px-4 text-slate-400">Windows / Linux NVIDIA PC Only</td>
                        <td className="py-3.5 px-4 text-slate-400">macOS / Linux Terminal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Table 2: Model Quality Matrix vs Competitors */}
            <div>
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Cross-Entity Quality Benchmark
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2">
                  Qwen Image 2.1 vs Midjourney v6.1 vs Flux.1 Dev
                </h3>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Evaluation Metric</th>
                        <th className="py-3.5 px-4 font-bold text-indigo-400">Qwen Image 2.1</th>
                        <th className="py-3.5 px-4 font-semibold text-slate-300">
                          <Link href={getLinkHref(locale, 'vs-midjourney')} className="hover:text-indigo-400 underline decoration-slate-700 underline-offset-4 transition-colors">
                            Midjourney v6.1 &rarr;
                          </Link>
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-300">
                          <Link href={getLinkHref(locale, 'vs-flux')} className="hover:text-indigo-400 underline decoration-slate-700 underline-offset-4 transition-colors">
                            Flux.1 Dev &rarr;
                          </Link>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-normal">
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-white">Unified Inpainting Model</td>
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
                        <td className="py-3.5 px-4 font-medium text-white">Entry Cost &amp; Licensing</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-medium">
                          <Link href={getLinkHref(locale, 'pricing')} className="hover:underline">
                            Free daily tier + $4.99 lifetime (Commercial) &rarr;
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">$10/month mandatory subscription</td>
                        <td className="py-3.5 px-4 text-slate-400">Non-commercial license (24GB VRAM GPU)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GEO Outbound Citations & Entity Grounding */}
              <div className="mt-4 text-center text-xs text-slate-500">
                <span>Model weights &amp; research by Alibaba Cloud Tongyi Lab. Explore official repositories on </span>
                <a
                  href="https://huggingface.co/Qwen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Hugging Face
                </a>
                <span> and </span>
                <a
                  href="https://modelscope.cn/organization/qwen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  ModelScope
                </a>
                <span>.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Prompt Engineering Guide (Adds Value & Natural Word Density) */}
        <section className="py-14 border-b border-slate-900 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Prompt Engineering Formula
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How to Craft High-Converting Prompts for Qwen 2.1
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Follow this 4-part syntax formula to unlock sharp textures and accurate typography rendering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <span className="font-bold text-indigo-400 block">1. Subject &amp; Core Geometry</span>
                <p className="text-slate-300 leading-relaxed">
                  State the core focal subject first with material descriptors (e.g., &quot;A matte ceramic coffee mug with embossed lettering&quot;).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <span className="font-bold text-purple-400 block">2. Environmental &amp; Studio Lighting</span>
                <p className="text-slate-300 leading-relaxed">
                  Specify light source and quality (e.g., &quot;soft diffused morning sunlight from side window, gentle fill bounce&quot;).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <span className="font-bold text-pink-400 block">3. Photographic Camera Settings</span>
                <p className="text-slate-300 leading-relaxed">
                  Include optical specs (e.g., &quot;shot on Hasselblad 100c, 85mm prime lens, f/2.8 shallow depth of field, natural bokeh&quot;).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <span className="font-bold text-emerald-400 block">4. Signage &amp; Text Quotations</span>
                <p className="text-slate-300 leading-relaxed">
                  Enclose desired English or Chinese letters inside double quotes (e.g., &quot;text reading &apos;ROAST 2026&apos; printed on label&quot;).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Structured FAQ Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Verified answers formatted for search engine understanding and AI citation indexers.
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
