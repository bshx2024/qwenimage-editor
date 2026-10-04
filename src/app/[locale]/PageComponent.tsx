'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useCommonContext } from "~/context/common-context";
import { useEffect, useRef, useState } from "react";
import { useInterval } from "ahooks";
import PricingModal from "~/components/PricingModal";
import Link from "next/link";
import { Switch } from "@headlessui/react";
import { getLinkHref } from "~/configs/buildLink";
import {
  SparklesIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

export default function PageComponent({
  locale = 'en',
  indexText,
  questionText,
  resultInfoListInit = [],
  searchParams,
}: any) {
  const {
    setShowLoadingModal,
    setShowLoginModal,
    setShowPricingModal,
    setShowGeneratingModal,
    commonText,
    userData,
  } = useCommonContext();

  const [textStr, setTextStr] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>('/images/qwen_editor_demo.jpg');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('edit');
  const [comparisonMode, setComparisonMode] = useState<'split' | 'result'>('split');
  const [currentResultImage, setCurrentResultImage] = useState<string | null>('/images/qwen_editor_demo.jpg');
  const [uid, setUid] = useState('');
  const [intervalResultInfo, setIntervalResultInfo] = useState<number | undefined>(undefined);
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowLoadingModal(false);
    if (searchParams?.prompt) {
      setTextStr(searchParams.prompt);
    }
  }, [searchParams]);

  // Handle local file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setSourceImage(data.url);
        setActiveTab('edit');
      }
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (url: string) => {
    setSourceImage(url);
    setActiveTab('edit');
  };

  // Submit generate / edit task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textStr && activeTab === 'generate') return;
    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0' && !userData) {
      setShowLoginModal(true);
      return;
    }

    setIsProcessing(true);
    setShowGeneratingModal(true);

    try {
      const payload: any = {
        textStr,
        user_id: userData?.user_id || 'guest',
        is_public: isPublic,
      };

      if (activeTab === 'edit' && sourceImage) {
        payload.imageUrl = sourceImage;
        payload.taskType = 'image_edit';
      } else {
        payload.taskType = 'text2image';
      }

      const res = await fetch('/api/generate/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status === 601) {
        setShowLoginModal(true);
        setIsProcessing(false);
        setShowGeneratingModal(false);
        return;
      }
      if (result.status === 602) {
        setShowPricingModal(true);
        setIsProcessing(false);
        setShowGeneratingModal(false);
        return;
      }

      if (result.uid) {
        setUid(result.uid);
        setIntervalResultInfo(3000);
      }
    } catch (err) {
      console.error('Generate failed:', err);
      setIsProcessing(false);
      setShowGeneratingModal(false);
    }
  };

  // Poll for prediction result
  const pollResult = async () => {
    if (!uid) return;
    try {
      const response = await fetch(`/api/works/getResultInfo?uid=${uid}&userId=${userData?.user_id || ''}`);
      const info = await response.json();
      if (info.status === 1) {
        setShowGeneratingModal(false);
        setIsProcessing(false);
        setIntervalResultInfo(undefined);
        if (info.output_url && info.output_url.length > 0) {
          const out = Array.isArray(info.output_url) ? info.output_url[0] : info.output_url;
          setCurrentResultImage(out);
        }
      }
    } catch (e) {
      // Continue polling
    }
  };

  useInterval(() => {
    pollResult();
  }, intervalResultInfo);

  // Quick preset tags
  const promptPresets = [
    'Change background to cyberpunk neon city',
    'Add golden hour sunset lighting and warmth',
    'Remove background and isolate main subject',
    'Change jacket to black leather jacket',
    'Transform into studio product photography',
    'Add realistic glasses and smile',
  ];

  // FAQ Items - Comprehensive coverage for search intent and long-tail queries
  const faqList = [
    {
      q: 'What is Qwen Image Edit and how does Qwen Image Editor work?',
      a: 'Qwen Image Editor is a free online AI image editing platform built on the state-of-the-art Qwen vision-language foundation models (Qwen-Image-Edit series). Unlike traditional image generators that regenerate pictures from scratch, Qwen Image Editor accepts both your original input photo and natural language editing prompts. The model identifies semantic regions, executes localized modifications (inpainting, background swaps, object replacement), and preserves the original composition, textures, and subject identity.',
    },
    {
      q: 'Which model checkpoints are supported (Qwen Image Edit 2511 vs 2512 vs 2509)?',
      a: 'Our cloud platform runs the latest production-grade checkpoints from Alibaba Cloud and HuggingFace, including Qwen-Image-Edit 2511 and 2512. Checkpoint 2511 offers superior instruction adherence and high-precision inpainting, while 2512 introduces improved multi-angle camera control and refined prompt semantic parsing. Checkpoint 2509 is also utilized for high-throughput, latency-optimized workflows.',
    },
    {
      q: 'Can I use this online editor for free without ComfyUI or a high-end GPU?',
      a: 'Yes, completely free! Running Qwen-Image-Edit locally via ComfyUI, GGUF weights, or Diffusers requires at least 16GB–24GB of dedicated VRAM (e.g., NVIDIA RTX 3090 or 4090) and complex node setups. Our cloud platform handles all heavyweight neural inference on high-speed clusters, allowing you to edit photos directly in Chrome, Safari, or on mobile devices with zero installation.',
    },
    {
      q: 'How does Qwen Image Edit solve the face distortion issue ("cant get the faces correct")?',
      a: 'A common complaint with legacy AI inpainting models is facial identity drifting or unnatural distortions during photo modification. Qwen Image Edit solves this by coupling deep visual tokens with high-resolution cross-attention mechanisms. It locks the subject facial geometry, gaze direction, and key landmarks while altering only the requested elements (such as hairstyles, glasses, clothing, or lighting).',
    },
    {
      q: 'Is Qwen Image Edit censored, and what are the content policies?',
      a: 'Qwen Image Edit incorporates safety filters designed to block harmful, hateful, and illegal material while providing maximum creative freedom for portrait editing, design mockups, art direction, and digital marketing. Safe artistic expressions, photorealistic portraits, and creative styling are fully supported.',
    },
    {
      q: 'How does Qwen Image Edit compare to Midjourney, Flux, and SDXL?',
      a: 'While Midjourney and Flux are exceptional text-to-image generators, modifying existing photos often requires clumsy external controlnets or creates unintended alterations across the whole canvas. Our browser editor is purpose-engineered for conversational image manipulation: you can pinpoint exact adjustments with simple prompts without degrading unchanged areas.',
    },
    {
      q: 'Can Qwen Image render clean English and bilingual text inside images?',
      a: 'Yes! Accurate text rendering is a hallmark strength of the Qwen visual model. You can instruct the editor to render legible street signage, book titles, coffee cup branding, or neon lettering in both English and Chinese without illegible glyphs or spelling mistakes.',
    },
    {
      q: 'Does this editor support LoRA styles and custom prompts?',
      a: 'Yes. You can combine descriptive natural language prompts with popular style descriptors, camera angles, color palettes, and LoRA-inspired aesthetic modifiers. The editor interprets subtle prompt qualifiers like "photorealistic 8k studio lighting", "cyberpunk neon glow", or "vintage analog film grain" with remarkable fidelity.',
    },
    {
      q: 'Do I own the commercial rights to images generated and edited here?',
      a: 'Yes. All visual assets, modified photos, and generated illustrations produced through your account are yours to use for commercial campaigns, social media, ecommerce listings, merchandise, and client projects.',
    },
    {
      q: 'What resolutions and export formats are supported for download?',
      a: 'Users can preview in real-time and export full-resolution images in lossless PNG or optimized WebP format up to 4K Ultra-HD resolution with sharp edge fidelity and zero color compression.',
    },
  ];

  // Structured Data Schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Qwen Image Editor',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
        description:
          'Free online AI image editor for text-guided photo modification, inpainting, character consistency, and high-fidelity generation.',
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
      <HeadInfo
        locale={locale}
        page=""
        title={indexText?.title || "Qwen Image Editor — Free Online AI Photo & Image Edit"}
        description={indexText?.description || "Use Qwen Image Editor online for free. Powered by Qwen-Image-Edit 2511 & 2512 models for AI inpainting, character consistency, and photo edits without ComfyUI."}
        image="/images/og-image.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="" />
      <PricingModal locale={locale} page="" />

      <main className="flex-1 w-full">
        {/* Hero & Interactive Editor Section */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Titles */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md">
                <SparklesIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Next-Gen Vision Foundation AI</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {indexText?.h1Text || "Free Online Qwen Image Editor & AI Photo Edit"}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                {indexText?.descriptionBelowH1Text || "Transform, inpaint, and edit photos directly in your browser with Qwen Image Edit 2511 & 2512. No ComfyUI, no local setup, and zero GPU requirements."}
              </p>
            </div>

            {/* Main Interactive Editor Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4 sm:p-7 shadow-2xl shadow-indigo-950/40">
              {/* Tab Switcher: Image Edit vs Text to Image */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'edit'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PhotoIcon className="w-4 h-4" />
                    Edit Photo (Img2Img)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('generate')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'generate'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Text to Image
                  </button>
                </div>

                {/* Preset sample loader */}
                {activeTab === 'edit' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="hidden sm:inline">Try sample:</span>
                    <button
                      type="button"
                      onClick={() => handleSampleSelect('/images/qwen_editor_demo.jpg')}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Cafe Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSampleSelect('/images/model_compare_demo.jpg')}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Poster Text
                    </button>
                  </div>
                )}
              </div>

              {/* Editor Grid: Left Controls, Right Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Upload & Prompt Controls */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Upload Box (Only for Edit tab) */}
                  {activeTab === 'edit' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        1. Source Image to Edit
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/60 group"
                      >
                        {sourceImage ? (
                          <div className="relative group/preview inline-block">
                            <img
                              src={sourceImage}
                              alt="Source photo to edit with Qwen Image Editor"
                              width={500}
                              height={224}
                              loading="lazy"
                              className="max-h-56 mx-auto rounded-xl object-contain shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 rounded-xl flex items-center justify-center text-xs font-medium text-white transition-opacity">
                              Click or Drop new image to replace
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 space-y-2">
                            <ArrowUpTrayIcon className="w-8 h-8 text-indigo-400 mx-auto group-hover:-translate-y-1 transition-transform" />
                            <p className="text-sm font-semibold text-slate-200">
                              {isUploading ? 'Uploading to cloud...' : 'Click or drag & drop image here'}
                            </p>
                            <p className="text-xs text-slate-500">Supports PNG, JPG, WebP up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prompt Text Input */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="promptInput" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        {activeTab === 'edit' ? '2. Edit Instruction' : '1. Image Generation Prompt'}
                      </label>
                      <div className="relative rounded-2xl border border-slate-700 bg-slate-950 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-3">
                        <textarea
                          id="promptInput"
                          rows={3}
                          value={textStr}
                          onChange={(e) => setTextStr(e.target.value)}
                          placeholder={
                            activeTab === 'edit'
                              ? "Describe what to edit, add, or replace (e.g., 'Change background to neon Tokyo, add cyberpunk iridescent jacket')..."
                              : "Describe the image to generate in detail..."
                          }
                          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                        />
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">Model: Qwen Image 2.1</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTextStr('')}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Prompts */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Quick Ideas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {promptPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTextStr(preset)}
                            className="rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/50 hover:text-white transition-colors"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generation Settings */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isPublic}
                          onChange={setIsPublic}
                          className={`${
                            isPublic ? 'bg-indigo-600' : 'bg-slate-800'
                          } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                        >
                          <span
                            aria-hidden="true"
                            className={`${
                              isPublic ? 'translate-x-4' : 'translate-x-0'
                            } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                          />
                        </Switch>
                        <span className="text-xs text-slate-400">Share to Community Gallery</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing || (!textStr && activeTab === 'generate')}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4" />
                            <span>{activeTab === 'edit' ? 'Apply Edit' : 'Generate'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Live Result & Comparison Preview */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Live Output & Preview
                    </label>
                    {activeTab === 'edit' && sourceImage && currentResultImage && (
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setComparisonMode('split')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            comparisonMode === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400'
                          }`}
                        >
                          Side-by-Side
                        </button>
                        <button
                          type="button"
                          onClick={() => setComparisonMode('result')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            comparisonMode === 'result' ? 'bg-slate-800 text-white' : 'text-slate-400'
                          }`}
                        >
                          Result Only
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview Canvas */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden group">
                    {currentResultImage ? (
                      <div className="w-full flex flex-col items-center">
                        {comparisonMode === 'split' && activeTab === 'edit' ? (
                          <div className="w-full">
                            <img
                              src={currentResultImage}
                              alt="Qwen Image Editor Output Result"
                              width={768}
                              height={440}
                              loading="lazy"
                              className="w-full max-h-[440px] rounded-xl object-contain shadow-2xl"
                            />
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
                              <span>Left: Original photo</span>
                              <span className="text-indigo-400 font-medium">Right: Qwen AI Edited result</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <img
                              src={currentResultImage}
                              alt="Generated Visual Output from Qwen Image Edit"
                              width={768}
                              height={440}
                              loading="lazy"
                              className="w-full max-h-[440px] rounded-xl object-contain shadow-2xl"
                            />
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="mt-5 w-full flex items-center justify-between pt-3 border-t border-slate-800/80">
                          <div className="text-xs text-slate-400">
                            Status: <span className="text-emerald-400 font-medium">Ready</span>
                          </div>
                          <a
                            href={currentResultImage}
                            download="qwen-image-editor-result.png"
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
                      <div className="text-center py-12 space-y-3">
                        <PhotoIcon className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-sm text-slate-400">Your edited creation will appear here</p>
                        <p className="text-xs text-slate-600">Upload a photo and hit &quot;Apply Edit&quot; to begin</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tools & Page Matrix Entrypoints (SEO Internal Links) */}
        <section className="py-12 border-t border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">Explore Qwen Image Tools</h2>
              <p className="text-sm text-slate-400 mt-2">
                Discover specialized generators, guides, and comprehensive model benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href={getLinkHref(locale, 'generator')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Qwen Image Generator
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Generate photorealistic visuals, digital illustrations, and scenes from scratch with AI.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-400">
                  Try Generator →
                </span>
              </Link>

              <Link
                href={getLinkHref(locale, 'prompt')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BoltIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Prompt Guide & Library
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Browse over 30 proven prompt formulas, typography recipes, and character consistency tips.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-purple-400">
                  Read Formulas →
                </span>
              </Link>

              <Link
                href={getLinkHref(locale, 'vs-midjourney')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors">
                  vs Midjourney Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Detailed benchmark comparing prompt understanding, typography spelling, and inpainting.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-pink-400">
                  Compare Models →
                </span>
              </Link>

              <Link
                href={getLinkHref(locale, 'vs-flux')}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CpuChipIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  vs Flux Benchmark
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  In-depth analysis of image detail, VRAM requirements, and instruction adherence.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-cyan-400">
                  Read Analysis →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* How to Use Section (3 Steps) */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">How to Use the Online AI Editor</h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3">
                Edit and transform any visual in 3 intuitive steps without complex Photoshop layers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative">
                <div className="text-3xl font-black text-indigo-500/30 mb-2">01</div>
                <h3 className="text-lg font-bold text-white mb-2">Upload or Select Image</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Drag and drop your photo, artwork, or product shot into the editor. You can also pick from ready-made presets to experiment instantly.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative">
                <div className="text-3xl font-black text-purple-500/30 mb-2">02</div>
                <h3 className="text-lg font-bold text-white mb-2">Enter Natural Language Edit Prompt</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Describe what you want to change in simple English or Chinese: replace backgrounds, alter apparel, tweak lighting, or inpaint specific elements.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative">
                <div className="text-3xl font-black text-pink-500/30 mb-2">03</div>
                <h3 className="text-lg font-bold text-white mb-2">Preview, Compare & Download HD</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Inspect the Before-and-After results with the side-by-side viewer. Refine prompts with 1-click iterations and download high-resolution PNGs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 border-t border-slate-900 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Key Features of Qwen Image Editor</h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3">
                Why creators, visual artists, and marketers choose this platform for next-generation visual manipulation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <AdjustmentsHorizontalIcon className="w-8 h-8 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Instruction Inpainting</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Describe localized modifications with plain text prompts. The model automatically segments edit masks and harmonizes lighting, shadows, and edge grain.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
                <h3 className="text-base font-bold text-white">Crisp Text & Typography</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Render photorealistic English and Chinese typography on street banners, apparel, packaging, and digital advertisements without garbled characters.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <ShieldCheckIcon className="w-8 h-8 text-pink-400" />
                <h3 className="text-base font-bold text-white">Character & Face Consistency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Locks facial geometry, gaze vectors, and core character identity across sequential background changes, wardrobe replacements, and style shifts.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3">
                <BoltIcon className="w-8 h-8 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Cloud GPU Acceleration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Powered by high-throughput enterprise GPU clusters with FlashAttention, delivering fast rendering turnaround without consuming local computer memory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Checkpoints & Architecture Section (2511 vs 2512 vs 2509) */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Model Evolution & Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Supported Qwen-Image-Edit Checkpoints
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                The Qwen-Image foundation family bridges visual multimodal understanding and generative diffusion. Our online editor integrates the official open-source weights optimized for high-fidelity execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Checkpoint 2511
                    </span>
                    <span className="text-[11px] text-slate-400">High Adherence SOTA</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Qwen-Image-Edit 2511</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The acclaimed flagship revision for instruction-guided inpainting. Checkpoint 2511 excels at fine-grained edits, complex subject preservation, and photo-level material realism with minimal hallucination.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Best for multi-object replacement & background swaps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Sub-pixel edge blending and natural shadow cast</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Exceptional portrait feature retention</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Checkpoint 2512
                    </span>
                    <span className="text-[11px] text-slate-400">Semantic & Spatial Control</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Qwen-Image-Edit 2512</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Engineered for nuanced prompt comprehension, spatial camera transformations, and multi-turn modifications. Checkpoint 2512 accurately interprets conversational constraints and stylistic nuances.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Camera perspective & angle adjustment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Advanced aesthetic color grading & mood shifts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Enhanced bilingual typography & packaging design</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-900/60 p-7 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Checkpoint 2509
                    </span>
                    <span className="text-[11px] text-slate-400">Fast Inpainting</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Qwen-Image-Edit 2509</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The baseline architecture renowned for lightweight inference and rapid previewing. Provides dependable object removal, background clearing, and quick conceptual prototyping.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Fast turnaround for rapid iterations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Efficient object erasure & clean inpainting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Stable baseline for standard resolution outputs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Online Web Editor vs ComfyUI Workflow Comparison */}
        <section className="py-16 lg:py-24 border-t border-slate-900 bg-slate-950/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                Workflow Comparison
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Online Web Studio vs Local ComfyUI Workflow
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Many creators search for Qwen Image Edit ComfyUI workflows, GGUF quants, or HuggingFace nodes. Here is why using our cloud workspace saves hours of troubleshooting and expensive hardware costs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Local ComfyUI Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm">
                    DIY
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">Local ComfyUI / GGUF Workflow</h3>
                    <p className="text-xs text-slate-500">Self-hosted local installation</p>
                  </div>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Massive Hardware Requirement:</strong> Needs high-end GPUs with 16GB–24GB VRAM (e.g. RTX 4090) to prevent CUDA Out Of Memory (OOM) crashes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Complex Setup:</strong> Requires Python virtual environments, PyTorch matching, custom nodes, git submodules, and constant dependency updates.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>No Mobile Access:</strong> Tied strictly to your local desktop machine; impossible to use on iPads, phones, or thin laptops.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span><strong>Large Download Footprint:</strong> 20GB+ checkpoint files consume huge storage and bandwidth.</span>
                  </li>
                </ul>
              </div>

              {/* Online Web Editor Card */}
              <div className="rounded-2xl border border-indigo-500/50 bg-gradient-to-b from-indigo-950/20 to-slate-900/70 p-8 shadow-xl shadow-indigo-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                    WEB
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Online Cloud Studio</h3>
                    <p className="text-xs text-indigo-300">Instant in-browser experience</p>
                  </div>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Zero Hardware Barrier:</strong> Runs seamlessly on any computer, Chromebook, iPad, or smartphone without local GPU consumption.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Instant Start with 0 Setup:</strong> No drivers, no nodes, no terminal scripts. Upload photo, type prompt, and get results in seconds.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Always Latest Checkpoints:</strong> Automatically updated with Qwen-Image-Edit 2511, 2512, and continuous fine-tuning improvements.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Integrated Comparison & Storage:</strong> Built-in Side-by-Side before/after comparison tool, community showcase, and HD cloud history.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Solving Common Pain Points Section (Face Consistency & Inpainting) */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Creative Solutions & Recipes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
                Mastering AI Photo Editing & Character Consistency
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
                Overcoming common challenges in text-driven image modification with proven prompt structures and intelligent inpainting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
                  Fixing Face Drift & Inconsistency
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A frequent issue with image generators is facial distortion during edits (&quot;can&apos;t get faces correct&quot;). In our web workspace, avoid broad re-generation prompts. Instead, specify targeted alterations like:
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-indigo-300">
                  &quot;Keep face identity, facial features and gaze untouched; replace jacket with dark bomber jacket.&quot;
                </div>
                <p className="text-xs text-slate-500">
                  The model cross-references original face landmarks and preserves personal identity.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
                  Atmospheric Relighting & Shadows
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When changing daylight photos into sunset or neon cyberpunk scenes, legacy editors leave harsh edge artifacts. Qwen-Image-Edit calculates global illumination and accurately projects colored ambient bounce:
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-purple-300">
                  &quot;Change background to night neon Tokyo, cast subtle purple and blue rim light onto the subject&apos;s shoulders.&quot;
                </div>
                <p className="text-xs text-slate-500">
                  Seamlessly integrates subject and background into a unified photographic composition.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span>
                  Flawless Graphic Text & Signage
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Need to replace text on packaging, posters, or t-shirts? Use explicit quotation marks to instruct the Qwen vision decoder to render exact typography:
                </p>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-[11px] font-mono text-pink-300">
                  &quot;Inpaint the coffee cup label to read &apos;QWEN BREW&apos; in clean minimalist serif font.&quot;
                </div>
                <p className="text-xs text-slate-500">
                  Generates sharp lettering without typical diffusion blur, gibberish, or missing vowels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 border-t border-slate-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm text-slate-400 mt-2">
                Everything you need to know about the AI photo editing suite.
              </p>
            </div>

            <div className="space-y-4">
              {faqList.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
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

      <Footer locale={locale} page="" />
    </div>
  );
}
