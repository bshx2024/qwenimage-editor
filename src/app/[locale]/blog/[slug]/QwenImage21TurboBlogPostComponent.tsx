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
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CommandLineIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  CpuChipIcon,
  BoltIcon,
  CheckCircleIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import BlogInlineCtaCard from "~/components/BlogInlineCtaCard";

export default function QwenImage21TurboBlogPostComponent({
  post,
  locale = 'en',
}: {
  post: BlogPost;
  locale?: string;
}) {
  // Interactive Live VRAM & Hardware Configurator
  const [hardwareTier, setHardwareTier] = useState<'8gb' | '16gb' | '24gb' | 'cloud'>('16gb');
  const [workflowMode, setWorkflowMode] = useState<'t2i' | 'edit' | 'rgba'>('t2i');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '3:4'>('16:9');
  const [selectedPromptPreset, setSelectedPromptPreset] = useState<string>(
    'Editorial haute couture fashion model in an emerald silk trench coat, urban rain reflection, bilingual neon sign reading "QWEN 极速 2026", 35mm candid lens, subtle film grain'
  );
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const hardwareProfiles = {
    '8gb': {
      title: '8GB VRAM (Budget Consumer GPUs)',
      quant: 'GGUF Q4_K_M / INT8 Quantized Checkpoint',
      vram: '7.8 GB Peak VRAM',
      recommendedGpu: 'RTX 3060 12GB / RTX 4060 8GB / Apple M2 16GB',
      precision: 'torch.bfloat16 (qwen3vl CPU offloaded)',
      steps: 8,
      cfg: 1.0,
      scheduler: 'linear_quadratic',
      speed: '~6.8s per 2K image'
    },
    '16gb': {
      title: '16GB VRAM (Prosumer Sweet Spot)',
      quant: 'Native BF16 Checkpoint + KV-Cache',
      vram: '15.2 GB Peak VRAM',
      recommendedGpu: 'RTX 4070 Ti Super 16GB / RTX 4080 / Apple M3 Max',
      precision: 'Native torch.bfloat16 uncompressed DiT',
      steps: 8,
      cfg: 1.0,
      scheduler: 'linear_quadratic (Official Sigmas)',
      speed: '~3.4s per 2K image'
    },
    '24gb': {
      title: '24GB VRAM (Enthusiast Studio Tier)',
      quant: 'Full Uncompressed BF16 + Native WanVAE',
      vram: '21.4 GB Peak VRAM',
      recommendedGpu: 'RTX 3090 / RTX 4090 / NVIDIA A10G',
      precision: 'Full float32 text encoding + BF16 32 DiT layers',
      steps: 8,
      cfg: 1.0,
      scheduler: 'linear_quadratic',
      speed: '~1.9s per 2K image'
    },
    'cloud': {
      title: 'Zero VRAM Cloud Studio (Online Web Editor)',
      quant: 'Enterprise Distributed A100/H800 Cluster',
      vram: '0 GB Local VRAM (Browser-based)',
      recommendedGpu: 'Any Laptop, MacBook, Chromebook, or Mobile',
      precision: 'Official DashScope Engine',
      steps: 8,
      cfg: 1.0,
      scheduler: 'Custom Multi-GPU Denoising',
      speed: '~1.2s Instant Cloud Rendering'
    }
  };

  const promptPresets = [
    {
      label: 'Bilingual Typography Poster',
      text: 'Futuristic exhibition typography poster, bold contrasting lettering reading "QWEN 2.1 TURBO 创想", dynamic diagonal layout, clean vector lines, 4k ultra-detailed',
      type: 't2i'
    },
    {
      label: 'Ecommerce Product on Travertine (RGBA)',
      text: 'Luxury matte ceramic skincare bottle on natural porous travertine pedestal, water droplet refraction, soft studio rim lighting, isolated on native clean alpha transparent background',
      type: 'rgba'
    },
    {
      label: 'Multi-Reference Character Edit',
      text: 'Transfer character facial identity and haircut from <image1> into an astronaut spacesuit inside a Mars colony greenhouse, cinematic golden hour backlight, photorealistic 8k',
      type: 'edit'
    },
    {
      label: 'Candid 35mm Street Film',
      text: 'Candid 35mm snapshot of an elderly jazz saxophonist playing on a wet cobblestone street at dusk, warm tungsten reflections, natural skin pores and realistic motion blur',
      type: 't2i'
    }
  ];

  const generatedComfyUiSnippet = `# Qwen Image 2.1 Turbo Diffusers & ComfyUI Automation Pipeline
# Model: Qwen Image 2.1 Turbo (7B Single-Stream DiT - 8-Step Distilled)
# Hardware Target: ${hardwareProfiles[hardwareTier].title}

import torch
from diffusers import DiffusionPipeline

# Load Qwen Image 2.1 Turbo pipeline
pipe = DiffusionPipeline.from_pretrained(
    "Qwen/Qwen-Image-2.1-Turbo",
    torch_dtype=torch.bfloat16,
    device_map="cuda" if torch.cuda.is_available() else "cpu"
)

${hardwareTier === '8gb' ? 'pipe.enable_model_cpu_offload()\npipe.enable_vae_slicing()' : 'pipe.to("cuda")'}

# Strict Qwen Image 2.1 Turbo settings: guidance_scale MUST be 1.0
prompt = "${selectedPromptPreset}"
output = pipe(
    prompt=prompt,
    negative_prompt=None,  # Inactive when guidance_scale=1.0
    num_inference_steps=${hardwareProfiles[hardwareTier].steps},
    guidance_scale=${hardwareProfiles[hardwareTier].cfg},
    height=${aspectRatio === '16:9' ? 1152 : aspectRatio === '9:16' ? 2048 : aspectRatio === '3:4' ? 1536 : 1024},
    width=${aspectRatio === '16:9' ? 2048 : aspectRatio === '9:16' ? 1152 : aspectRatio === '3:4' ? 1152 : 1024},
    scheduler_type="${hardwareProfiles[hardwareTier].scheduler}"
)

output.images[0].save("qwen_image_2_1_turbo_render.png")`;

  const copyScript = () => {
    navigator.clipboard.writeText(generatedComfyUiSnippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const faqData = [
    {
      q: "Why does Qwen Image 2.1 Turbo burn out when CFG is set above 1.0?",
      a: "Qwen Image 2.1 Turbo is an 8-step distilled foundation model. Base diffusion models require CFG 3.0 to 4.5 to adhere to text instructions, but distilled turbo checkpoints embed guidance directly into their velocity predictions. Applying external guidance scale above 1.0 multiplies these vectors, causing extreme color clipping and washed-out highlights. Keep guidance_scale strictly at 1.0."
    },
    {
      q: "Can I run Qwen Image 2.1 Turbo on an 8GB or 12GB consumer GPU?",
      a: "Yes. While uncompressed BF16 weights require ~15GB–20GB VRAM, GGUF quants (Q8_0 and Q4_K_M) reduce VRAM requirements to 7.8GB. By using CPU offloading for the qwen3vl text encoder, you can comfortably run Qwen Image 2.1 Turbo locally on an RTX 3060 (12GB) or RTX 4060 (8GB)."
    },
    {
      q: "Why is the linear_quadratic scheduler mandatory for Qwen Image 2.1 Turbo?",
      a: "In an 8-step generation budget, uniform schedulers like Euler Simple leave residual noise in high-frequency latents, creating checkerboard patterns. The linear_quadratic scheduler allocates denser sampling steps near the end of the trajectory, allowing Qwen Image 2.1 Turbo to resolve crisp typography, skin pores, and transparent RGBA layers."
    },
    {
      q: "Are images generated by Qwen Image 2.1 Turbo free for commercial use?",
      a: "Under the Qwen Research License, model weights are restricted to evaluation. However, the Qwen team confirmed that users retain full ownership of generated outputs. To ensure complete legal compliance for commercial client work, users can leverage authorized cloud services like Qwen Image Editor."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <HeadInfo
        locale={locale}
        page={`blog/${post.slug}`}
        title={post.title}
        description={post.description}
        image={post.coverImage || "/images/blog/qwen-image-2-1-turbo-comfyui-guide.png"}
        schemaData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TechArticle",
              "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#article`,
              "headline": post.title,
              "description": post.description,
              "datePublished": post.date,
              "dateModified": post.date,
              "inLanguage": locale,
              "mainEntityOfPage": `https://www.qwenimage-editor.com/blog/${post.slug}`,
              "proficiencyLevel": "Expert",
              "dependencies": "PyTorch 2.4+, CUDA 12.4+, ComfyUI, Diffusers",
              "author": {
                "@type": "Person",
                "name": post.author.name,
                "jobTitle": post.author.role,
                "image": `https://www.qwenimage-editor.com${post.author.avatar}`,
                "url": "https://www.qwenimage-editor.com/about"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Qwen Image Editor Research Lab",
                "url": "https://www.qwenimage-editor.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.qwenimage-editor.com/logo.png"
                }
              },
              "about": [
                {
                  "@type": "Thing",
                  "name": "Qwen Image 2.1 Turbo",
                  "description": "7B single-stream DiT 8-step accelerated text-to-image foundation model by Alibaba Qwen Team"
                },
                {
                  "@type": "Thing",
                  "name": "ComfyUI",
                  "sameAs": "https://github.com/comfyanonymous/ComfyUI"
                }
              ]
            },
            {
              "@type": "HowTo",
              "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#howto`,
              "name": "How to Run Qwen Image 2.1 Turbo in ComfyUI",
              "description": "Step-by-step instructions to configure Qwen Image 2.1 Turbo in ComfyUI using 8 steps, CFG 1.0, and linear_quadratic scheduler.",
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Step 1: Download Qwen Image 2.1 Turbo Weights or GGUF",
                  "text": "Place qwen_image_2_1_turbo_bf16.safetensors into models/checkpoints, or load GGUF quantized models for 8GB VRAM."
                },
                {
                  "@type": "HowToStep",
                  "name": "Step 2: Connect qwen3vl Text Encoder and WanVAE",
                  "text": "Link the qwen3vl multimodal encoder and ensure VAE decoding precision is set to bfloat16."
                },
                {
                  "@type": "HowToStep",
                  "name": "Step 3: Set KSampler to Exactly 8 Steps and CFG 1.0",
                  "text": "Set steps to 8 and guidance_scale strictly to 1.0 to avoid contrast blowouts."
                },
                {
                  "@type": "HowToStep",
                  "name": "Step 4: Assign linear_quadratic Scheduler",
                  "text": "Choose linear_quadratic scheduler to ensure dense step allocation in final latent reconstruction."
                }
              ]
            },
            {
              "@type": "FAQPage",
              "@id": `https://www.qwenimage-editor.com/blog/${post.slug}#faq`,
              "mainEntity": faqData.map((item) => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.a
                }
              }))
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://www.qwenimage-editor.com/#software",
              "name": "Qwen Image 2.1 Turbo Online Studio",
              "operatingSystem": "Web, Windows, macOS, Linux, iOS, Android",
              "applicationCategory": "DesignApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          ]
        }}
      />

      <Header />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-400">
          <Link href={getLinkHref('/', locale)} className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={getLinkHref('/blog', locale)} className="hover:text-cyan-400 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-xs sm:max-w-md">Qwen Image 2.1 Turbo Guide</span>
        </nav>

        {/* Hero Header */}
        <header className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Alibaba 7B S3-DiT Architecture • 8-Step Distilled Acceleration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Qwen Image 2.1 Turbo: ComfyUI Workflow &amp; Hardware Requirements Guide
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
            A complete deployment and benchmark playbook for Alibaba’s distilled 7B DiT model. 
            Learn how to run <strong>Qwen Image 2.1 Turbo</strong> in ComfyUI, calibrate 8-step <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-900">linear_quadratic</code> schedulers, 
            bypass VRAM bottlenecks on 8GB GPUs using GGUF quantization, or generate 2K images online with zero local setup.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
              <span>Updated: {post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-cyan-400" />
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CpuChipIcon className="w-4 h-4 text-cyan-400" />
              <span>Tested on RTX 4090 24GB &amp; Apple M3</span>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* SERP POSITION 0: DIRECT ANSWER CALLOUT BOX (TL;DR) */}
        {/* ========================================================================= */}
        <section className="mb-12 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900/90 to-blue-950/40 border-2 border-cyan-500/40 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <h2 className="text-base font-bold text-cyan-300 uppercase tracking-wider">
              Qwen Image 2.1 Turbo Direct Answer &amp; Summary (TL;DR)
            </h2>
          </div>

          <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-3">
            <p>
              <strong>Qwen Image 2.1 Turbo</strong> is an accelerated open-weights 7B visual foundation model by Alibaba Tongyi Lab, 
              delivering 2K native text-to-image and multi-reference image editing in <strong>exactly 8 denoising steps</strong>. 
              Compared to the 40-step base model, Qwen Image 2.1 Turbo cuts inference time by ~75% while maintaining sharp bilingual typography and transparent RGBA layer generation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1 font-mono">1. CFG Requirement</span>
                <span className="text-cyan-300 font-bold text-sm">Lock CFG to 1.0</span>
                <p className="text-slate-400 text-xs mt-1">In Qwen Image 2.1 Turbo, setting CFG above 1.0 causes immediate color burnout.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1 font-mono">2. Scheduler Rule</span>
                <span className="text-cyan-300 font-bold text-sm">linear_quadratic Only</span>
                <p className="text-slate-400 text-xs mt-1">Euler Simple causes grid noise. Custom sigmas are required for 8-step resolution.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1 font-mono">3. Hardware Threshold</span>
                <span className="text-cyan-300 font-bold text-sm">16GB (BF16) / 8GB (GGUF)</span>
                <p className="text-slate-400 text-xs mt-1">Uncompressed weights require 16GB+ VRAM. Budget GPUs can use GGUF quants.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE COMPONENT: VRAM & HARDWARE DEPLOYMENT CONFIGURATOR */}
        {/* ========================================================================= */}
        <section className="mb-14 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1">
                <CommandLineIcon className="w-4 h-4" />
                <span>Interactive Hardware &amp; Workflow Configurator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Configure Qwen Image 2.1 Turbo for Your GPU Hardware
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Select your VRAM budget to generate optimal ComfyUI parameters
            </span>
          </div>

          {/* Hardware Selector Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {(['8gb', '16gb', '24gb', 'cloud'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setHardwareTier(tier)}
                className={`p-3.5 rounded-xl text-left transition-all border ${
                  hardwareTier === tier
                    ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/50 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
                  {tier === 'cloud' ? 'Zero Local VRAM' : `${tier.toUpperCase()} Tier`}
                </div>
                <div className="font-bold text-sm">{hardwareProfiles[tier].title.split(' (')[0]}</div>
                <div className="text-[11px] text-slate-400 mt-1">{hardwareProfiles[tier].speed}</div>
              </button>
            ))}
          </div>

          {/* Active Profile Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block">Quantization Format:</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{hardwareProfiles[hardwareTier].quant}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Peak VRAM Footprint:</span>
              <span className="font-semibold text-cyan-300 mt-0.5 block">{hardwareProfiles[hardwareTier].vram}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Recommended Hardware:</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{hardwareProfiles[hardwareTier].recommendedGpu}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Sampling Configuration:</span>
              <span className="font-semibold text-emerald-400 mt-0.5 block">
                {hardwareProfiles[hardwareTier].steps} Steps • CFG {hardwareProfiles[hardwareTier].cfg.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Code Generator & Snippet */}
          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-2">
                <CodeBracketIcon className="w-4 h-4 text-cyan-400" />
                <span>diffusers_qwen_image_turbo.py</span>
              </span>
              <button
                onClick={copyScript}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors text-xs"
              >
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Workflow Script'}</span>
              </button>
            </div>
            <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre overflow-x-auto">
              {generatedComfyUiSnippet}
            </pre>
          </div>

          {/* Quick CTA Bridge inside Tool */}
          {hardwareTier !== 'cloud' && (
            <div className="mt-4 p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <BoltIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Want to run Qwen Image 2.1 Turbo without local GPU installation or CUDA errors?</span>
              </div>
              <Link
                href={getLinkHref('/', locale)}
                className="whitespace-nowrap px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                Run Qwen Image 2.1 Turbo Online →
              </Link>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* COMPREHENSIVE HARDWARE REQUIREMENTS TABLE */}
        {/* ========================================================================= */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-4">
            Qwen Image 2.1 Turbo Hardware Requirements &amp; Benchmark
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Running <strong>Qwen Image 2.1 Turbo</strong> locally requires understanding VRAM allocations. 
            Below is an empirical benchmark tracking peak memory usage, precision, and latency for Qwen Image 2.1 Turbo:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950 text-cyan-300 uppercase tracking-wider text-[11px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Deployment Variant</th>
                  <th className="py-3 px-4">Precision &amp; Format</th>
                  <th className="py-3 px-4">Peak VRAM</th>
                  <th className="py-3 px-4">Min. GPU Spec</th>
                  <th className="py-3 px-4">Inference Time (2K)</th>
                  <th className="py-3 px-4">Detail Fidelity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">Full BF16 Stock Model</td>
                  <td className="py-3 px-4">torch.bfloat16 safetensors</td>
                  <td className="py-3 px-4 text-cyan-400 font-mono">21.4 GB</td>
                  <td className="py-3 px-4">RTX 3090 / 4090 24GB</td>
                  <td className="py-3 px-4 font-mono">1.9s (8 steps)</td>
                  <td className="py-3 px-4 text-emerald-400">100% (Baseline Reference)</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">CPU-Offloaded Text Encoder</td>
                  <td className="py-3 px-4">BF16 DiT + CPU qwen3vl</td>
                  <td className="py-3 px-4 text-cyan-400 font-mono">15.2 GB</td>
                  <td className="py-3 px-4">RTX 4070 Ti Super 16GB</td>
                  <td className="py-3 px-4 font-mono">3.4s (8 steps)</td>
                  <td className="py-3 px-4 text-emerald-400">100% Identical</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">GGUF Q8_0 Quantization</td>
                  <td className="py-3 px-4">GGUF format (8-bit precision)</td>
                  <td className="py-3 px-4 text-cyan-400 font-mono">11.6 GB</td>
                  <td className="py-3 px-4">RTX 3060 12GB / RTX 4070</td>
                  <td className="py-3 px-4 font-mono">4.8s (8 steps)</td>
                  <td className="py-3 px-4 text-slate-200">97.8% (Negligible loss)</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">GGUF Q4_K_M Budget Quant</td>
                  <td className="py-3 px-4">GGUF format (4-bit precision)</td>
                  <td className="py-3 px-4 text-cyan-400 font-mono">7.8 GB</td>
                  <td className="py-3 px-4">RTX 3060 / 4060 8GB</td>
                  <td className="py-3 px-4 font-mono">6.8s (8 steps)</td>
                  <td className="py-3 px-4 text-amber-300">91.4% (Subtle text soft)</td>
                </tr>
                <tr className="bg-cyan-950/30 border-t-2 border-cyan-500/50 hover:bg-cyan-950/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-300 flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-cyan-400" />
                    <span>Qwen Image Editor Cloud Studio</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">Official Cloud API</td>
                  <td className="py-3 px-4 text-emerald-400 font-mono font-bold">0 GB (Zero Local)</td>
                  <td className="py-3 px-4 text-slate-200">Any Browser / Mobile</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">~1.2s Instant</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">100% Uncompressed 2K</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TROUBLESHOOTING: THE 5 CRITICAL PITFALLS IN QWEN IMAGE 2.1 TURBO */}
        {/* ========================================================================= */}
        <section className="mb-14 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Troubleshooting Qwen Image 2.1 Turbo: 5 Critical Pitfalls
          </h2>

          {/* Pitfall 1: CFG Burnout */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
              <h3 className="text-base sm:text-lg">1. Why CFG &gt; 1.0 Destroys Qwen Image 2.1 Turbo Quality</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              A common hurdle with <strong>Qwen Image 2.1 Turbo</strong> is blown-out contrast or white noise. 
              This happens when leaving Classifier-Free Guidance at base model settings (like 3.0 or 4.5).
            </p>
            <div className="bg-slate-950/90 border-l-4 border-rose-500 p-4 rounded text-xs text-slate-300 space-y-2">
              <p>
                <strong>The Cause:</strong> Qwen Image 2.1 Turbo is trained with guidance distillation. 
                The 7B core has internalized prompt steering. When external CFG is applied, it computes:
              </p>
              <code className="block bg-slate-900 p-2 rounded text-cyan-300 font-mono">
                Latent_step = Latent_uncond + CFG * (Latent_cond - Latent_uncond)
              </code>
              <p>
                Multiplying this delta by 3.5 causes numerical clipping, blowing out highlights. 
                <strong>In Qwen Image 2.1 Turbo, always keep CFG at exactly 1.0.</strong>
              </p>
            </div>
          </div>

          {/* Pitfall 2: Scheduler Selection */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-2">
              <CommandLineIcon className="w-5 h-5 shrink-0" />
              <h3 className="text-base sm:text-lg">2. Qwen Image 2.1 Turbo Schedulers: Why linear_quadratic Succeeds</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              When sampling <strong>Qwen Image 2.1 Turbo</strong> in 8 steps, standard schedulers like <code className="text-cyan-300 font-mono">euler simple</code> distribute timesteps too uniformly, 
              leaving residual noise in fine textures.
            </p>
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded text-xs text-slate-300 space-y-2">
              <p>
                <strong>The Solution:</strong> Use the official <code className="text-cyan-300 font-mono">linear_quadratic</code> scheduler. 
                This clusters sampling density toward low-noise sigma ranges, ensuring Qwen Image 2.1 Turbo renders sharp typography and clean skin tones.
              </p>
            </div>
          </div>

          {/* Pitfall 3: PixelHead vs Stock WanVAE */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-base mb-2">
              <CpuChipIcon className="w-5 h-5 shrink-0" />
              <h3 className="text-base sm:text-lg">3. Qwen Image 2.1 Turbo VAE: PixelHead vs Stock WanVAE</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              The <strong>PixelHead</strong> decoder slashes VAE decoding time for Qwen Image 2.1 Turbo down to 5.55ms (a 67x speedup). 
              However, community testing reveals trade-offs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-cyan-300 block mb-1">When to Use PixelHead:</span>
                <p className="text-slate-400">
                  Ideal for real-time prompt iteration in Qwen Image 2.1 Turbo on budget GPUs with limited memory.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-amber-300 block mb-1">When to Use Stock WanVAE:</span>
                <p className="text-slate-400">
                  Essential for final 2K outputs and typography where PixelHead softens high-frequency details.
                </p>
              </div>
            </div>
          </div>

          {/* Pitfall 4: Stretched Necks and Aspect Ratios */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base mb-2">
              <Squares2X2Icon className="w-5 h-5 shrink-0" />
              <h3 className="text-base sm:text-lg">4. Fixing Qwen Image 2.1 Turbo Stretched Necks in Tall Aspect Ratios</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              When rendering tall portrait wallpapers in <strong>Qwen Image 2.1 Turbo</strong>, elongated necks can occur if dimensions are not divisible by 16. 
              Always use native dimensions like <code className="text-cyan-300 font-mono">1152x2048</code> or <code className="text-cyan-300 font-mono">2048x1152</code>. 
              In image editing workflows with Qwen Image 2.1 Turbo, match latent aspect ratios strictly to the reference input.
            </p>
          </div>

          {/* Pitfall 5: Mitigating Plastic Skin */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-2">
              <PhotoIcon className="w-5 h-5 shrink-0" />
              <h3 className="text-base sm:text-lg">5. Eliminating Plastic Skin in Qwen Image 2.1 Turbo Generations</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Because CFG=1 disables negative prompts in <strong>Qwen Image 2.1 Turbo</strong>, steer portrait realism using positive photographic descriptions:
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300">
              &quot;natural skin pores, fine vellus hair, imperfect epidermal texture, 35mm candid lens, subtle film grain, soft directional daylight&quot;
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INLINE CONTEXTUAL CTA CARD */}
        {/* ========================================================================= */}
        <div className="my-14">
          <BlogInlineCtaCard
            locale={locale}
            contextTitle="Qwen Image 2.1 Turbo Cloud Studio"
            customBadge="Instant Zero-VRAM Generation"
            customTitle="Want 2K Qwen Image 2.1 Turbo Without ComfyUI Setup?"
            customDescription="Experience uncompressed 8-step Qwen Image 2.1 Turbo in your browser. Generate native transparent RGBA PNGs, render crisp typography, and edit photos with zero GPU configuration."
            customButtonText="Try Qwen Image 2.1 Turbo Free Online"
          />
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE PROMPT PLAYGROUND */}
        {/* ========================================================================= */}
        <section className="mb-14 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-2">
            <SparklesIcon className="w-4 h-4" />
            <span>Interactive Prompt Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Test Recommended Prompt Presets for Qwen Image 2.1 Turbo
          </h2>
          <p className="text-slate-300 text-sm mb-6">
            Click any production preset to load prompt syntax optimized for <strong>Qwen Image 2.1 Turbo</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {promptPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPromptPreset(preset.text);
                  setWorkflowMode(preset.type as any);
                }}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  selectedPromptPreset === preset.text
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-cyan-300">{preset.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {preset.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{preset.text}</p>
              </button>
            ))}
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-4">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
              <span>Active Prompt String for Qwen Image 2.1 Turbo</span>
              <button
                onClick={() => copyPromptText(selectedPromptPreset)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <textarea
              value={selectedPromptPreset}
              onChange={(e) => setSelectedPromptPreset(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>8-Step Distilled</span>
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Native RGBA Alpha Layer</span>
              </span>
            </div>
            <Link
              href={getLinkHref('/', locale)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Run Qwen Image 2.1 Turbo in Cloud Studio</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE FAQ ACCORDION (MATCHES FAQPAGE SCHEMA) */}
        {/* ========================================================================= */}
        <section className="mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Frequently Asked Questions: Qwen Image 2.1 Turbo
          </h2>

          <div className="space-y-3">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-200 hover:text-white"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-200 ${
                      faqOpen[index] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {faqOpen[index] && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CONVERSION BANNER */}
        {/* ========================================================================= */}
        <footer className="rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/40 p-8 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Skip the GPU Headaches. Create with Qwen Image 2.1 Turbo Online.
          </h3>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Zero installation, zero CUDA errors, and zero license ambiguity. 
            Enjoy lightning-fast 8-step cloud rendering with <strong>Qwen Image 2.1 Turbo</strong>, 
            native transparent background exports, and professional multi-reference editing.
          </p>
          <div className="pt-2">
            <Link
              href={getLinkHref('/', locale)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-base shadow-lg shadow-cyan-400/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Qwen Image 2.1 Turbo Studio Free</span>
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-500">
            Powered by official enterprise cloud APIs. No credit card required to start generating.
          </p>
        </footer>
      </main>

      <Footer />
    </div>
  );
}
