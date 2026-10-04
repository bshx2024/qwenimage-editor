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
  ArrowsRightLeftIcon,
  CheckIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

export default function VsFluxComponent({ locale = 'en' }: { locale?: string }) {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });

  const tableData = [
    { metric: 'Image Fidelity & Anatomy', qwen: 'Photorealistic, natural skin & lighting', flux: 'Pristine 12B DiT rendering' },
    { metric: 'Text & Typography Spelling', qwen: 'State-of-the-Art (Bilingual EN/ZH)', flux: 'Strong (English focused)' },
    { metric: 'Instruction-Based Editing', qwen: 'Native (Direct text-to-edit model)', flux: 'Requires separate Inpaint/Fill model' },
    { metric: 'Inference VRAM Footprint', qwen: 'Moderate (FP8 ~10GB VRAM)', flux: 'High (Flux Dev/Pro ~16-24GB VRAM)' },
    { metric: 'Generation Latency', qwen: 'Fast (~2.5s on cloud GPU)', flux: 'Medium (~5-12s depending on steps)' },
    { metric: 'Open Source License', qwen: 'Permissive Community Weights', flux: 'Non-commercial (Dev) / Apache (Schnell)' },
    { metric: 'Character Consistency', qwen: 'High facial identity preservation', flux: 'Good, but requires custom LoRA' },
  ];

  const faqItems = [
    {
      q: 'How does Qwen Image 2.1 compare to Flux in image quality?',
      a: 'Both Qwen Image 2.1 and Black Forest Labs Flux represent the cutting edge of open-weights visual generation. Flux features a massive 12B parameter DiT architecture with outstanding aesthetic detail, while Qwen Image 2.1 matches its realism while offering superior text-guided localized editing, faster inference times, and bilingual typography.',
    },
    {
      q: 'Which model handles text in images better?',
      a: 'While Flux.1 excels at English typography on signs, Qwen Image 2.1 provides superior precision across both English and Chinese characters, properly handling complex multi-line text arrangements, fonts, and kerning.',
    },
    {
      q: 'Can I do inpainting and localized photo editing on both?',
      a: 'Qwen Image was built with unified image-to-image editing as a core foundation (qwen/qwen-image-edit). On Flux, you must use specialized auxiliary models (Flux.1 Fill / Inpainting) which require separate pipelines and larger VRAM allocations.',
    },
    {
      q: 'What are the hardware requirements to run them locally?',
      a: 'Flux.1 Dev requires 16GB to 24GB of VRAM for unquantized inference. Qwen Image 2.1 operates efficiently on 8GB to 12GB GPUs using FP8 quantization, or can be used instantly without local hardware via Qwen Image Editor.',
    },
    {
      q: 'Which model is faster for production pipelines?',
      a: 'Qwen Image 2.1 generates images in approximately 2 to 4 seconds on enterprise GPUs, whereas Flux.1 typically requires 6 to 15 seconds for a 28-to-50 step diffusion pass, making Qwen more cost-effective for high-volume deployments.',
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Qwen Image 2.1 vs Flux — Quality, Speed & Cost',
        description:
          'In-depth comparison of Qwen Image 2.1 vs Flux. Analyze image fidelity, typography rendering, instruction-based editing, VRAM cost, and generation speed.',
        image: '/images/model_compare_demo.jpg',
        author: {
          '@type': 'Organization',
          name: 'Qwen Image Editor',
        },
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
        page="vs-flux"
        title="Qwen Image 2.1 vs Flux — Quality, Speed & Cost"
        description="In-depth comparison of Qwen Image 2.1 vs Flux. Analyze image fidelity, typography rendering, instruction-based editing, VRAM cost, and generation speed."
        image="/images/model_compare_demo.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="vs-flux" />

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-900">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/15 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <ArrowsRightLeftIcon className="w-4 h-4 text-cyan-400" />
              <span>Foundation Model Benchmark</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Image 2.1 vs Flux — Quality, Speed & Cost
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Evaluating the two premier open-weights generative titans. Compare architectural efficiency, diffusion transformer benchmarks, photo editing flexibility, and deployment economics.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                Try Qwen Image Editor Free
              </Link>
              <Link
                href={getLinkHref(locale, 'generator')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-slate-500 transition-all"
              >
                Online Generator
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Quality & Cost Comparison Table</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Direct benchmark across visual quality, memory footprint, and editing versatility.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-200 font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Evaluation Factor</th>
                    <th scope="col" className="px-6 py-4 text-cyan-400 font-bold">Qwen Image 2.1</th>
                    <th scope="col" className="px-6 py-4 text-slate-300">Flux.1 (Dev/Schnell)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{row.metric}</td>
                      <td className="px-6 py-4 text-cyan-300 font-medium">{row.qwen}</td>
                      <td className="px-6 py-4 text-slate-400">{row.flux}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Detailed Analysis Content */}
        <section className="py-16 border-b border-slate-900 bg-slate-950/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                1. Text-to-Image Generation & DiT Architecture
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Both <strong>Qwen Image 2.1</strong> and <strong>Flux.1</strong> represent modern Diffusion Transformers (DiTs). While Flux is renowned for its 12-billion parameter capacity and rich skin textures, Qwen Image achieves comparable visual fidelity with significantly leaner compute requirements.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                In addition, Qwen Image offers deeper multimodal integration. Because it connects directly with Alibaba’s Qwen LLM encoders, it handles intricate multi-character scenes, spatial directions (&quot;to the left of&quot;, &quot;behind&quot;), and precise color assignments with greater consistency.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                2. Real-Time Editing vs Heavy Pipeline Workflows
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                A decisive advantage of Qwen Image is its native image editing architecture. While Flux users must install ComfyUI, load separate inpainting checkpoints, and manually draw masks, <Link href={getLinkHref(locale, '')} className="text-indigo-400 hover:underline">Qwen Image Editor</Link> operates natively from conversational instructions. You upload a photo, specify edits, and receive seamless adjustments in seconds.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                3. Deployment Costs & Enterprise Economics
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Hosting Flux.1 Dev requires high-end A100 or H100 GPUs with massive VRAM overhead, driving up cloud infrastructure budgets. Qwen Image 2.1 can be served cost-effectively on consumer and standard enterprise GPUs (such as RTX 4090 or L4), reducing inference expenses by over 40% while doubling generation throughput.
              </p>
            </article>
          </div>
        </section>

        {/* Related Comparisons Module */}
        <section className="py-14 border-b border-slate-900 bg-slate-950/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-xl font-bold text-white">Related Comparisons & Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href={getLinkHref(locale, 'vs-midjourney')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-indigo-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Qwen Image 2.1 vs Midjourney →
                </div>
                <p className="text-xs text-slate-400 mt-1">Image quality, text rendering, and pricing breakdown.</p>
              </Link>
              <Link
                href={getLinkHref(locale, 'vs-nano-banana')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-purple-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Qwen Image 2.1 vs Nano Banana →
                </div>
                <p className="text-xs text-slate-400 mt-1">Speed, parameters, and edge hardware efficiency.</p>
              </Link>
              <Link
                href={getLinkHref(locale, 'generator')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-cyan-400 font-semibold mb-1">Tool</div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Qwen Image Generator →
                </div>
                <p className="text-xs text-slate-400 mt-1">Generate stunning visuals from text online.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Comparison FAQ
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-100 hover:text-cyan-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        faqOpen[idx] ? 'rotate-180 text-cyan-400' : ''
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

      <Footer locale={locale} page="vs-flux" />
    </div>
  );
}
