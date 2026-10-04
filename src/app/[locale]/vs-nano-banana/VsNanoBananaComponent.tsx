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

export default function VsNanoBananaComponent({ locale = 'en' }: { locale?: string }) {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });

  const tableData = [
    { metric: 'Model Size & Parameters', qwen: '7 Billion Unified Vision-Language', nano: 'Compact Edge Model (~1-2B)' },
    { metric: 'Target Use Case', qwen: 'Enterprise Quality & Precise Editing', nano: 'Ultra-low Latency & Mobile Edge' },
    { metric: 'Text & Typography Rendering', qwen: 'Industry Benchmark (Full accuracy)', nano: 'Basic (Prone to distortion)' },
    { metric: 'Complex Prompt Comprehension', qwen: 'Multimodal LLM understanding', nano: 'Basic CLIP keyword matching' },
    { metric: 'Inference Speed', qwen: 'Fast on Cloud GPUs (~2-4s)', nano: 'Ultra-fast on Edge hardware (<1s)' },
    { metric: 'Hardware / VRAM Requirement', qwen: '8GB - 16GB VRAM optimal', nano: '2GB - 4GB VRAM or mobile NPU' },
    { metric: 'Instruction-Based Editing', qwen: 'Full inpainting & object editing', nano: 'Limited to generation only' },
  ];

  const faqItems = [
    {
      q: 'What is the main difference between Qwen Image 2.1 and Nano Banana?',
      a: 'Qwen Image 2.1 is a high-capacity foundation model with 7 billion parameters, excelling in high-fidelity photorealism, text rendering, and direct conversational editing. Nano Banana is an experimental lightweight architecture optimized for edge devices and mobile inference at the expense of intricate detail and editing versatility.',
    },
    {
      q: 'Which model should I use for graphic design and commercial ads?',
      a: 'Qwen Image 2.1 is the clear winner for design and commercial work due to its reliable typography generation, sharp details, and support for inpainting. Nano Banana is better suited for real-time mobile AR filters or casual on-device drafts.',
    },
    {
      q: 'Can Qwen Image 2.1 run on consumer GPUs?',
      a: 'Yes, quantized versions (FP8 and INT4) of Qwen Image run smoothly on consumer graphics cards with 12GB to 16GB VRAM, or you can access it instantly in the cloud via Qwen Image Editor without any hardware burden.',
    },
    {
      q: 'How does prompt understanding compare?',
      a: 'Qwen Image leverages extensive multimodal training from Alibaba’s Qwen LLM family, allowing it to parse nuanced spatial relationships, negation, and complex multi-subject interactions. Nano Banana relies on smaller text encoders with narrower semantic comprehension.',
    },
    {
      q: 'Does Nano Banana support image-to-image editing?',
      a: 'Nano Banana primarily supports basic text-to-image synthesis. Qwen Image 2.1 provides comprehensive image-to-image editing, inpainting, and character consistency workflows.',
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Qwen Image 2.1 vs Nano Banana — Full Comparison',
        description:
          'Compare Qwen Image 2.1 vs Nano Banana in detail. Explore inference speed, hardware requirements, image quality, character consistency, and production readiness.',
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
        page="vs-nano-banana"
        title="Qwen Image 2.1 vs Nano Banana — Full Comparison"
        description="Compare Qwen Image 2.1 vs Nano Banana in detail. Explore inference speed, hardware requirements, image quality, character consistency, and production readiness."
        image="/images/model_compare_demo.jpg"
        schemaData={schemaData}
      />

      <Header locale={locale} page="vs-nano-banana" />

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-900">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              <ArrowsRightLeftIcon className="w-4 h-4 text-purple-400" />
              <span>Architecture & Speed Benchmark</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qwen Image 2.1 vs Nano Banana — Full Comparison
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Evaluating heavy-duty multimodal capability vs compact edge generation. Find out which visual architecture fits your technical infrastructure and design objectives.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href={getLinkHref(locale, '')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                Launch Qwen Image Editor
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Specification Comparison Table</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Comparing architecture scale, VRAM footprints, and generative accuracy.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-200 font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Dimension</th>
                    <th scope="col" className="px-6 py-4 text-purple-400 font-bold">Qwen Image 2.1</th>
                    <th scope="col" className="px-6 py-4 text-slate-300">Nano Banana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{row.metric}</td>
                      <td className="px-6 py-4 text-purple-300 font-medium">{row.qwen}</td>
                      <td className="px-6 py-4 text-slate-400">{row.nano}</td>
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
                1. Architectural Scale & Parameter Capacity
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                The primary divergence between <strong>Qwen Image 2.1</strong> and <strong>Nano Banana</strong> lies in design philosophy. Qwen Image utilizes a 7B unified multimodal visual transformer that treats pixels and tokens with equivalent syntactic importance. This large parameter budget allows the network to remember intricate anatomical structures, natural lighting nuances, and textual spelling.
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Nano Banana, conversely, prioritizes extreme parameter pruning to target mobile chips and low-end hardware. While its generation speeds on constrained hardware are notable, it struggles with complex multi-object compositions and spatial fidelity.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                2. Real-World Production Readiness
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                For commercial teams developing marketing campaigns, merchandise lines, and interactive web tools, reliability is non-negotiable. Qwen Image 2.1 provides stable cloud execution via scalable GPU clusters, producing publication-ready assets on demand. Furthermore, its unique capacity for inpainting makes post-generation iteration seamless inside <Link href={getLinkHref(locale, '')} className="text-indigo-400 hover:underline">Qwen Image Editor</Link>.
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
                href={getLinkHref(locale, 'vs-flux')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-indigo-400 font-semibold mb-1">Benchmark</div>
                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Qwen Image 2.1 vs Flux →
                </div>
                <p className="text-xs text-slate-400 mt-1">Quality, VRAM cost, and generation speed.</p>
              </Link>
              <Link
                href={getLinkHref(locale, '')}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="text-xs text-purple-400 font-semibold mb-1">Tool</div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Qwen Image Editor Online →
                </div>
                <p className="text-xs text-slate-400 mt-1">Free online inpainting and photo transformation.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-100 hover:text-purple-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        faqOpen[idx] ? 'rotate-180 text-purple-400' : ''
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

      <Footer locale={locale} page="vs-nano-banana" />
    </div>
  );
}
